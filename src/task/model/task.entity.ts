import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, MaxLength } from 'class-validator';
import { BaseEntity } from '../../core/base/entity/base.entity';

@Entity()
export class Task extends BaseEntity {

  @PrimaryGeneratedColumn()
  readonly id?: number;

  @IsString()
  @MaxLength(50)
  @Column({ length: 50 })
  readonly label: string;

  @IsString()
  @MaxLength(500)
  @Column({ length: 500 })
  readonly description: string;
}