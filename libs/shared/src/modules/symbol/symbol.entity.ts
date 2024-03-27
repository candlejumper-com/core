import { Column, CreateDateColumn, Entity, EntitySchema, EntitySchemaOptions, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { BrokerEntity } from "../broker/broker.entity";

@Entity({ name: 'symbols' })
export class SymbolEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column('text', { nullable: false })
    name: string

    @OneToOne(() => BrokerEntity)
    broker: BrokerEntity

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}