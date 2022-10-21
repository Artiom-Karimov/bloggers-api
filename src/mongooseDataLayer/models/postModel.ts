import { Schema, model } from 'mongoose'

export interface IPost {
    _id:string 
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

const postSchema = new Schema<IPost>({
    _id:{ type:String, required:true, immutable:true },
    title:{ type:String, required:true, maxLength:30 },
    shortDescription: { type:String, required:true, maxLength:100 },
    content: { type:String, required:true, maxLength:1000 },
    blogId: { type:String, required:true },
    blogName: { type:String, required:true, maxLength:15 },
    createdAt: { type:String, required:true }
})

export const Posts = model<IPost>('posts', postSchema)