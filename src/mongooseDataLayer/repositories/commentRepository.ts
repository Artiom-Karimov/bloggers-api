import { CommentRepository as ICommentRepository } from "../../logic/interfaces/commentRepository";
import CommentModel from "../../logic/models/commentModel";
import CommentMapper from "../mappers/commentMapper";
import { Comment } from "../models/commentModel";

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

}