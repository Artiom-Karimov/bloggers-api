import "reflect-metadata";
import BlogModel, { BlogInputModel } from "../models/blogModel";
import { BlogRepository } from "../interfaces/blogRepositoty";
import IdGenerator from "../utils/idGenerator";
import DateGenerator from "../utils/dateGenerator";
import { injectable } from "inversify";

@injectable()
export default class BlogService {
    private readonly repo: BlogRepository

    constructor(repo:BlogRepository) {
        this.repo = repo
    }
    public async get(id:string): Promise<BlogModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:BlogInputModel): Promise<BlogModel|undefined> {
        const newBlog = new BlogModel(
            IdGenerator.generate(), 
            data, 
            DateGenerator.generate())
        return this.repo.create(newBlog)
    }
    public async update(id:string,data:BlogInputModel): Promise<boolean> {
        return this.repo.update(id,data)
    }
    public async delete(id:string): Promise<boolean> {
        return this.repo.delete(id)
    }
}