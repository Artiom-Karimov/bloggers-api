import { CommentQueryRepository as ICommentQueryRepository } from "../../presentation/interfaces/commentQueryRepository";
import GetCommentsQueryParams from "../../presentation/models/queryParams/getCommentsQueryParams";
import CommentViewModel from "../../presentation/models/viewModels/commentViewModel";
import PageViewModel from "../../presentation/models/viewModels/pageViewModel";
import CommentMapper from "../mappers/commentMapper";
import { Comment, IComment } from "../models/commentModel";
import SortFactory from "./utils/sortFactory";

export default class CommentQueryRepository implements ICommentQueryRepository {
    public async getById(id: string): Promise<CommentViewModel | undefined> {
        try {
            const comment = await Comment.findOne({_id:id})
            return comment? CommentMapper.toView(comment) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async get(params: GetCommentsQueryParams): Promise<PageViewModel<CommentViewModel>> {
        const totalCount = await this.getTotalCount(params.postId)
        const page = new PageViewModel<CommentViewModel>(params.pageNumber,params.pageSize,totalCount)
        return this.loadPageComments(page,this.getQuery(params.postId,params.sortBy,params.sortDirection))
    }
    private async getTotalCount(postId:string): Promise<number> {
        return Comment.countDocuments({postId:postId})
    } 
    private getQuery(postId:string,sortBy:string,sortDirection:string): any {
        const sortObj = SortFactory.get(sortBy,sortDirection)
        return Comment.find({postId:postId}).sort(sortObj)
    }
    private async loadPageComments(page:PageViewModel<CommentViewModel>,query:any): Promise<PageViewModel<CommentViewModel>> {
        try {
            const comments: IComment[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = comments.map(c => CommentMapper.toView(c))
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
}