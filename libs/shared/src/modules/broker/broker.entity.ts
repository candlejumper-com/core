import { Column, CreateDateColumn, Entity, EntitySchema, EntitySchemaOptions, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity({ name: 'brokers' })
export class BrokerEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column('text', { nullable: false })
    name: string

    @Column('text', { nullable: false })
    data: string

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
