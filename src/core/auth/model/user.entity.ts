import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  readonly id?: number;

  @Column({ length: 30 })
  @Index({ unique: true })
  readonly username: string;

  @Column()
  readonly password?: string;

  @Column('simple-array')
  readonly roles: string[];
}
