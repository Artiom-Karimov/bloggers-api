import "reflect-metadata";
import { injectable } from "inversify";
import { UpdateResult } from "mongodb";
import { PostRepository as IPostRepository } from "../../logicLayer/interfaces/postRepository";
import LikeModel from "../../logicLayer/models/likeModel";
import PostModel, { PostInputModel } from "../../logicLayer/models/postModel";
import LikeMapper from "../mappers/likeMapper";
import PostMapper from "../mappers/postMapper";
import { PostLike } from "../models/likeModel";
import { IPost, Post } from "../models/postModel";

@injectable()
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
    public async getLike(postId: string, userId: string): Promise<LikeModel | undefined> {
        try {
            const result = await PostLike.findOne({ entityId:postId, userId:userId })
            return result? LikeMapper.toBusiness(result) : undefined            
        } catch (error) {
            console.log(error)
            return undefined
        }        
    }
    public async createLike(data: LikeModel): Promise<boolean> {
        try {
            const like = new PostLike(LikeMapper.fromBusiness(data))
            const result = await like.save()
            return !!result
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async updateLike(data: LikeModel): Promise<boolean> {
        try {
            const like = await PostLike.findOne({_id:data.id})
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
    public async deleteLikes(postId: string): Promise<number> {
        try {
            const result = await PostLike.deleteMany({entityId:postId}).exec()
            return result.deletedCount
        } catch (error) {
            console.log(error)
            return 0
        }
    }
}