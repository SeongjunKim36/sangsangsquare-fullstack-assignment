import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/modules/app.module";
import { DataSource } from "typeorm";

describe("Transaction & Concurrency Tests (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    app.setGlobalPrefix("api");

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Application Status Update with Pessimistic Lock", () => {
    let meetingId: number;
    let applicationIds: number[];

    beforeEach(async () => {
      await dataSource.query("DELETE FROM applications");
      await dataSource.query("DELETE FROM meetings");

      const createResponse = await request(app.getHttpServer())
        .post("/api/admin/meetings")
        .send({
          type: "RECORD",
          title: "동시성 테스트 모임",
          description: "정원 2명 - Race Condition 테스트",
          capacity: 2,
          announcementAt: "2026-03-20T00:00:00.000Z",
        })
        .expect(201);

      meetingId = createResponse.body.meetingId;
      expect(meetingId).toBeDefined();
      applicationIds = [];

      for (let i = 1; i <= 3; i++) {
        const applyResponse = await request(app.getHttpServer())
          .post(`/api/meetings/${meetingId}/applications`)
          .send({
            applicantId: `test-user-${i}`,
            applicantName: `테스터${i}`,
          })
          .expect(201);

        applicationIds.push(applyResponse.body.applicationId);
      }

      expect(applicationIds).toHaveLength(3);

      await dataSource.query(
        "UPDATE meetings SET announcementAt = '2026-03-14 00:00:00.000' WHERE id = ?",
        [meetingId]
      );
    });

    it("should prevent capacity overflow with pessimistic lock", async () => {
      const promises = applicationIds.map((appId) =>
        request(app.getHttpServer())
          .patch(`/api/admin/applications/${appId}/status`)
          .send({ status: "SELECTED" })
      );

      const results = await Promise.all(promises);

      results.forEach((res, idx) => {
        console.log(`Result ${idx}: status=${res.status}, body=`, res.body);
      });

      const successCount = results.filter((res) => res.status === 200).length;
      const failedCount = results.filter((res) => res.status === 400).length;

      expect(successCount).toBe(2);
      expect(failedCount).toBe(1);

      const failedResponse = results.find((res) => res.status === 400);
      expect(failedResponse.body.message).toContain("정원");
    });

    it("should handle sequential selections correctly", async () => {
      const firstResult = await request(app.getHttpServer())
        .patch(`/api/admin/applications/${applicationIds[0]}/status`)
        .send({ status: "SELECTED" });

      expect(firstResult.status).toBe(200);

      const secondResult = await request(app.getHttpServer())
        .patch(`/api/admin/applications/${applicationIds[1]}/status`)
        .send({ status: "SELECTED" });

      expect(secondResult.status).toBe(200);

      const thirdResult = await request(app.getHttpServer())
        .patch(`/api/admin/applications/${applicationIds[2]}/status`)
        .send({ status: "SELECTED" });

      expect(thirdResult.status).toBe(400);
      expect(thirdResult.body.message).toContain("정원");
    });

    it("should allow rejection without capacity check", async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/applications/${applicationIds[0]}/status`)
        .send({ status: "SELECTED" });

      await request(app.getHttpServer())
        .patch(`/api/admin/applications/${applicationIds[1]}/status`)
        .send({ status: "SELECTED" });

      const rejectResult = await request(app.getHttpServer())
        .patch(`/api/admin/applications/${applicationIds[2]}/status`)
        .send({ status: "REJECTED" });

      expect(rejectResult.status).toBe(200);
      expect(rejectResult.body.status).toBe("REJECTED");
    });
  });
});
