import { Column, CreateDateColumn, Entity, EntitySchema, EntitySchemaOptions, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity({ name: 'brokers' })
export class BrokerEntity {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column('text', { unique: true, nullable: false })
    name: string

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
