import "reflect-metadata";
import { inject, injectable } from "inversify";
import { IBlogPostQueryRepository } from "../../../presentationLayer/interfaces/blogPostQueryRepository";
import GetBlogQueryParams from "../../../presentationLayer/models/queryParams/getBlogsQueryParams";
import getPostQueryParams from "../../../presentationLayer/models/queryParams/getPostsQueryParams";
import BlogViewModel from "../../../presentationLayer/models/viewModels/blogViewModel";
import PageViewModel from "../../../presentationLayer/models/viewModels/pageViewModel";
import PostViewModel from "../../../presentationLayer/models/viewModels/postViewModel";
import BlogMapper from "../../mappers/blogMapper";
import PostMapper from "../../mappers/postMapper";
import { Blog, IBlog } from "../../models/blogModel";
import { IPost, Post } from "../../models/postModel";
import SortFactory from "../utils/sortFactory";
import PostLikeQueryRepository from "./postLikeQueryRepository";
import { Types } from "../../../inversifyTypes";

@injectable()
export default class BlogPostQueryRepository implements IBlogPostQueryRepository {
    constructor(@inject(Types.PostLikeRepository) private readonly likeRepo: PostLikeQueryRepository) { }

    public async getBlogs(params: GetBlogQueryParams): Promise<PageViewModel<BlogViewModel>> {
        const filter = this.getFilter(params.searchNameTerm)
        const count = await this.getBlogCount(filter)
        const page = new PageViewModel<BlogViewModel>(params.pageNumber, params.pageSize, count)
        const query = this.getBlogQuery(filter, params.sortBy, params.sortDirection)
        return this.loadPageBlogs(page, query)
    }
    public async getBlogPosts(blogId: string, params: getPostQueryParams): Promise<PageViewModel<PostViewModel> | undefined> {
        const count = await this.getPostCount(blogId)
        const page = new PageViewModel<PostViewModel>(params.pageNumber, params.pageSize, count)
        const query = this.getPostQuery(params.sortBy, params.sortDirection, blogId);
        return this.loadPagePosts(page, query, params.userId)
    }
    public async getPost(id: string, userId: string | undefined): Promise<PostViewModel | undefined> {
        const post = await Post.findOne({ _id: id })
        if (!post) return undefined

        return this.mergePostWithLikes(post, userId)
    }
    public async getPosts(params: getPostQueryParams): Promise<PageViewModel<PostViewModel>> {
        const count = await this.getPostCount()
        const page = new PageViewModel<PostViewModel>(params.pageNumber, params.pageSize, count)
        const query = this.getPostQuery(params.sortBy, params.sortDirection);
        return this.loadPagePosts(page, query, params.userId)
    }
    private getFilter(searchNameTerm: string | null): any {
        return searchNameTerm ? { name: RegExp(searchNameTerm, 'i') } : {}
    }
    private async getBlogCount(filter: any): Promise<number> {
        try {
            return Blog.countDocuments(filter).exec()
        } catch (error) {
            return 0
        }
    }
    private async getPostCount(blogId: string | null = null): Promise<number> {
        const filter = blogId ? { blogId: blogId } : {}
        try {
            return Post.countDocuments(filter)
        } catch (error) {
            return 0
        }
    }
    private getBlogQuery(filter: any, sortBy: string, sortDirection: string): any {
        return Blog.find(filter).sort(SortFactory.get(sortBy, sortDirection))
    }
    private getPostQuery(sortBy: string, sortDirection: string, blogId: string | null = null): any {
        const filter = blogId ? { blogId: blogId } : {}
        return Post.find(filter).sort(SortFactory.get(sortBy, sortDirection))
    }
    private async loadPageBlogs(page: PageViewModel<BlogViewModel>, query: any): Promise<PageViewModel<BlogViewModel>> {
        try {
            const blogs: IBlog[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = blogs.map(b => BlogMapper.toView(b))
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
    private async loadPagePosts(page: PageViewModel<PostViewModel>, query: any, userId: string | undefined): Promise<PageViewModel<PostViewModel>> {
        try {
            const posts: IPost[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const promises = posts.map(p => this.mergePostWithLikes(p, userId))
            const viewModels = await Promise.all(promises)
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
    private async mergePostWithLikes(model: IPost, userId: string | undefined): Promise<PostViewModel> {
        const likes = await this.likeRepo.getExtendedLikes(model._id, userId)
        return PostMapper.toView(model, likes)
    }
}