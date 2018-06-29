import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, MaxLength } from 'class-validator';
import { BaseEntity } from '../../core/base/entity/base.entity';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Task extends BaseEntity {

  @PrimaryGeneratedColumn()
  @ApiModelPropertyOptional()
  readonly id?: number;

  @IsString()
  @MaxLength(50)
  @Column({ length: 50 })
  @ApiModelProperty()
  readonly label: string;

  @IsString()
  @MaxLength(500)
  @Column({ length: 500 })
  @ApiModelProperty()
  readonly description: string;
}