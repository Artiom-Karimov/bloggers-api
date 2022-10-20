import BloggersMongoDb from "../bloggersMongoDb";
import BlogModel, { BlogInputModel } from "../../logic/models/blogModel";
import { Collection } from "mongodb";
import MongoBlogModel from "../models/mongoBlogModel";
import { BlogRepository as IBlogRepository } from "../../logic/interfaces/blogRepositoty"

export default class BlogRepository implements IBlogRepository {
    private readonly db: BloggersMongoDb
    private readonly blogs: Collection<MongoBlogModel>

    constructor(db: BloggersMongoDb) {
        this.db = db
        this.blogs = this.db.blogCollection
    }
    public async get(id:string): Promise<BlogModel|undefined> {
        try {            
            const result = await this.blogs.findOne({ _id : id })
            return result? MongoBlogModel.getBusinessModel(result) : undefined
        } catch {
            return undefined
        }
    }
    public async create(blog:BlogModel): Promise<BlogModel|undefined> {
        try {
            const model = new MongoBlogModel(blog)
            const created = await this.blogs.insertOne(model)
            if(created.acknowledged) return await this.get(blog.id)
        } catch {
            return undefined
        }     
    }
    public async update(id:string,data:BlogInputModel): Promise<boolean> {
        try {
            const result = await this.blogs.updateOne(
                {_id:id},
                { $set: {...data} })
            return result.matchedCount === 1
        } catch {
            return false
        }
    }
    public async delete(id:string): Promise<boolean> {
        try {
            const result = await this.blogs.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch {
            return false
        }       
    }
}