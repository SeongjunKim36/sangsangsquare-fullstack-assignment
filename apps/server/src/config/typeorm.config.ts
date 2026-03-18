import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";
import { User, Meeting, Application, MeetingCategory } from "../entity";
import { DATABASE_NAME, DATABASE_PATH } from "../constants/database.constant";

type PreparedDatabase = {
  prepare: (sql: string) => {
    run: () => void;
  };
};

export const createTypeOrmOptions = (): TypeOrmModuleOptions & DataSourceOptions => {
  return {
    name: DATABASE_NAME,
    type: "better-sqlite3",
    database: process.env["DATABASE_PATH"] || DATABASE_PATH,
    entities: [User, MeetingCategory, Meeting, Application],
    synchronize: true,
    logging: true,
    // better-sqlite3 전용 옵션
    enableWAL: true, // Write-Ahead Logging 활성화 (성능 향상)
    prepareDatabase: (db) => {
      const database = db as PreparedDatabase;

      // 외래 키 제약 조건 활성화
      database.prepare("PRAGMA foreign_keys = ON;").run();
      // 성능 최적화 설정
      database.prepare("PRAGMA journal_mode = WAL;").run();
      database.prepare("PRAGMA synchronous = NORMAL;").run();
    },
  };
};
