import "reflect-metadata";
import { injectable } from "inversify";
import { CommentRepository as ICommentRepository } from "../../logicLayer/interfaces/commentRepository";
import CommentModel from "../../logicLayer/models/commentModel";
import LikeModel from "../../logicLayer/models/likeModel";
import CommentMapper from "../mappers/commentMapper";
import LikeMapper from "../mappers/likeMapper";
import { Comment } from "../models/commentModel";
import { CommentLike } from "../models/likeModel";

@injectable()
export default class CommentRepository implements ICommentRepository {
    public async get(id: string): Promise<CommentModel | undefined> {
        try {
            const comment = await Comment.findOne({_id:id})
            return comment ? CommentMapper.toBusiness(comment) : undefined 
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async create(comment: CommentModel): Promise<string | undefined> {
        try {
            const newComment = new Comment(CommentMapper.fromBusiness(comment))
            const result = await newComment.save()
            return result? result._id : undefined   
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async update(id: string, content: string): Promise<boolean> {
        try {
            const result = await Comment.updateOne({_id:id},{ content:content })
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async delete(id: string): Promise<boolean> {
        try {
            const result = await Comment.deleteOne({_id:id})
            return result.deletedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async getLike(commentId: string, userId: string): Promise<LikeModel | undefined> {
        try {
            const result = await CommentLike.findOne({ entityId:commentId, userId:userId })
            return result? LikeMapper.toBusiness(result) : undefined            
        } catch (error) {
            console.log(error)
            return undefined
        }        
    }
    public async createLike(data: LikeModel): Promise<boolean> {
        try {
            const like = new CommentLike(LikeMapper.fromBusiness(data))
            const result = await like.save()
            return !!result
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async updateLike(data: LikeModel): Promise<boolean> {
        try {
            const like = await CommentLike.findOne({_id:data.id})
            if(!like) return false
            like.status = data.status
            like.lastModified = new Date(data.lastModified)
            const result = await like.save()
            return !!result
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async deleteLikes(commentId: string): Promise<number> {
        try {
            const result = await CommentLike.deleteMany({entityId:commentId}).exec()
            return result.deletedCount
        } catch (error) {
            console.log(error)
            return 0
        }
    }
}