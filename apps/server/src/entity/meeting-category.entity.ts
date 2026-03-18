import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Meeting } from "./meeting.entity";

@Entity("meeting_categories")
export class MeetingCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  key: string;

  @Column({ type: "text" })
  label: string;

  @Column({ type: "integer", default: 0 })
  sortOrder: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @OneToMany(() => Meeting, (meeting) => meeting.category)
  meetings: Meeting[];
}
