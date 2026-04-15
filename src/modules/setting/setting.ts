import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 100 })
  key!: string;

  @Column({ type: 'text', nullable: true })
  value?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'integer', nullable: true })
  updatedBy?: number;
}