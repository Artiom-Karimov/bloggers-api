import { Schema, model } from 'mongoose'
import { AccountData, EmailConfirmation } from '../../logicLayer/models/userModel'

export interface IUser {
    _id: string
    accountData: AccountData
    emailConfirmation: EmailConfirmation 
}

const userSchema = new Schema<IUser>({
    _id:{ type:String, required:true, immutable:true },
    accountData:{
        login:{ type:String, required:true, immutable:true, minLength:3, maxLength:10 },
        email:{ type:String, required:true, immutable:true },
        passwordHash:{ type:String, required:true },
        salt:{ type:String, required:true },
        createdAt:{ type:String, required:true, immutable:true }
    },
    emailConfirmation:{
        confirmed:{ type:Boolean, required:true },
        code:{ type:String, required:true },
        codeExpiration:{ type:Number, required:true }
    }
})

export const User = model<IUser>('users', userSchema)