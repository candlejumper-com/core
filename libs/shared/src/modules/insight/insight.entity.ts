import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class InsightEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  symbol: string

  @Column({ nullable: true })
  short: number

  @Column({ nullable: true })
  mid: number

  @Column({ nullable: true })
  long: number

  @Column({ default: false })
  skip: boolean

  @CreateDateColumn({ nullable: false })
  createdAt: Date

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date
}
