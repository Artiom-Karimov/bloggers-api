import { BloggersMongDb } from "../bloggersMongoDb";
import { BlogInputModel, BlogModel } from "./blogModel";
import { IdGenerator } from '../idGenerator';
import { Collection } from "mongodb";
import { removeMongoId } from "../mongoIdRemover";

export class BlogRepository {
    private readonly db: BloggersMongDb
    private readonly blogs: Collection<BlogModel>

    constructor(db:BloggersMongDb) {
        this.db = db
        this.blogs = db.blogCollection
    }
    public async getAll(): Promise<Array<BlogModel>> {
        try {
            const result = await this.blogs.find({}).toArray()
            return result.map((b) => removeMongoId(b) as BlogModel)          
        } catch {
            return []
        }
    }
    public async get(id:string): Promise<BlogModel|undefined> {
        try {            
            const result = await this.blogs.findOne({ 'id': id })
            return result? removeMongoId(result) as BlogModel : undefined
        } catch {
            return undefined
        }
    }
    public async create(data:BlogInputModel): Promise<BlogModel|undefined> {
        const id = IdGenerator.generate()
        const created = await this.blogs.insertOne(new BlogModel(id, data))
        if(created.acknowledged) return await this.get(id)
        return undefined
    }
    public async update(id:string,data:BlogInputModel): Promise<boolean> {
        const result = await this.blogs.updateOne(
            {'id':id},
            { $set: {...data} })
        return result.matchedCount === 1
    }
    public async delete(id:string): Promise<boolean> {
        const result = await this.blogs.deleteOne({'id':id})
        return result.deletedCount === 1
    }
}