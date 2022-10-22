import { BlogPostQueryRepository as IBlogPostQueryRepository } from "../../presentation/interfaces/blogPostQueryRepository";
import GetBlogQueryParams from "../../presentation/models/queryParams/getBlogsQueryParams";
import getPostQueryParams from "../../presentation/models/queryParams/getPostsQueryParams";
import BlogViewModel from "../../presentation/models/viewModels/blogViewModel";
import PageViewModel from "../../presentation/models/viewModels/pageViewModel";
import PostViewModel from "../../presentation/models/viewModels/postViewModel";
import BlogMapper from "../mappers/blogMapper";
import PostMapper from "../mappers/postMapper";
import { Blog, IBlog } from "../models/blogModel";
import { IPost, Post } from "../models/postModel";
import SortFactory from "./utils/sortFactory";

export default class BlogPostQueryRepository implements IBlogPostQueryRepository {
    public async getBlogs(params: GetBlogQueryParams): Promise<PageViewModel<BlogViewModel>> {
        const filter = this.getFilter(params.searchNameTerm)
        const count = await this.getBlogCount(filter)
        const page = new PageViewModel<BlogViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getBlogQuery(filter,params.sortBy,params.sortDirection)
        return this.loadPageBlog(page,query)
    }
    public async getBlogPosts(blogId: string, params: getPostQueryParams): Promise<PageViewModel<PostViewModel> | undefined> {
        const count = await this.getPostCount(blogId)
        const page = new PageViewModel<PostViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getPostQuery(params.sortBy, params.sortDirection, blogId);
        return this.loadPagePost(page,query)
    }
    public async getPosts(params: getPostQueryParams): Promise<PageViewModel<PostViewModel>> {
        const count = await this.getPostCount()
        const page = new PageViewModel<PostViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getPostQuery(params.sortBy, params.sortDirection);
        return this.loadPagePost(page,query)
    }
    private getFilter(searchNameTerm:string|null): any {
        return searchNameTerm? { name : RegExp(searchNameTerm, 'i') } : {}
    }
    private async getBlogCount(filter:any): Promise<number> {
        try {
            return Blog.countDocuments(filter).exec()
        } catch (error) {
            return 0
        }
    }
    private async getPostCount(blogId:string|null = null): Promise<number> {
        const filter = blogId? { blogId: blogId } : {}
        try {
            return Post.countDocuments(filter)
        } catch (error) {
            return 0
        }
    }
    private getBlogQuery(filter:any,sortBy:string,sortDirection:string): any {
        return Blog.find(filter).sort(SortFactory.get(sortBy,sortDirection))
    }
    private getPostQuery(sortBy:string, sortDirection:string, blogId:string|null = null): any {
        const filter = blogId? {blogId:blogId} : {}
        return Post.find(filter).sort(SortFactory.get(sortBy,sortDirection))
    }
    private async loadPageBlog(page:PageViewModel<BlogViewModel>,query:any): Promise<PageViewModel<BlogViewModel>> {
        try {
            const blogs: IBlog[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = blogs.map(b => BlogMapper.toView(b))
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
    private async loadPagePost(page:PageViewModel<PostViewModel>,query:any): Promise<PageViewModel<PostViewModel>> {
        try {
            const posts: IPost[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = posts.map(p => PostMapper.toView(p))
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
}