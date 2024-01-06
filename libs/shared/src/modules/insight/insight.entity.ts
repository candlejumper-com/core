import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({name: 'insight'})
export class InsightEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: false })
  symbol: string

  @Column('int', { nullable: true })
  short: number

  @Column('int', { nullable: true })
  mid: number

  @Column('int', { nullable: true })
  long: number

  @Column('boolean',{ default: false })
  skip: boolean

  @CreateDateColumn({ nullable: false })
  createdAt: Date

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date
}
