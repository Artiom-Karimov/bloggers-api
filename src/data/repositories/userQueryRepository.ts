import { Collection, FindCursor } from "mongodb";
import * as config from '../../config/config'
import BloggersMongoDb from "../bloggersMongoDb";
import MongoUserModel from "../models/mongoModels/mongoUserModel";
import UserPageViewModel from "../models/pageViewModels/userPageViewModel";

export default class UserQueryRepository {
    private readonly db:BloggersMongoDb
    private readonly users:Collection<MongoUserModel>

    constructor() {
        this.db = config.db
        this.users = this.db.userCollection
    }
    public async get(
        searchLoginTerm: string|null,
        searchEmailTerm: string|null,
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: string
    ): Promise<UserPageViewModel> {
        const filter = this.getFilter(searchLoginTerm, searchEmailTerm)
        const cursor = this.getCursor(filter,sortBy,sortDirection)
        const total = await this.getTotalCount(filter)
        const result = new UserPageViewModel(pageNumber, pageSize, total)
        return await this.loadPageUsers(result, cursor)
    }
    private getFilter(
        searchLoginTerm:string|null,
        searchEmailTerm:string|null): any {
        if(searchLoginTerm && searchEmailTerm) {
            const login = this.getSingleFilter('login', searchLoginTerm)
            const email = this.getSingleFilter('email', searchEmailTerm)
            return { $or: [ login, email ] }
        }
        if(searchLoginTerm) {
            return this.getSingleFilter('login', searchLoginTerm)
        }
        if(searchEmailTerm) {
            this.getSingleFilter('email', searchEmailTerm)
        }
        return {}
    }
    private getSingleFilter(param:string,value:string) {
        const result: any  = {}
        result[param] = RegExp(value, 'i')
        return result
    }
    private getCursor(filter:any, sortBy:string, sortDirection:string): FindCursor<MongoUserModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        return this.users.find(filter).sort(sortBy,order)
    }
    private async getTotalCount(filter:any): Promise<number> {
        const count = await this.users.aggregate([
            { $match: filter },
            { $count: 'total' }
        ]).toArray()
        if(!count || count.length === 0 || !count[0])
            return 0
        return count[0].total
    }
    private async loadPageUsers(page:UserPageViewModel,cursor:FindCursor<MongoUserModel>)
    : Promise<UserPageViewModel> {
        const skip = this.calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        return page.add(...result)
    }
    private calculateSkip(pageSize:number,page:number): number {
        return (page - 1) * pageSize
    }
}