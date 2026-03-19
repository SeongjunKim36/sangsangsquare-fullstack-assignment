import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Application } from "./application.entity";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  userId: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", nullable: true })
  password?: string;

  @Column({ type: "text", default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
  }
}
