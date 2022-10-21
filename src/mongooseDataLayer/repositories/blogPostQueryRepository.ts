import { BlogPostQueryRepository as IBlogPostQueryRepository } from "../../presentation/interfaces/blogPostQueryRepository";
import getBlogsQueryParams from "../../presentation/models/queryParams/getBlogsQueryParams";
import getPostsQueryParams from "../../presentation/models/queryParams/getPostsQueryParams";
import blogViewModel from "../../presentation/models/viewModels/blogViewModel";
import pageViewModel from "../../presentation/models/viewModels/pageViewModel";
import postViewModel from "../../presentation/models/viewModels/postViewModel";

export default class BlogPostQueryRepository implements IBlogPostQueryRepository {
    getBlogs(params: getBlogsQueryParams): Promise<pageViewModel<blogViewModel>> {
        throw new Error("Method not implemented.");
    }
    getBlogPosts(blogId: string, params: getPostsQueryParams): Promise<pageViewModel<postViewModel> | undefined> {
        throw new Error("Method not implemented.");
    }
    getPosts(params: getPostsQueryParams): Promise<pageViewModel<postViewModel>> {
        throw new Error("Method not implemented.");
    }
    private getFilter(searchNameTerm:string|null): any {
        return searchNameTerm? { name : RegExp(searchNameTerm, 'i') } : {}
    }
}