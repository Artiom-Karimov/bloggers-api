import UserRepository from "../data/repositories/userRepository"
import UserModel, { UserInputModel } from "./models/userModel"
import DateGenerator from "./utils/dateGenerator"
import Hasher from "./utils/hasher"
import { generateId } from "./utils/idGenerator"

export default class UserService {
    private readonly repo: UserRepository

    constructor() {
        this.repo = new UserRepository()
    }
    public async get(id:string): Promise<UserModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:UserInputModel): Promise<UserModel|undefined> {
        const [passwordHash, salt] = await Hasher.hash(data.password)
        const newUser = new UserModel(
            generateId(), 
            data.login,
            data.email, 
            DateGenerator.generate(),
            passwordHash,
            salt)
        return this.repo.create(newUser)
    }
    public async delete(id:string): Promise<boolean> {
        return this.repo.delete(id)
    }
}