import PasswordRecoveryModel from "../models/passwordRecoveryModel";

export interface PasswordRecoveryRepository {
    create(data:PasswordRecoveryModel): Promise<string|undefined>
    get(code:string): Promise<PasswordRecoveryModel|undefined>
    delete(code:string): Promise<boolean>
    deleteByUser(id:string): Promise<Boolean>
}