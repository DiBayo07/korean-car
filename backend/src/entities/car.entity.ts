import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cars')
export class Car {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('integer')
  price: number;

  @Column('integer')
  year: number;

  @Column('integer')
  mileage: number;

  @Column('text')
  fuel: string;

  @Column('text')
  transmission: string;

  @Column('text', { name: 'images_json' })
  images: string;

  @Column('text')
  brand: string;

  @Column('text')
  model: string;

  @Column('text', { nullable: true })
  dealer_name: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  /** Helper to get images as array */
  get imageArray(): string[] {
    try {
      return JSON.parse(this.images);
    } catch {
      return [];
    }
  }

  /** Helper to set images from array */
  set imageArray(images: string[]) {
    this.images = JSON.stringify(images);
  }
}
