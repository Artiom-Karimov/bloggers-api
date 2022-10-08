import UserModel, { AccountData, UserInputModel } from "../models/userModel";
import DateGenerator from "./dateGenerator";
import EmailConfirmationFactory from "./emailConfirmationFactory";
import Hasher from "./hasher";
import { generateId } from "./idGenerator";

export default class UserFactory {
    public static async create(data:UserInputModel): Promise<UserModel> {
        const accountData = await UserFactory.getAccountData(data)
        return new UserModel(
            generateId(), 
            accountData,
            EmailConfirmationFactory.getNew()
        )
    }

    private static async getAccountData(data:UserInputModel): Promise<AccountData> {
        const [passwordHash, salt] = await Hasher.hash(data.password)
        return {
            login:data.login,
            email:data.email,
            passwordHash:passwordHash,
            salt:salt,
            createdAt: DateGenerator.generate()
        }
    }
}