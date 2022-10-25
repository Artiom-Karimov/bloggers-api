import { CommentQueryRepository as ICommentQueryRepository } from "../../presentation/interfaces/commentQueryRepository";
import GetCommentsQueryParams from "../../presentation/models/queryParams/getCommentsQueryParams";
import CommentViewModel from "../../presentation/models/viewModels/commentViewModel";
import LikesInfoViewModel from "../../presentation/models/viewModels/likesInfoViewModel";
import PageViewModel from "../../presentation/models/viewModels/pageViewModel";
import CommentMapper from "../mappers/commentMapper";
import { Comment, IComment } from "../models/commentModel";
import { CommentLike } from "../models/likeModel";
import SortFactory from "./utils/sortFactory";

export default class CommentQueryRepository implements ICommentQueryRepository {
    public async getWithoutLikes(id:string): Promise<CommentViewModel | undefined> {
        try {
            const comment = await Comment.findOne({_id:id})
            if(!comment) return undefined
            const likes = new LikesInfoViewModel(0,0,"None")
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
            const likes = await this.getLikes(id, userId)
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
        const likes = await this.getLikes(comment._id,userId)
        return CommentMapper.toView(comment,likes)
    }
    private async getLikes(id: string, userId:string): Promise<LikesInfoViewModel> {
        try {
            return new LikesInfoViewModel(
                await this.getLikesCount(id),
                await this.getDislikesCount(id),
                await this.getUserLike(id,userId)
            )
        } catch (error) {
            return new LikesInfoViewModel(0,0,'None')
        }
    }
    private async getLikesCount(commentId:string): Promise<number> {
        return CommentLike.countDocuments({entityId:commentId}).where('status').equals('Like')
    }
    private async getDislikesCount(commentId:string): Promise<number> {
        return CommentLike.countDocuments({entityId:commentId}).where('status').equals('Dislike')
    }
    private async getUserLike(commentId:string,userId:string): Promise<string> {
        if(!userId) return 'None'
        const result = await CommentLike.findOne({entityId:commentId,userId:userId})
        return result ? result.status : 'None'
    }
}