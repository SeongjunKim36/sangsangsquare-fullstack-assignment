import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { createTypeOrmOptions, getEnvFilePath } from "../config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { MeetingsModule } from "./meetings/meetings.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: getEnvFilePath(), isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: createTypeOrmOptions }),
    AuthModule,
    UserModule,
    MeetingsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
