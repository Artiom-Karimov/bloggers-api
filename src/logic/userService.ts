import UserRepository from "../data/repositories/userRepository"
import UserModel, { UserInputModel } from "./models/userModel"
import DateGenerator from "./utils/dateGenerator"
import Hasher from "./utils/hasher"
import { generateId } from "./utils/idGenerator"
import jwt from 'jsonwebtoken'
import * as config from '../config/config'

export default class UserService {
    private readonly repo: UserRepository

    constructor() {
        this.repo = new UserRepository()
    }
    public async get(id:string): Promise<UserModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:UserInputModel): Promise<string|undefined> {
        const [passwordHash, salt] = await Hasher.hash(data.password)
        const newUser = new UserModel(
            generateId(), 
            data.login,
            data.email, 
            DateGenerator.generate(),
            passwordHash,
            salt)
        const createdId =  await this.repo.create(newUser)
        return createdId ?? undefined
    }
    public async authenticate(login: string, password: string): Promise<string|undefined> {
        const user = await this.repo.getByLogin(login)
        if(!user) return undefined
        if(!await Hasher.check(password,user.passwordHash,user.salt))
            return undefined
        return jwt.sign({userId:user.id},config.jwtSecret,{expiresIn:config.jwtExpire})
    }
    public async getIdFromToken(token:string): Promise<string|undefined> {
        try {
            const result: any = jwt.verify(token,config.jwtSecret)
            return result.userId
        } catch {
            return undefined
        }
    }
    public async delete(id:string): Promise<boolean> {
        return this.repo.delete(id)
    }
}