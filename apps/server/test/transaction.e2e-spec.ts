import { Test, TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
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

type MeetingDetailResponse = {
  id: number;
  canApply: boolean;
  announcementPassed: boolean;
  myApplicationStatus: string | null;
  myApplication: {
    applicationId: number;
    applicantName: string;
    status: string;
    appliedAt: string;
  } | null;
};

type MeetingListResponse = {
  id: number;
  title: string;
  announcementPassed: boolean;
};

type MyApplicationResponse = {
  applicationId: number;
  meetingId: number;
  announcementPassed: boolean;
  status: string;
};

type SeededCookies = {
  admin: string[];
  user1: string[];
  user2: string[];
  user3: string[];
};

const TEST_DATABASE_PATH = join(process.cwd(), "data", `assignment.e2e.${process.pid}.sqlite`);

process.env["NODE_ENV"] = "test";
process.env["DATABASE_PATH"] = TEST_DATABASE_PATH;

describe("Meeting Application Flow (e2e)", () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  let httpServer: ReturnType<NestExpressApplication["getHttpServer"]>;

  beforeEach(async () => {
    cleanupTestDatabaseFiles();

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

    httpServer = app.getHttpServer();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }

    cleanupTestDatabaseFiles();
  });

  describe("Application Status Update with Pessimistic Lock", () => {
    let meetingId: number;
    let applicationIds: number[];
    let cookies: SeededCookies;

    beforeEach(async () => {
      await resetDatabase(dataSource);
      cookies = await seedBaseData(httpServer, dataSource);

      const createResponse = await createMeeting(httpServer, cookies.admin, {
        type: "RECORD",
        title: "동시성 테스트 모임",
        description: "정원 2명 - Race Condition 테스트",
        capacity: 2,
        announcementAt: getRelativeIsoDate(1),
      });

      meetingId = createResponse.meetingId;
      applicationIds = [];

      for (const userCookie of [cookies.user1, cookies.user2, cookies.user3]) {
        const applyResponse = await applyToMeeting(httpServer, userCookie, meetingId);
        applicationIds.push(applyResponse.applicationId);
      }

      expect(applicationIds).toHaveLength(3);

      await setMeetingAnnouncementAt(dataSource, meetingId, createRelativeDate(-1));
    });

    it("should prevent capacity overflow with pessimistic lock", async () => {
      const promises = applicationIds.map((applicationId) =>
        request(httpServer)
          .patch(`/api/admin/meetings/${meetingId}/applications/${applicationId}`)
          .set("Cookie", cookies.admin)
          .send({ status: "SELECTED" })
      );

      const results = await Promise.all(promises);

      const successCount = results.filter((response) => response.status === 200).length;
      const failedCount = results.filter((response) => response.status === 400).length;

      expect(successCount).toBe(2);
      expect(failedCount).toBe(1);

      const failedResponse = results.find((response) => response.status === 400);
      expect(failedResponse).toBeDefined();

      const failedBody = failedResponse?.body as UpdateApplicationResponse;
      expect(failedBody.message).toContain("정원");
    });

    it("should handle sequential selections correctly", async () => {
      const firstResult = await request(httpServer)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[0]}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" });

      expect(firstResult.status).toBe(200);

      const secondResult = await request(httpServer)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[1]}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" });

      expect(secondResult.status).toBe(200);

      const thirdResult = await request(httpServer)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[2]}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" });

      expect(thirdResult.status).toBe(400);

      const thirdBody = thirdResult.body as UpdateApplicationResponse;
      expect(thirdBody.message).toContain("정원");
    });

    it("should allow rejection without capacity check", async () => {
      await request(httpServer)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[0]}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" });

      await request(httpServer)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[1]}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" });

      const rejectResult = await request(httpServer)
        .patch(`/api/admin/meetings/${meetingId}/applications/${applicationIds[2]}`)
        .set("Cookie", cookies.admin)
        .send({ status: "REJECTED" });

      expect(rejectResult.status).toBe(200);

      const rejectBody = rejectResult.body as UpdateApplicationResponse;
      expect(rejectBody.status).toBe("REJECTED");
    });
  });

  describe("User Flow", () => {
    let cookies: SeededCookies;

    beforeEach(async () => {
      await resetDatabase(dataSource);
      cookies = await seedBaseData(httpServer, dataSource);
    });

    it("should allow a user to apply once and reflect pending state in detail and my page", async () => {
      const meeting = await createMeeting(httpServer, cookies.admin, {
        type: "BOOK",
        title: "독서 테스트 모임",
        description: "사용자 신청 흐름 확인",
        capacity: 5,
        announcementAt: getRelativeIsoDate(2),
      });

      const applyResponse = await applyToMeeting(httpServer, cookies.user1, meeting.meetingId);
      expect(applyResponse.applicationId).toBeDefined();

      await request(httpServer)
        .post(`/api/meetings/${meeting.meetingId}/applications`)
        .set("Cookie", cookies.user1)
        .expect(409);

      const detailResponse = await request(httpServer)
        .get(`/api/meetings/${meeting.meetingId}`)
        .set("Cookie", cookies.user1)
        .expect(200);

      const detailBody = detailResponse.body as MeetingDetailResponse;
      expect(detailBody.canApply).toBe(false);
      expect(detailBody.announcementPassed).toBe(false);
      expect(detailBody.myApplicationStatus).toBe("PENDING");
      expect(detailBody.myApplication?.status).toBe("PENDING");

      const myApplicationsResponse = await request(httpServer)
        .get("/api/me/applications")
        .set("Cookie", cookies.user1)
        .expect(200);

      const myApplications = myApplicationsResponse.body as MyApplicationResponse[];
      expect(myApplications).toHaveLength(1);
      expect(myApplications[0]?.announcementPassed).toBe(false);
      expect(myApplications[0]?.status).toBe("PENDING");
    });

    it("should return only currently recruiting meetings in the main list", async () => {
      const openMeeting = await createMeeting(httpServer, cookies.admin, {
        type: "BOOK",
        title: "모집 중 모임",
        description: "홈 목록에 보여야 하는 모임",
        capacity: 4,
        announcementAt: getRelativeIsoDate(2),
      });

      const closedMeeting = await createMeeting(httpServer, cookies.admin, {
        type: "RECORD",
        title: "마감된 모임",
        description: "홈 목록에서 숨겨져야 하는 모임",
        capacity: 4,
        announcementAt: getRelativeIsoDate(3),
      });

      await setMeetingAnnouncementAt(dataSource, closedMeeting.meetingId, createRelativeDate(-1));

      const response = await request(httpServer)
        .get("/api/meetings")
        .set("Cookie", cookies.user1)
        .expect(200);

      const meetings = response.body as MeetingListResponse[];
      expect(meetings.map((meeting) => meeting.id)).toContain(openMeeting.meetingId);
      expect(meetings.map((meeting) => meeting.id)).not.toContain(closedMeeting.meetingId);
      expect(meetings.every((meeting) => meeting.announcementPassed === false)).toBe(true);
    });

    it("should reject meetings whose announcement date is already in the past", async () => {
      const response = await request(httpServer)
        .post("/api/admin/meetings")
        .set("Cookie", cookies.admin)
        .send({
          type: "ENGLISH",
          title: "과거 발표일 모임",
          description: "생성되면 안 되는 모임",
          capacity: 2,
          announcementAt: getRelativeIsoDate(-1),
        })
        .expect(400);

      const body = response.body as UpdateApplicationResponse;
      expect(body.message).toContain("현재 시각 이후");
    });

    it("should reject admin status updates before announcement", async () => {
      const meeting = await createMeeting(httpServer, cookies.admin, {
        type: "ENGLISH",
        title: "발표 전 처리 금지 모임",
        description: "발표일 이전에는 선정할 수 없음",
        capacity: 3,
        announcementAt: getRelativeIsoDate(2),
      });

      const application = await applyToMeeting(httpServer, cookies.user1, meeting.meetingId);

      const updateResponse = await request(httpServer)
        .patch(`/api/admin/meetings/${meeting.meetingId}/applications/${application.applicationId}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" })
        .expect(400);

      const updateBody = updateResponse.body as UpdateApplicationResponse;
      expect(updateBody.message).toContain("발표일 이전");
    });

    it("should reveal selected result to the user after the announcement date", async () => {
      const meeting = await createMeeting(httpServer, cookies.admin, {
        type: "EXERCISE",
        title: "발표 후 결과 확인 모임",
        description: "발표 이후 결과 노출 확인",
        capacity: 3,
        announcementAt: getRelativeIsoDate(2),
      });

      const application = await applyToMeeting(httpServer, cookies.user1, meeting.meetingId);

      await setMeetingAnnouncementAt(dataSource, meeting.meetingId, createRelativeDate(-1));

      await request(httpServer)
        .patch(`/api/admin/meetings/${meeting.meetingId}/applications/${application.applicationId}`)
        .set("Cookie", cookies.admin)
        .send({ status: "SELECTED" })
        .expect(200);

      const detailResponse = await request(httpServer)
        .get(`/api/meetings/${meeting.meetingId}`)
        .set("Cookie", cookies.user1)
        .expect(200);

      const detailBody = detailResponse.body as MeetingDetailResponse;
      expect(detailBody.announcementPassed).toBe(true);
      expect(detailBody.myApplicationStatus).toBe("SELECTED");
      expect(detailBody.myApplication?.status).toBe("SELECTED");

      const myApplicationsResponse = await request(httpServer)
        .get("/api/me/applications")
        .set("Cookie", cookies.user1)
        .expect(200);

      const myApplications = myApplicationsResponse.body as MyApplicationResponse[];
      expect(myApplications[0]?.announcementPassed).toBe(true);
      expect(myApplications[0]?.status).toBe("SELECTED");
    });
  });
});

async function seedBaseData(
  httpServer: ReturnType<NestExpressApplication["getHttpServer"]>,
  dataSource: DataSource
): Promise<SeededCookies> {
  await seedCategories(dataSource);
  await seedUsers(dataSource);

  return {
    admin: await loginAndGetCookie(httpServer, "admin", "admin123"),
    user1: await loginAndGetCookie(httpServer, "user1", "user123"),
    user2: await loginAndGetCookie(httpServer, "user2", "user123"),
    user3: await loginAndGetCookie(httpServer, "user3", "user123"),
  };
}

async function resetDatabase(dataSource: DataSource) {
  await dataSource.query("DELETE FROM applications");
  await dataSource.query("DELETE FROM meetings");
  await dataSource.query("DELETE FROM users");
  await dataSource.query("DELETE FROM meeting_categories");
}

async function seedCategories(dataSource: DataSource) {
  await dataSource.query(
    `INSERT INTO meeting_categories (key, label, sortOrder, isActive, createdAt, updatedAt)
     VALUES
     ('BOOK', '독서', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('EXERCISE', '운동', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('RECORD', '기록', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     ('ENGLISH', '영어', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  );
}

async function seedUsers(dataSource: DataSource) {
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
}

async function createMeeting(
  httpServer: ReturnType<NestExpressApplication["getHttpServer"]>,
  adminCookie: string[],
  body: {
    type: string;
    title: string;
    description: string;
    capacity: number;
    announcementAt: string;
  }
): Promise<CreateMeetingResponse> {
  const response = await request(httpServer)
    .post("/api/admin/meetings")
    .set("Cookie", adminCookie)
    .send(body)
    .expect(201);

  return response.body as CreateMeetingResponse;
}

async function applyToMeeting(
  httpServer: ReturnType<NestExpressApplication["getHttpServer"]>,
  userCookie: string[],
  meetingId: number
): Promise<ApplyToMeetingResponse> {
  const response = await request(httpServer)
    .post(`/api/meetings/${meetingId}/applications`)
    .set("Cookie", userCookie)
    .expect(201);

  return response.body as ApplyToMeetingResponse;
}

async function loginAndGetCookie(
  httpServer: ReturnType<NestExpressApplication["getHttpServer"]>,
  userId: string,
  password: string
): Promise<string[]> {
  const response = await request(httpServer)
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

async function setMeetingAnnouncementAt(dataSource: DataSource, meetingId: number, date: Date) {
  await dataSource.query("UPDATE meetings SET announcementAt = ? WHERE id = ?", [
    toSqliteDateTime(date),
    meetingId,
  ]);
}

function createRelativeDate(dayOffset: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(9, 0, 0, 0);
  return date;
}

function getRelativeIsoDate(dayOffset: number): string {
  return createRelativeDate(dayOffset).toISOString();
}

function toSqliteDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").replace("Z", "");
}

function cleanupTestDatabaseFiles() {
  for (const suffix of ["", "-wal", "-shm"]) {
    const filePath = `${TEST_DATABASE_PATH}${suffix}`;

    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
    }
  }
}
