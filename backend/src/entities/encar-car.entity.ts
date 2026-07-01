import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('encar_cars')
export class EncarCar {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'donor_inner_id', nullable: true })
  donor_inner_id: string | null;

  @Column('text', { nullable: true })
  vin: string | null;

  @Column('text', { name: 'vehicle_no', nullable: true })
  vehicle_no: string | null;

  @Column('text', { nullable: true })
  brand: string | null;

  @Column('text', { nullable: true })
  model: string | null;

  @Column('integer', { nullable: true })
  price: number | null;

  @Column('integer', { nullable: true })
  mileage: number | null;

  @Column('integer', { nullable: true })
  year: number | null;

  @Column('text', { nullable: true })
  fuel: string | null;

  @Column('text', { nullable: true })
  transmission: string | null;

  @Column('text', { name: 'body_type', nullable: true })
  body_type: string | null;

  @Column('text', { nullable: true })
  color: string | null;

  @Column('text', { name: 'interior_color', nullable: true })
  interior_color: string | null;

  @Column('integer', { nullable: true })
  displacement: number | null;

  @Column('integer', { name: 'seat_count', nullable: true })
  seat_count: number | null;

  @Column('boolean', { name: 'has_accidents', nullable: true })
  has_accidents: boolean | null;

  @Column('integer', { name: 'accident_count', nullable: true })
  accident_count: number | null;

  @Column('boolean', { name: 'has_repairs', nullable: true })
  has_repairs: boolean | null;

  @Column('boolean', { name: 'has_painting', nullable: true })
  has_painting: boolean | null;

  @Column('integer', { name: 'repairs_total_cost', nullable: true })
  repairs_total_cost: number | null;

  @Column('boolean', { name: 'has_waterlog', nullable: true })
  has_waterlog: boolean | null;

  @Column('integer', { name: 'owner_changes_count', nullable: true })
  owner_changes_count: number | null;

  @Column('text', { name: 'date_car_registration', nullable: true })
  date_car_registration: string | null;

  @Column('text', { name: 'date_post_created', nullable: true })
  date_post_created: string | null;

  @Column('text', { name: 'date_post_updated', nullable: true })
  date_post_updated: string | null;

  @Column('json', { nullable: true })
  photos: string[] | null;

  @Column('json', { nullable: true })
  options: Record<string, unknown> | null;

  @Column('json', { nullable: true })
  diagnosis: Record<string, unknown> | null;

  @Column('json', { nullable: true })
  inspection: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
