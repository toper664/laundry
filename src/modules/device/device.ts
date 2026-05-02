import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryColumn({ type: 'uuid', length: 50 })
  uuid!: string;

  @Column({ type: 'varchar', length: 20 })
  deviceId!: string;

  @Column({ type: 'varchar', length: 100 })
  devKey!: string;

  @Column({ default: 'esp32', type: 'varchar', length: 20 })
  deviceType!: string;

  @Column({ type: 'text', default: '[]' })
  permissions!: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  location?: string | null;

  @Column({ default: 'online', type: 'varchar', length: 10 })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;
}