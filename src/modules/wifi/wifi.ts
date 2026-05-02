import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn
} from 'typeorm';

@Entity('networks')
export class Wifi {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  bssid!: string;

  @Column({ type: 'varchar', length: 100 })
  ssid!: string;

  @Column({ type: 'integer', default: -100 })
  rssi!: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  securityType?: string;

  @Column({ type: 'text', default: '[]' })
  relatedDevices!: string;
  
  @CreateDateColumn()
  addedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}