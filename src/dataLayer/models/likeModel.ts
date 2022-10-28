import { model, Schema } from "mongoose"

export interface ILike {
    _id:string,
    entityId:string,
    userId:string,
    status: string,
    lastModified:Date
}

const likeSchema = new Schema<ILike>({
    _id:{ type:String, required:true, immutable:true },
    entityId:{ type:String, required:true, immutable:true },
    userId:{ type:String, required:true, immutable:true },
    status:{ type:String, enum: ['None','Like','Dislike'], required:true},
    lastModified:{ type:Date, required:true }
})

export const PostLike = model<ILike>('postLikes', likeSchema)
export const CommentLike = model<ILike>('commentLikes', likeSchema)