import "reflect-metadata";
import { injectable } from 'inversify';
import { UpdateResult } from 'mongodb';
import { BlogRepository as IBlogRepository } from '../../logicLayer/interfaces/blogRepositoty'
import blogModel, { BlogInputModel } from '../../logicLayer/models/blogModel';
import BlogMapper from '../mappers/blogMapper';
import { Blog, IBlog } from '../models/blogModel';

@injectable()
export default class BlogRepository implements IBlogRepository {

    public async get(id: string): Promise<blogModel | undefined> {
        try {
            const result: IBlog|null  = await Blog.findById(id).exec()
            return result ? BlogMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async create(blog: blogModel): Promise<blogModel | undefined> {
        try {
            const newBlog = new Blog(BlogMapper.fromBusiness(blog))
            const result = await newBlog.save()
            return result ? BlogMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async update(id: string, data: BlogInputModel): Promise<boolean> {
        try {
            const result: UpdateResult = await Blog.updateOne({_id:id}, data).exec()
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public async delete(id: string): Promise<boolean> {
        try {
            const result: IBlog|null = await Blog.findByIdAndDelete(id).exec()
            return !!result   
        } catch (error) {
            console.log(error)
            return false
        }
    }
}