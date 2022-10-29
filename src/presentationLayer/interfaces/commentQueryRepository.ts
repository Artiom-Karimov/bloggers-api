import GetCommentsQueryParams from "../models/queryParams/getCommentsQueryParams";
import CommentViewModel from "../models/viewModels/commentViewModel";
import PageViewModel from "../models/viewModels/pageViewModel";

export interface ICommentQueryRepository {
    getWithoutLikes(id:string): Promise<CommentViewModel|undefined>
    getById(id:string,userId:string|undefined): Promise<CommentViewModel|undefined>
    get(params:GetCommentsQueryParams): Promise<PageViewModel<CommentViewModel>>
}