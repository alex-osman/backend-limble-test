import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LoggedTime } from "./logged-time.entity";

@Entity({ name: "workers" })
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column("decimal", { precision: 5, scale: 2 })
  hourly_wage: number;

  @OneToMany(() => LoggedTime, (loggedTime) => loggedTime.worker)
  loggedTimes: LoggedTime[];
}
