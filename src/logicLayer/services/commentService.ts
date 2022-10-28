import "reflect-metadata";
import { injectable } from "inversify";
import { CommentRepository } from "../interfaces/commentRepository";
import { PutLikeInfoModelType } from "../models/clientActionTypes";
import CommentModel, { CommentCreateModel } from "../models/commentModel";
import LikeModel from "../models/likeModel";
import DateGenerator from "../utils/dateGenerator";
import IdGenerator from "../utils/idGenerator";

@injectable()
export default class CommentService {
    private readonly repo: CommentRepository

    constructor(repo: CommentRepository) {
        this.repo = repo
    }
    public async get(id:string): Promise<CommentModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:CommentCreateModel):Promise<string|undefined> {
        const newComment = new CommentModel(
            IdGenerator.generate(),
            data,
            DateGenerator.generate()
        )
        return this.repo.create(newComment)
    }
    public async update(id:string,content:string): Promise<boolean> {
        return this.repo.update(id,content)
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