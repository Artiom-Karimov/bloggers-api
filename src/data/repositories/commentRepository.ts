import BloggersMongoDb from "../bloggersMongoDb";
import CommentModel, { CommentInputModel } from "../../logic/models/commentModel";
import { Collection } from "mongodb";
import * as config from '../../config/config'
import MongoCommentModel from "../models/mongoModels/mongoCommentModel";

export default class CommentRepository {
    private readonly db: BloggersMongoDb
    private readonly comments: Collection<MongoCommentModel>

    constructor() {
        this.db = config.db
        this.comments = this.db.commentCollection
    }
    public async get(id:string): Promise<CommentModel|undefined> {
        try {            
            const result = await this.comments.findOne({ _id : id })
            return result? MongoCommentModel.getBusinessModel(result) : undefined
        } catch {
            return undefined
        }
    }
    public async create(comment:CommentModel): Promise<CommentModel|undefined> {
        try {
            const model = new MongoCommentModel(comment)
            const created = await this.comments.insertOne(model)
            if(created.acknowledged) return await this.get(comment.id)
        } catch {
            return undefined
        }     
    }
    public async update(id:string,content:string): Promise<boolean> {
        try {
            const result = await this.comments.updateOne(
                {_id:id},
                { $set: {content:content} })
            return result.matchedCount === 1
        } catch {
            return false
        }
    }
    public async delete(id:string): Promise<boolean> {
        try {
            const result = await this.comments.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch {
            return false
        }
    }
}