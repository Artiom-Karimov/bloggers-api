import { Schema, model } from 'mongoose'

export interface IDeviceSession {
    _id:string
    ip:string
    deviceName:string
    issuedAt:number
    expiresAt:number
    userId:string
}

const deviceSessionSchema = new Schema<IDeviceSession>({
    _id:{ type:String, required:true, immutable:true },
    ip:{ type:String, required:true, maxLength:50 },
    deviceName:{ type:String, required:true, maxLength:100 },
    issuedAt:{ type:Number, required:true },
    expiresAt:{ type:Number, required:true },
    userId:{ type:String, required:true, immutable:true }
})

export const DeviceSession = model<IDeviceSession>('deviceSessions', deviceSessionSchema)