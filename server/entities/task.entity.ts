import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Location } from "./location.entity";
import { LoggedTime } from "./logged-time.entity";

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ default: false })
  is_complete: boolean;

  @ManyToOne(() => Location, (location) => location.tasks)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @OneToMany(() => LoggedTime, (loggedTime) => loggedTime.task)
  loggedTimes: LoggedTime[];
}
