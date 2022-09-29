import BloggersMongoDb from "../bloggersMongoDb";
import * as config from '../../config/config'
import BlogPageViewModel from "../models/blogPageViewModel";
import { Collection, FindCursor } from "mongodb";
import MongoBlogModel from "../models/mongoBlogModel";
import MongoPostModel from "../models/mongoPostModel";
import PostPageViewModel from "../models/postPageViewModel";

export default class QueryRepository {
    private readonly db:BloggersMongoDb
    private readonly blogs:Collection<MongoBlogModel>
    private readonly posts:Collection<MongoPostModel>

    constructor() {
        this.db = config.db
        this.blogs = this.db.blogCollection
        this.posts = this.db.postCollection
    }
    public async getBlogs(
        searchNameTerm:string|null,
        pageNumber:number,
        pageSize:number,
        sortBy:string,
        sortDirection:string
    ): Promise<BlogPageViewModel> {
            const filter = this.getFilter(searchNameTerm)
            const cursor = this.getBlogCursor(filter,sortBy,sortDirection)

            const totalCount = await this.getBlogCount(filter)
            const pagesCount = this.getPageCount(totalCount,pageSize)
            const page = new BlogPageViewModel(pagesCount,pageNumber,pageSize,totalCount)
            
            return await this.loadPageBlogs(page,cursor)
    }
    public async getPosts(
        pageNumber:number,
        pageSize:number,
        sortBy:string,
        sortDirection:string
    ): Promise<PostPageViewModel> {
        const cursor = this.getPostCursor(sortBy,sortDirection)
        const totalCount = await this.getPostCount()
        const pagesCount = this.getPageCount(totalCount,pageSize)
        const page = new PostPageViewModel(pagesCount,pageNumber,pageSize,totalCount)

        return await this.loadPagePosts(page,cursor)
    }
    public async getBlogPosts(
        pageNumber:number,
        pageSize:number,
        sortBy:string,
        sortDirection:string,
        blogId:string  
    ): Promise<PostPageViewModel|undefined> {
        const blog = await this.blogs.findOne({_id:blogId})
        if(!blog) return undefined
        const cursor = this.getPostCursor(sortBy,sortDirection,blogId)

        const totalCount = await this.getPostCount(blogId)
        const pagesCount = this.getPageCount(totalCount,pageSize)
        const page = new PostPageViewModel(pagesCount,pageNumber,pageSize,totalCount)

        return await this.loadPagePosts(page,cursor)
    }
    private getFilter(searchNameTerm:string|null): any {
        return searchNameTerm? { name : RegExp(`${searchNameTerm}`, 'i') } : {}
    }
    private async getBlogCount(filter:any): Promise<number> {
        const count = await this.blogs.aggregate([
            { $match: filter },
            { $count: 'total' }
        ]).toArray()
        if(!count || count.length === 0 || !count[0])
            return 0
        return count[0].total
    }
    private async getPostCount(blogId:string|null = null): Promise<number> {
        const filter = blogId? { blogId: blogId } : {}
        const count = await this.posts.aggregate([
            { $match: filter },
            { $count: 'total' }
        ]).toArray()
        if(!count || count.length === 0 || !count[0])
            return 0
        return count[0].total
    }
    private getPageCount(totalCount:number,pageSize:number): number {
        return Math.ceil(totalCount / pageSize)
    }
    private async loadPageBlogs(page:BlogPageViewModel,cursor:FindCursor<MongoBlogModel>): Promise<BlogPageViewModel> {
        const skip = this.calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        return page.add(...result)
    }
    private async loadPagePosts(page:PostPageViewModel,cursor:FindCursor<MongoPostModel>): Promise<PostPageViewModel> {
        const skip = this.calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        return page.add(...result)
    }
    private getBlogCursor(filter: any, sortBy:string, sortDirection:string): FindCursor<MongoBlogModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        return this.blogs.find(filter).sort(sortBy, order)
    }
    private getPostCursor(sortBy:string, sortDirection:string, blogId:string|null = null)
    : FindCursor<MongoPostModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        const filter = blogId? {blogId:blogId} : {}
        return this.posts.find(filter).sort(sortBy, order)
    }
    private calculateSkip(pageSize:number,page:number): number {
        return (page - 1) * pageSize
    }
}