import { Schema, model } from "mongoose"

export interface IPasswordRecovery {
    _id:string,
    userId:string,
    expiration:number
}

const passwordRecoverySchema = new Schema<IPasswordRecovery>({
    _id:{ type:String, required:true, immutable:true },
    userId:{ type:String, required:true, immutable:true },
    expiration:{ type:Number, required:true }
})

export const PasswordRecovery = model<IPasswordRecovery>('passwordRecovery', passwordRecoverySchema)