import { UpdateResult } from "mongodb";
import { PostRepository as IPostRepository } from "../../logic/interfaces/postRepository";
import PostModel, { PostInputModel } from "../../logic/models/postModel";
import PostMapper from "../mappers/postMapper";
import { IPost, Posts } from "../models/postModel";

export default class PostRepository implements IPostRepository {
    async get(id: string): Promise<PostModel | undefined> {
        try {
            const result: IPost|null  = await Posts.findById(id).exec()
            return result ? PostMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    async create(post: PostModel): Promise<PostModel | undefined> {
        try {
            const result: IPost|null = await Posts.create(PostMapper.fromBusiness(post))
            return result ? PostMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    async update(id: string, data: PostInputModel): Promise<boolean> {
        try {
            const result: UpdateResult = await Posts.updateOne({_id:id}, data).exec()
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async delete(id: string): Promise<boolean> {
        try {
            const result: IPost|null = await Posts.findByIdAndDelete(id).exec()
            return !!result   
        } catch (error) {
            console.log(error)
            return false
        }
    }

}