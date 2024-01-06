import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text', { nullable: true })
    firstName: string

    @Column('text', { nullable: true })
    lastName: string

    @Column('text', { unique: true })
    username: string

    @Column('text')
    password: string

    @Column('boolean', { nullable: true })
    active: boolean

    @Column('boolean', { default: false })
    production: boolean
}
