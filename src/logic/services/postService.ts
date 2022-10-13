import PostRepository from "../../data/repositories/postRepository";
import PostModel, { PostInputModel } from "../models/postModel";
import DateGenerator from "../utils/dateGenerator";
import {generateId} from "../utils/idGenerator";

export default class PostService {
    private readonly repo: PostRepository

    constructor(repo: PostRepository) {
        this.repo = repo
    }
    public async get(id:string): Promise<PostModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:PostInputModel): Promise<PostModel|undefined> {
        const newBlog = new PostModel(
            generateId(), 
            data, 
            DateGenerator.generate())
        return this.repo.create(newBlog)
    }
    public async update(id:string,data:PostInputModel): Promise<boolean> {
        return this.repo.update(id,data)
    }
    public async delete(id:string): Promise<boolean> {
        return this.repo.delete(id)
    }
}