import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  deviceType!: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  location?: string;

  @Column({ default: 'standby', type: 'varchar', length: 20 })
  status!: string;

  @Column({ type: 'float', default: 0.5 })
  ampThreshold!: number;

  @Column({ type: 'integer', default: 5 })
  autoStopSeconds!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}