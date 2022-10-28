import CommentModel from "../models/commentModel";
import LikeModel, { LikeStatus } from "../models/likeModel";

export interface CommentRepository {
    get(id:string): Promise<CommentModel|undefined>
    create(comment:CommentModel): Promise<string|undefined>
    update(id:string,content:string): Promise<boolean>
    delete(id:string): Promise<boolean>
    getLike(commentId:string,userId:string): Promise<LikeModel|undefined>
    createLike(data:LikeModel): Promise<boolean>
    updateLike(data:LikeModel): Promise<boolean>
    deleteLikes(commentId:string): Promise<number>
}