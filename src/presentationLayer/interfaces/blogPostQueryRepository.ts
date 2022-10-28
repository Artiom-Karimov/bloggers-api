import GetBlogsQueryParams from "../models/queryParams/getBlogsQueryParams";
import GetPostsQueryParams from "../models/queryParams/getPostsQueryParams";
import BlogViewModel from "../models/viewModels/blogViewModel";
import PageViewModel from "../models/viewModels/pageViewModel";
import PostViewModel from "../models/viewModels/postViewModel";

export interface BlogPostQueryRepository {
    getBlogs(params:GetBlogsQueryParams): Promise<PageViewModel<BlogViewModel>>
    getBlogPosts(blogId:string,params:GetPostsQueryParams)
        : Promise<PageViewModel<PostViewModel>|undefined>

    getPost(id:string,userId:string|undefined): Promise<PostViewModel|undefined>
    getPosts(params:GetPostsQueryParams): Promise<PageViewModel<PostViewModel>>
}