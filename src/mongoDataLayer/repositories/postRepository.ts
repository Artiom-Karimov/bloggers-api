import BloggersMongDb from "../bloggersMongoDb";
import { PostRepository as IPostRepository } from "../../logic/interfaces/postRepository"
import PostModel, { PostInputModel } from "../../logic/models/postModel";
import { Collection } from "mongodb";
import MongoPostModel from "../models/mongoPostModel";
import BloggersMongoDb from "../bloggersMongoDb";

export default class PostRepository implements IPostRepository {
    private readonly db:BloggersMongDb
    private readonly posts: Collection<MongoPostModel>

    constructor(db: BloggersMongoDb) {
        this.db = db
        this.posts = this.db.postCollection
    }
    public async get(id: string): Promise<PostModel|undefined> {
        try {
            const result = await this.posts.findOne({_id : id})
            return result? MongoPostModel.getBusinessModel(result) : undefined
        } catch {
            return undefined
        }       
    }
    public async create(post:PostModel): Promise<PostModel|undefined> {
        try {
            const model = new MongoPostModel(post)
            const created = await this.posts.insertOne(model)
            if(created.acknowledged) return await this.get(post.id)
        }
        catch {
            return undefined
        }     
    }
    public async update(id: string, data: PostInputModel): Promise<boolean> {
        const result = await this.posts.updateOne(
            {_id:id},
            { $set: {...data} })
        return result.matchedCount === 1
    }
    public async delete(id: string): Promise<boolean> {
        const result = await this.posts.deleteOne({_id:id})
        return result.deletedCount === 1
    }
}