import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({ unique: true })
    username: string

    @Column()
    password: string

    @Column({ nullable: true })
    active: boolean

    @Column({ default: false })
    production: boolean
}
