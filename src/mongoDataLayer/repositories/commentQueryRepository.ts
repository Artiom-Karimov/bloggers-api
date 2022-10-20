import { Collection, FindCursor } from "mongodb"
import BloggersMongoDb from "../bloggersMongoDb"
import { CommentQueryRepository as ICommentQueryRepository } from '../../presentation/interfaces/commentQueryRepository'
import MongoCommentModel from "../models/mongoCommentModel"
import PageViewModel from "../../presentation/models/viewModels/pageViewModel"
import { calculateSkip } from './utils/skipCalculator'
import CommentViewModel from '../../presentation/models/viewModels/commentViewModel'
import GetCommentsQueryParams from "../../presentation/models/queryParams/getCommentsQueryParams"

export default class CommentQueryRepository implements ICommentQueryRepository {
    private readonly db:BloggersMongoDb
    private readonly comments:Collection<MongoCommentModel>

    constructor(db: BloggersMongoDb) {
        this.db = db
        this.comments = this.db.commentCollection
    }
    public async get(params:GetCommentsQueryParams): Promise<PageViewModel<CommentViewModel>> {
        const totalCount = await this.getTotalCount(params.postId)
        const page = new PageViewModel<CommentViewModel>(params.pageNumber,params.pageSize,totalCount)
        const cursor = this.getCursor(params.postId, params.sortBy, params.sortDirection)
        return await this.loadPageComments(page, cursor)
    }
    public async getById(id:string): Promise<CommentViewModel|undefined> {
        const comment = await this.comments.findOne({_id:id})
        return comment? MongoCommentModel.getViewModel(comment) : undefined
    }
    private getCursor(postId:string, sortBy:string, sortDirection:string): FindCursor<MongoCommentModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        return this.comments.find({postId:postId}).sort(sortBy,order)
    }
    private async getTotalCount(postId:string): Promise<number> {
        return await this.comments.countDocuments({postId:postId})
    } 
    private async loadPageComments(page:PageViewModel<CommentViewModel>,cursor:FindCursor<MongoCommentModel>)
    : Promise<PageViewModel<CommentViewModel>> {
        const skip = calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        const viewModels = result.map(m => MongoCommentModel.getViewModel(m))
        return page.add(...viewModels)
    }
}