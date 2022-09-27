import BloggersMongDb from "../bloggersMongoDb";
import PostModel, { PostInputModel } from "../../logic/models/postModel";
import { Collection } from "mongodb";
import BlogModel from "../../logic/models/blogModel";
import MongoPostModel from "../models/mongoPostModel";
import * as config from '../../config/config'
import MongoBlogModel from "../models/mongoBlogModel";

export default class PostRepository {
    private readonly db:BloggersMongDb
    private readonly posts: Collection<MongoPostModel>

    constructor() {
        this.db = config.db
        this.posts = this.db.postCollection
    }
    public async getAll(): Promise<Array<PostModel>> {
        try {
            const result = await this.posts.find({}).toArray()
            return result.map((p) => MongoPostModel.convert(p))
        } catch {
            return []
        }       
    }
    public async get(id: string): Promise<PostModel|undefined> {
        try {
            const result = await this.posts.findOne({_id : id})
            return result? MongoPostModel.convert(result) : undefined
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
    public async getBlog(id:string): Promise<BlogModel|undefined> {
        const blog = await this.db.blogCollection.findOne({_id:id})
        return blog? MongoBlogModel.convert(blog) : undefined
    }
}