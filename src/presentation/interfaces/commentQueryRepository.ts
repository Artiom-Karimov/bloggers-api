import GetCommentsQueryParams from "../models/queryParams/getCommentsQueryParams";
import CommentViewModel from "../models/viewModels/commentViewModel";
import PageViewModel from "../models/viewModels/pageViewModel";

export interface CommentQueryRepository {
    getById(id:string): Promise<CommentViewModel|undefined>
    get(params:GetCommentsQueryParams): Promise<PageViewModel<CommentViewModel>>
}