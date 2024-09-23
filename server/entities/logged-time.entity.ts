import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Worker } from "./worker.entity";
import { Task } from "./task.entity";

@Entity({ name: "logged_time" })
export class LoggedTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time_seconds: number;

  @ManyToOne(() => Worker, (worker) => worker.loggedTimes)
  @JoinColumn({ name: 'worker_id' })
  worker: Worker;

  @ManyToOne(() => Task, (task) => task.loggedTimes)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
