import LikeModel from "../models/likeModel";
import PostModel, { PostInputModel } from "../models/postModel";

export interface PostRepository {
    get(id:string): Promise<PostModel|undefined>
    create(post:PostModel): Promise<PostModel|undefined>
    update(id:string,data:PostInputModel): Promise<boolean>
    delete(id:string): Promise<boolean>
    getLike(postId:string,userId:string): Promise<LikeModel|undefined>
    createLike(data:LikeModel): Promise<boolean>
    updateLike(data:LikeModel): Promise<boolean>
    deleteLikes(postId:string): Promise<number>
}