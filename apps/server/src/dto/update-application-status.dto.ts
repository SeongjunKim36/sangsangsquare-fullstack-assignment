import { IsIn } from "class-validator";
import { ApplicationStatus } from "../entity/application.entity";

export class UpdateApplicationStatusDto {
  @IsIn([ApplicationStatus.SELECTED, ApplicationStatus.REJECTED])
  status: ApplicationStatus.SELECTED | ApplicationStatus.REJECTED;
}
