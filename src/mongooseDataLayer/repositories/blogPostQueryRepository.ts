import { Query } from "mongoose";
import { BlogPostQueryRepository as IBlogPostQueryRepository } from "../../presentation/interfaces/blogPostQueryRepository";
import GetBlogsQueryParams from "../../presentation/models/queryParams/getBlogsQueryParams";
import getPostsQueryParams from "../../presentation/models/queryParams/getPostsQueryParams";
import BlogViewModel from "../../presentation/models/viewModels/blogViewModel";
import PageViewModel from "../../presentation/models/viewModels/pageViewModel";
import PostViewModel from "../../presentation/models/viewModels/postViewModel";
import BlogMapper from "../mappers/blogMapper";
import PostMapper from "../mappers/postMapper";
import { Blogs, IBlog } from "../models/blogModel";
import { IPost, Posts } from "../models/postModel";

export default class BlogPostQueryRepository implements IBlogPostQueryRepository {
    async getBlogs(params: GetBlogsQueryParams): Promise<PageViewModel<BlogViewModel>> {
        const filter = this.getFilter(params.searchNameTerm)
        const count = await this.getBlogCount(filter)
        const page = new PageViewModel<BlogViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getBlogQuery(filter,params.sortBy,params.sortDirection)
        return this.loadPageBlogs(page,query)
    }
    async getBlogPosts(blogId: string, params: getPostsQueryParams): Promise<PageViewModel<PostViewModel> | undefined> {
        const count = await this.getPostCount(blogId)
        const page = new PageViewModel<PostViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getPostQuery(params.sortBy, params.sortDirection, blogId);
        return this.loadPagePosts(page,query)
    }
    async getPosts(params: getPostsQueryParams): Promise<PageViewModel<PostViewModel>> {
        const count = await this.getPostCount()
        const page = new PageViewModel<PostViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getPostQuery(params.sortBy, params.sortDirection);
        return this.loadPagePosts(page,query)
    }
    private getFilter(searchNameTerm:string|null): any {
        return searchNameTerm? { name : RegExp(searchNameTerm, 'i') } : {}
    }
    private async getBlogCount(filter:any): Promise<number> {
        try {
            return Blogs.countDocuments(filter).exec()
        } catch (error) {
            return 0
        }
    }
    private async getPostCount(blogId:string|null = null): Promise<number> {
        const filter = blogId? { blogId: blogId } : {}
        try {
            return Posts.countDocuments(filter)
        } catch (error) {
            return 0
        }
    }
    private getBlogQuery(filter:any,sortBy:string,sortDirection:string): any {
        return Blogs.find(filter).sort(this.getSortObject(sortBy,sortDirection))
    }
    private getPostQuery(sortBy:string, sortDirection:string, blogId:string|null = null): any {
        const filter = blogId? {blogId:blogId} : {}
        return Posts.find(filter).sort(this.getSortObject(sortBy,sortDirection))
    }
    private async loadPageBlogs(page:PageViewModel<BlogViewModel>,query:any): Promise<PageViewModel<BlogViewModel>> {
        try {
            const blogs: IBlog[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = blogs.map(b => BlogMapper.toView(b))
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
    private async loadPagePosts(page:PageViewModel<PostViewModel>,query:any): Promise<PageViewModel<PostViewModel>> {
        try {
            const posts: IPost[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = posts.map(p => PostMapper.toView(p))
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
    private getSortObject(sortBy:string,sortDirection:string): any {
        const order = sortDirection === 'asc' ? 1 : -1 
        const sortObj: {[key:string]:number} = {}
        sortObj[sortBy] = order
        return sortObj
    }
}