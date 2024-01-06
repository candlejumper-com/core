import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm"

@Entity()
export class DeviceEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text', { nullable: false })
    token: string
}
