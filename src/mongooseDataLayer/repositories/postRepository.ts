import { UpdateResult } from "mongodb";
import { PostRepository as IPostRepository } from "../../logic/interfaces/postRepository";
import PostModel, { PostInputModel } from "../../logic/models/postModel";
import PostMapper from "../mappers/postMapper";
import { IPost, Post } from "../models/postModel";

export default class PostRepository implements IPostRepository {
    public async get(id: string): Promise<PostModel | undefined> {
        try {
            const result: IPost|null  = await Post.findById(id).exec()
            return result ? PostMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async create(post: PostModel): Promise<PostModel | undefined> {
        try {
            const newPost = new Post(PostMapper.fromBusiness(post))
            const result = await newPost.save()
            return result ? PostMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async update(id: string, data: PostInputModel): Promise<boolean> {
        try {
            const result: UpdateResult = await Post.updateOne({_id:id}, data).exec()
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async delete(id: string): Promise<boolean> {
        try {
            const result: IPost|null = await Post.findByIdAndDelete(id).exec()
            return !!result   
        } catch (error) {
            console.log(error)
            return false
        }
    }

}