import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Application } from "./application.entity";
import { MeetingCategory } from "./meeting-category.entity";

export enum MeetingType {
  BOOK = "BOOK",
  EXERCISE = "EXERCISE",
  RECORD = "RECORD",
  ENGLISH = "ENGLISH",
}

@Entity("meetings")
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer" })
  categoryId: number;

  @ManyToOne(() => MeetingCategory, (category) => category.meetings, {
    eager: true,
  })
  @JoinColumn({ name: "categoryId" })
  category: MeetingCategory;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "integer" })
  capacity: number;

  @Column({ type: "datetime" })
  announcementAt: Date;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.meeting)
  applications: Application[];
}
