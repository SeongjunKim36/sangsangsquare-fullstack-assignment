import { Test, TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import type { Express } from "express";
import * as request from "supertest";
import { AppModule } from "../src/modules/app.module";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { middleware } from "../src/modules/app.middleware";

type CreateMeetingResponse = {
  meetingId: number;
};

type ApplyToMeetingResponse = {
  applicationId: number;
};

type UpdateApplicationResponse = {
  status: string;
  message: string;
};

describe("Transaction & Concurrency Tests (e2e)", () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  let httpApp: Express;
  let adminCookie: string[];
  let userCookies: string[][];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    middleware(app);

    await app.init();

    httpApp = app.getHttpAdapter().getInstance();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("Application Status Update with Pessimistic Lock", () => {
    let meetingId: number;
    let applicationIds: number[];

    beforeEach(async () => {
      await dataSource.query("DELETE FROM applications");
      await dataSource.query("DELETE FROM meetings");
      await dataSource.query("DELETE FROM users");
      await dataSource.query("DELETE FROM meeting_categories");

      await dataSource.query(
        `INSERT INTO meeting_categories (key, label, sortOrder, isActive, createdAt, updatedAt)
         VALUES
         ('BOOK', '독서', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ('EXERCISE', '운동', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ('RECORD', '기록', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ('ENGLISH', '영어', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );

      const adminPassword = await bcrypt.hash("admin123", 10);
      const userPassword = await bcrypt.hash("user123", 10);

      await dataSource.query(
        `INSERT INTO users (userId, name, password, role, createdAt, updatedAt)
         VALUES
         (?, ?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         (?, ?, ?, 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         (?, ?, ?, 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         (?, ?, ?, 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          "admin",
          "관리자",
          adminPassword,
          "user1",
          "테스트유저1",
          userPassword,
          "user2",
          "테스트유저2",
          userPassword,
          "user3",
          "테스트유저3",
          userPassword,
        ]
      );

      adminCookie = await loginAndGetCookie(httpApp, "admin", "admin123");
      userCookies = [
        await loginAndGetCookie(httpApp, "user1", "user123"),
        await loginAndGetCookie(httpApp, "user2", "user123"),
        await loginAndGetCookie(httpApp, "user3", "user123"),
      ];

      const createResponse = await request(httpApp)
        .post("/api/admin/meetings")
        .set("Cookie", adminCookie)
        .send({
          type: "RECORD",
          title: "동시성 테스트 모임",
          description: "정원 2명 - Race Condition 테스트",
          capacity: 2,
          announcementAt: "2026-03-20T00:00:00.000Z",
        })
        .expect(201);

      const createBody = createResponse.body as CreateMeetingResponse;

      meetingId = createBody.meetingId;
      expect(meetingId).toBeDefined();
      applicationIds = [];

      for (const userCookie of userCookies) {
        const applyResponse = await request(httpApp)
          .post(`/api/meetings/${meetingId}/applications`)
          .set("Cookie", userCookie)
          .expect(201);

        const applyBody = applyResponse.body as ApplyToMeetingResponse;

        applicationIds.push(applyBody.applicationId);
      }

      expect(applicationIds).toHaveLength(3);

      await dataSource.query(
        "UPDATE meetings SET announcementAt = '2026-03-14 00:00:00.000' WHERE id = ?",
        [meetingId]
      );
    });

    it("should prevent capacity overflow with pessimistic lock", async () => {
      const promises = applicationIds.map((appId) =>
        request(httpApp)
          .patch(`/api/admin/meetings/${meetingId}/applications/${appId}`)
          .set("Cookie", adminCookie)
          .send({ status: "SELECTED" })
      );

      const results = await Promise.all(promises);

      const successCount = results.filter((res) => res.status === 200).length;
      const failedCount = results.filter((res) => res.status === 400).length;

      expect(successCount).toBe(2);
      expect(failedCount).toBe(1);

      const failedResponse = results.find((res) => res.status === 400);
      expect(failedResponse).toBeDefined();

      const failedBody = failedResponse?.body as UpdateApplicationResponse;
      expect(failedBody.message).toContain("정원");
    });

    it("should handle sequential selections correctly", async () => {
      const firstResult = await request(httpApp)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[0]}`)
        .set("Cookie", adminCookie)
        .send({ status: "SELECTED" });

      expect(firstResult.status).toBe(200);

      const secondResult = await request(httpApp)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[1]}`)
        .set("Cookie", adminCookie)
        .send({ status: "SELECTED" });

      expect(secondResult.status).toBe(200);

      const thirdResult = await request(httpApp)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[2]}`)
        .set("Cookie", adminCookie)
        .send({ status: "SELECTED" });

      expect(thirdResult.status).toBe(400);

      const thirdBody = thirdResult.body as UpdateApplicationResponse;
      expect(thirdBody.message).toContain("정원");
    });

    it("should allow rejection without capacity check", async () => {
      await request(httpApp)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[0]}`)
        .set("Cookie", adminCookie)
        .send({ status: "SELECTED" });

      await request(httpApp)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[1]}`)
        .set("Cookie", adminCookie)
        .send({ status: "SELECTED" });

      const rejectResult = await request(httpApp)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[2]}`)
        .set("Cookie", adminCookie)
        .send({ status: "REJECTED" });

      expect(rejectResult.status).toBe(200);

      const rejectBody = rejectResult.body as UpdateApplicationResponse;
      expect(rejectBody.status).toBe("REJECTED");
    });
  });
});

async function loginAndGetCookie(
  httpApp: Express,
  userId: string,
  password: string
): Promise<string[]> {
  const response = await request(httpApp)
    .post("/api/auth/login")
    .send({ userId, password })
    .expect(200);

  const cookies = response.headers["set-cookie"];
  expect(Array.isArray(cookies)).toBe(true);

  if (!Array.isArray(cookies)) {
    throw new Error("로그인 세션 쿠키를 찾을 수 없습니다.");
  }

  return cookies;
}
