import BloggersMongoDb from "../bloggersMongoDb";
import { BlogPostQueryRepository as IBlogPostQueryRepository } from '../../presentation/interfaces/blogPostQueryRepository'
import PageViewModel from "../../presentation/models/viewModels/pageViewModel";
import { Collection, FindCursor } from "mongodb";
import MongoBlogModel from "../models/mongoBlogModel";
import MongoPostModel from "../models/mongoPostModel";
import { calculateSkip } from "./utils/skipCalculator";
import BlogViewModel from "../../presentation/models/viewModels/blogViewModel";
import PostViewModel from "../../presentation/models/viewModels/postViewModel";
import GetBlogsQueryParams from "../../presentation/models/queryParams/getBlogsQueryParams";
import GetPostsQueryParams from "../../presentation/models/queryParams/getPostsQueryParams";

export default class BlogPostQueryRepository implements IBlogPostQueryRepository {
    private readonly db:BloggersMongoDb
    private readonly blogs:Collection<MongoBlogModel>
    private readonly posts:Collection<MongoPostModel>

    constructor(db: BloggersMongoDb) {
        this.db = db
        this.blogs = this.db.blogCollection
        this.posts = this.db.postCollection
    }
    public async getBlogs(params:GetBlogsQueryParams): Promise<PageViewModel<BlogViewModel>> {
            const filter = this.getFilter(params.searchNameTerm)
            const cursor = this.getBlogCursor(filter,params.sortBy,params.sortDirection)

            const totalCount = await this.getBlogCount(filter)
            const page = new PageViewModel<BlogViewModel>(params.pageNumber,params.pageSize,totalCount)
            
            return await this.loadPageBlogs(page,cursor)
    }
    public async getPosts(params:GetPostsQueryParams): Promise<PageViewModel<PostViewModel>> {
        const cursor = this.getPostCursor(params.sortBy,params.sortDirection)
        const totalCount = await this.getPostCount()
        const page = new PageViewModel<PostViewModel>(params.pageNumber,params.pageSize,totalCount)

        return await this.loadPagePosts(page,cursor)
    }
    public async getBlogPosts(blogId:string,params:GetPostsQueryParams): Promise<PageViewModel<PostViewModel>|undefined> {
        const blog = await this.blogs.findOne({_id:blogId})
        if(!blog) return undefined
        const cursor = this.getPostCursor(params.sortBy,params.sortDirection,blogId)

        const totalCount = await this.getPostCount(blogId)
        const page = new PageViewModel<PostViewModel>(params.pageNumber,params.pageSize,totalCount)

        return await this.loadPagePosts(page,cursor)
    }
    private getFilter(searchNameTerm:string|null): any {
        return searchNameTerm? { name : RegExp(searchNameTerm, 'i') } : {}
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
    private async loadPageBlogs(page:PageViewModel<BlogViewModel>,cursor:FindCursor<MongoBlogModel>): Promise<PageViewModel<BlogViewModel>> {
        const skip = calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        const viewModels = result.map(m => MongoBlogModel.getViewModel(m))
        return page.add(...viewModels)
    }
    private async loadPagePosts(page:PageViewModel<PostViewModel>,cursor:FindCursor<MongoPostModel>): Promise<PageViewModel<PostViewModel>> {
        const skip = calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        const viewModels = result.map(m => MongoPostModel.getViewModel(m))
        return page.add(...viewModels)
    }
    private getBlogCursor(filter: any, sortBy:string, sortDirection:string): FindCursor<MongoBlogModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        return this.blogs.find(filter).sort(sortBy, order)
    }
    private getPostCursor(sortBy:string, sortDirection:string, blogId:string|null = null)
    : FindCursor<MongoPostModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        const filter = blogId? {blogId:blogId} : {}
        return this.posts.find(filter, {collation: {locale:'en_US',numericOrdering:false}}).sort(sortBy, order)
    }
}