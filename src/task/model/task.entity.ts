import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString } from 'class-validator';

@Entity()
export class Task {

  @PrimaryGeneratedColumn()
  readonly id?: number;

  @IsString()
  @Column({ length: 50 })
  readonly label: string;

  @IsString()
  @Column({ length: 500 })
  readonly description: string;
}