import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  deviceId!: number;

  @CreateDateColumn()
  startTime!: Date;

  @Column({ nullable: true, type: 'datetime' })
  endTime?: Date;

  @Column({ type: 'varchar', default: 'OFF', length: 20 })
  targetStatus!: string;

  @Column({ type: 'varchar', default: 'OFF', length: 20 })
  actualStatus!: string;

  @Column({ type: 'float', default: 0.0 })
  currentAmp!: number;

  @Column({ type: 'float', default: 0.0 })
  maxAmp!: number;

  @Column({ type: 'varchar', default: 'standby', length: 20 })
  status!: string;

  @Column({ type: 'text', default: '[]' })
  ampHistory!: string;
}