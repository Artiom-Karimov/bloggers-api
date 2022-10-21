import { Schema, model } from 'mongoose'

export interface IBlog {
    _id:string
    name:string
    youtubeUrl:string
    createdAt:string
}

const blogSchema = new Schema<IBlog>({
    _id:{ type:String, required:true, immutable:true },
    name:{ type:String, required:true, maxLength: 15 },
    youtubeUrl:{ type:String, required:true, maxLength:100 },
    createdAt:{ type:String, required:true, immutable:true }
})

export const Blog = model<IBlog>('blogs', blogSchema)