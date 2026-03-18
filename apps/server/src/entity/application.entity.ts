import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Meeting } from "./meeting.entity";
import { User } from "./user.entity";

export enum ApplicationStatus {
  PENDING = "PENDING",
  SELECTED = "SELECTED",
  REJECTED = "REJECTED",
}

@Entity("applications")
@Index(["meetingId", "userId"], { unique: true })
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  meetingId: number;

  @Column({ type: "integer" })
  userId: number;

  @Column({
    type: "text",
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @ManyToOne(() => Meeting, (meeting) => meeting.applications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "meetingId" })
  meeting: Meeting;

  @ManyToOne(() => User, (user) => user.applications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;
}
