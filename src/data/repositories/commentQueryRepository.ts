import * as config from '../../config/config'
import { Collection, FindCursor } from "mongodb"
import BloggersMongoDb from "../bloggersMongoDb"
import MongoCommentModel from "../models/mongoModels/mongoCommentModel"
import CommentPageViewModel from '../models/pageViewModels/commentPageViewModel'
import { calculateSkip } from './utils/skipCalculator'

export default class CommentQueryRepository {
    private readonly db:BloggersMongoDb
    private readonly comments:Collection<MongoCommentModel>

    constructor() {
        this.db = config.db
        this.comments = this.db.commentCollection
    }
    public async get(
        postId:string,
        pageNumber:number,
        pageSize:number,
        sortBy:string,
        sortDirection:string
    ): Promise<CommentPageViewModel> {
        const totalCount = await this.getTotalCount(postId)
        const page = new CommentPageViewModel(pageNumber,pageSize,totalCount)
        const cursor = this.getCursor(postId, sortBy, sortDirection)
        return await this.loadPageComments(page, cursor)
    }
    private getCursor(postId:string, sortBy:string, sortDirection:string): FindCursor<MongoCommentModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        return this.comments.find({postId:postId}).sort(sortBy,order)
    }
    private async getTotalCount(postId:string): Promise<number> {
        return await this.comments.countDocuments({postId:postId})
    } 
    private async loadPageComments(page:CommentPageViewModel,cursor:FindCursor<MongoCommentModel>)
    : Promise<CommentPageViewModel> {
        const skip = calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        return page.add(...result)
    }
}