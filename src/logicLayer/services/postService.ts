import { PostRepository } from "../interfaces/postRepository";
import { PutLikeInfoModelType } from "../models/clientActionTypes";
import LikeModel from "../models/likeModel";
import PostModel, { PostInputModel } from "../models/postModel";
import DateGenerator from "../utils/dateGenerator";
import IdGenerator from "../utils/idGenerator";

export default class PostService {
    private readonly repo: PostRepository

    constructor(repo: PostRepository) {
        this.repo = repo
    }
    public async get(id:string): Promise<PostModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:PostInputModel): Promise<PostModel|undefined> {
        const newPost = new PostModel(
            IdGenerator.generate(), 
            data, 
            DateGenerator.generate())
        return this.repo.create(newPost)
    }
    public async update(id:string,data:PostInputModel): Promise<boolean> {
        return this.repo.update(id,data)
    }
    public async delete(id:string): Promise<boolean> {
        const deleted = await this.repo.delete(id)
        if(deleted) this.repo.deleteLikes(id)
        return deleted
    }
    public async putLikeInfo(data:PutLikeInfoModelType): Promise<boolean> {
        let like = await this.repo.getLike(data.entityId,data.userId)
        if(!like) { 
            like = LikeModel.create(data)
            return this.repo.createLike(like)
        }
        return this.repo.updateLike(LikeModel.update(like,data.status))
    }
}