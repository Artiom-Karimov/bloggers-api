import { BloggersMongDb } from "../bloggersMongoDb";
import { PostInputModel, PostModel } from "./postModel";
import { IdGenerator } from '../idGenerator';
import { Collection } from "mongodb";
import { BlogModel } from "../blogs/blogModel";
import { removeMongoId } from "../mongoIdRemover";

export class PostRepository {
    private readonly db:BloggersMongDb
    private readonly posts: Collection<PostModel>

    constructor(db:BloggersMongDb) {
        this.db = db
        this.posts = db.postCollection
    }
    public async getAll(): Promise<Array<PostModel>> {
        const result = await this.posts.find({}).toArray()
        return result.map((p) => removeMongoId(p) as PostModel)
    }
    public async get(id: string): Promise<PostModel|undefined> {
        const result = await this.posts.findOne({'id':id})
        return result? removeMongoId(result) as PostModel : undefined
    }
    public async create(data: PostInputModel): Promise<PostModel|undefined> {
        const id = IdGenerator.generate()
        const created = await this.posts.insertOne(new PostModel(id, data))
        if(created.acknowledged) return await this.get(id)
        return undefined
    }
    public async update(id: string, data: PostInputModel): Promise<boolean> {
        const result = await this.posts.updateOne(
            {'id':id},
            { $set: {...data} })
        return result.matchedCount === 1
    }
    public async delete(id: string): Promise<boolean> {
        const result = await this.posts.deleteOne({'id':id})
        return result.deletedCount === 1
    }
    public async getBlog(id:string): Promise<BlogModel|undefined> {
        const blog = await this.db.blogCollection.findOne({'id':id})
        return blog as BlogModel
    }
}