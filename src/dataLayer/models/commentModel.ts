import { Schema, model } from 'mongoose'

export interface IComment {
    _id: string
    postId: string
    userId: string
    userLogin: string
    content: string
    createdAt: string
}

const commentSchema = new Schema<IComment>({
    _id:{ type:String, required:true, immutable:true },
    postId: { type:String, required:true },
    userId: { type:String, required:true },
    userLogin: { type:String, required:true },
    content: { type:String, required:true, minlength:20, maxLength:300 },
    createdAt:{ type:String, required:true, immutable:true }
})

export const Comment = model<IComment>('comments',commentSchema)