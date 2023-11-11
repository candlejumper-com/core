import passport from 'passport'
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import * as jwt from 'jsonwebtoken'
import { System } from "../../system/system"
import { logger } from "@candlejumper/shared"
import { User } from "./user.entity"

export interface IUser {
    id: number
    username: string
    password: string
    brokerAPIKey: string
    brokerAPISecret: string
    production?: boolean
}   

export class UserManager {

    user: User

    constructor(public system: System) { }

    async init(): Promise<void> {
        this.setPassportStrategies()
        await this.setActive()
    }

    // TODO: ??????
    async setActive() {
        const UserRepo = this.system.db.connection.getRepository(User)
        this.user = await UserRepo.findOne({ where: { active: true } })
    }

    async find(params: IUser): Promise<User> {
        const UserRepo = this.system.db.connection.getRepository(User)
        UserRepo.findOne({ where: { active: true } })
        return {} as any
    }

    async create(params: IUser): Promise<User> {
        delete params.id

        const UserRepo = this.system.db.connection.getRepository(User)
        const user = UserRepo.create(params)
        const results = await UserRepo.save(user)

        return results
    }

    async onUserSwitch() {

    }

    getUserFromToken(token: string): any {
        const jwtSecret = this.system.configManager.config.security.jwtSecret
        const result = jwt.verify(token, jwtSecret)
        return result
    }

    private setPassportStrategies(): void {
        const UserRepo = this.system.db.connection.getRepository(User)
        const jwtSecret = this.system.configManager.config.security.jwtSecret

        // registrate login method
        passport.use(new LocalStrategy(async (username: string, password: string, next: Function) => {
            const user = await UserRepo.findOne({ where: { username, password } })

            if (!user) {
                return next(null, false)
            }

            if (this.user !== user) {
                setTimeout(() => this.onUserSwitch())

            }

            this.user = user

            next(null, { id: user.id, username: user.username, production: user.production })
        }))

        passport.serializeUser((user, cb) => cb(null, user))
        passport.deserializeUser((obj, cb) => cb(null, obj))

        // on check
        passport.use(new JWTStrategy({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: jwtSecret }, async (jwtPayload, next) => {
            const user = await UserRepo.findOne({ where: { id: jwtPayload.id } })

            if (!user) {
                return next(null, false)
            }

            this.user = user
            this.onUserSwitch()

            next(null, user)
        }))
    }
}



