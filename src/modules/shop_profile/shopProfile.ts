import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn
} from 'typeorm';

@Entity('shopProfiles')
export class ShopProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', default: 'Laundry Shop', length: 100 })
  name!: string;

  @Column({ type: 'varchar', default: '', length: 200 })
  tagline!: string;

  @Column({ type: 'text', default: '' })
  address!: string;

  @Column({ type: 'varchar', default: '', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', default: '', length: 100 })
  email!: string;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  logoUrl?: string;

  @Column({ type: 'varchar', default: 'IDR', length: 10 })
  currency!: string;

  @Column({ type: 'float', default: 166.67 })
  defaultWasherRatePerMinute!: number;

  @Column({ type: 'float', default: 200.0 })
  defaultDryerRatePerMinute!: number;

  @Column({ type: 'varchar', default: '08:00', length: 5 })
  openingTime!: string;

  @Column({ type: 'varchar', default: '22:00', length: 5 })
  closingTime!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'integer', nullable: true })
  updatedBy?: number;
}