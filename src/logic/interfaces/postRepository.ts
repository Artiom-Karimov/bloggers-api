import PostModel, { PostInputModel } from "../models/postModel";

export interface PostRepository {
    get(id:string): Promise<PostModel|undefined>
    create(post:PostModel): Promise<PostModel|undefined>
    update(id:string,data:PostInputModel): Promise<boolean>
    delete(id:string): Promise<boolean>
}