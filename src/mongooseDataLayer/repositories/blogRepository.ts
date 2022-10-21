import { UpdateResult } from 'mongodb';
import { BlogRepository as IBlogRepository } from '../../logic/interfaces/blogRepositoty'
import blogModel, { BlogInputModel } from '../../logic/models/blogModel';
import BlogMapper from '../mappers/blogMapper';
import { Blogs, IBlog } from '../models/blogModel';

export default class BlogRepository implements IBlogRepository {

    async get(id: string): Promise<blogModel | undefined> {
        try {
            const result: IBlog|null  = await Blogs.findById(id).exec()
            return result ? BlogMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    async create(blog: blogModel): Promise<blogModel | undefined> {
        try {
            const result: IBlog|null = await Blogs.create(BlogMapper.fromBusiness(blog))
            return result ? BlogMapper.toBusiness(result) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    async update(id: string, data: BlogInputModel): Promise<boolean> {
        try {
            const result: UpdateResult = await Blogs.updateOne({_id:id}, data).exec()
            return result.matchedCount === 1
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async delete(id: string): Promise<boolean> {
        try {
            const result: IBlog|null = await Blogs.findByIdAndDelete(id).exec()
            return !!result   
        } catch (error) {
            console.log(error)
            return false
        }
    }
}