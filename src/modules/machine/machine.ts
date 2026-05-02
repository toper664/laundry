import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  machineType!: string;

  @Column({ type: 'uuid', length: 50 })
  uuid!: string;

  @Column({ default: 'OFF', type: 'varchar', length: 10 })
  status!: string;

  @Column({ type: 'float', default: 0.5 })
  current!: number;

  @Column({ type: 'integer', default: 220 })
  voltage!: number;

  @Column({ type: 'float', default: 0 })
  power!: number;
}