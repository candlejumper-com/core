import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export interface IWallet {
    id?: number
    address: string
    filename: string
    gitUrl?: string
    chain?: string
    privateKey: string
    fileContent?: string
    balanceBNB?: number
    balanceETH?: number
    lastTransaction?: Date
    lastCheck?: Date
    version: number
}

@Entity({ name: 'brokers' })
export class BrokerEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    data: string

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
