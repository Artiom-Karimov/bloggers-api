import { CommentQueryRepository as ICommentQueryRepository } from "../../../presentationLayer/interfaces/commentQueryRepository";
import GetCommentsQueryParams from "../../../presentationLayer/models/queryParams/getCommentsQueryParams";
import CommentViewModel from "../../../presentationLayer/models/viewModels/commentViewModel";
import LikesInfoViewModel from "../../../presentationLayer/models/viewModels/likesInfoViewModel";
import PageViewModel from "../../../presentationLayer/models/viewModels/pageViewModel";
import CommentMapper from "../../mappers/commentMapper";
import { Comment, IComment } from "../../models/commentModel";
import SortFactory from "../utils/sortFactory";
import LikeQueryRepository from "./likeQueryRepository";

export default class CommentQueryRepository implements ICommentQueryRepository {
    constructor(private readonly likeRepo:LikeQueryRepository) {}

    public async getWithoutLikes(id:string): Promise<CommentViewModel | undefined> {
        try {
            const comment = await Comment.findOne({_id:id})
            if(!comment) return undefined
            const likes = LikesInfoViewModel.createEmpty()
            return comment? CommentMapper.toView(comment,likes) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async getById(id: string, userId:string = ''): Promise<CommentViewModel | undefined> {
        try {
            const comment = await Comment.findOne({_id:id})
            if(!comment) return undefined
            const likes = await this.likeRepo.getLikes(id, userId)
            return comment? CommentMapper.toView(comment,likes) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async get(params: GetCommentsQueryParams): Promise<PageViewModel<CommentViewModel>> {
        const totalCount = await this.getTotalCount(params.postId)
        const page = new PageViewModel<CommentViewModel>(params.pageNumber,params.pageSize,totalCount)
        const query = this.getQuery(params.postId,params.sortBy,params.sortDirection)
        return this.loadPageComments(page,params.userId,query)
    }
    private async getTotalCount(postId:string): Promise<number> {
        return Comment.countDocuments({postId:postId})
    } 
    private getQuery(postId:string,sortBy:string,sortDirection:string): any {
        const sortObj = SortFactory.get(sortBy,sortDirection)
        return Comment.find({postId:postId}).sort(sortObj)
    }
    private async loadPageComments(page:PageViewModel<CommentViewModel>,userId:string,query:any): Promise<PageViewModel<CommentViewModel>> {
        try {
            const comments: IComment[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = await this.mergeManyWithLikes(comments,userId)
            return page.add(...viewModels)
        } catch (error) {
            return page
        }
    }
    private async mergeManyWithLikes(comments:IComment[], userId:string): Promise<CommentViewModel[]> {
        const promises = comments.map(c => this.mergeWithLikes(c,userId))
        return Promise.all(promises)
    }
    private async mergeWithLikes(comment:IComment, userId:string): Promise<CommentViewModel> {
        const likes = await this.likeRepo.getLikes(comment._id,userId)
        return CommentMapper.toView(comment,likes)
    } 
}