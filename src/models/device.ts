import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  current1!: string;

  @Column({ type: 'varchar' })
  current2!: string;

  @Column({ type: 'varchar' })
  startedAt!: string;

  @Column({ type: 'varchar' })
  stoppedAt!: string;
}