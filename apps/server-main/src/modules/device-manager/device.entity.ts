import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm"

@Entity()
export class DeviceEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    token: string
}
