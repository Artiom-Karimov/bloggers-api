import { Collection, Filter, FindCursor } from "mongodb";
import { UserQueryRepository as IUserQueryRepository } from "../../presentation/interfaces/userQueryRepository";
import BloggersMongoDb from "../bloggersMongoDb";
import MongoUserModel from "../models/mongoUserModel";
import PageViewModel from "../../presentation/models/viewModels/pageViewModel";
import UserViewModel from "../../presentation/models/viewModels/userViewModel";
import { calculateSkip } from "./utils/skipCalculator";
import GetUsersQueryParams from "../../presentation/models/queryParams/getUsersQueryParams";

export default class UserQueryRepository implements IUserQueryRepository {
    private readonly db:BloggersMongoDb
    private readonly users:Collection<MongoUserModel>

    constructor(db: BloggersMongoDb) {
        this.db = db
        this.users = this.db.userCollection
    }
    public async get(params:GetUsersQueryParams): Promise<PageViewModel<UserViewModel>> {
        const filter = this.getFilter(params.searchLoginTerm, params.searchEmailTerm)
        const cursor = this.getCursor(filter,params.sortBy,params.sortDirection)
        const total = await this.getTotalCount(filter)
        const result = new PageViewModel<UserViewModel>(params.pageNumber, params.pageSize, total)
        return await this.loadPageUsers(result, cursor)
    }
    public async getById(id:string): Promise<UserViewModel|undefined> {
        const user = await this.users.findOne({_id:id}) 
        return user? MongoUserModel.getViewModel(user) : undefined
    }
    private getFilter(
        searchLoginTerm:string|null,
        searchEmailTerm:string|null): Filter<MongoUserModel> {
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
    private getSingleFilter(param:string,value:string): Filter<MongoUserModel> {
        const result: any  = {}
        result[param] = RegExp(value, 'i')
        return result
    }
    private getCursor(filter:any, sortBy:string, sortDirection:string): FindCursor<MongoUserModel> {
        const order = sortDirection === 'asc' ? 1 : -1
        return this.users.find(filter).sort(sortBy,order)
    }
    private async getTotalCount(filter:Filter<MongoUserModel>): Promise<number> {
        return await this.users.countDocuments(filter)
    }
    private async loadPageUsers(page:PageViewModel<UserViewModel>,cursor:FindCursor<MongoUserModel>)
    : Promise<PageViewModel<UserViewModel>> {
        const skip = calculateSkip(page.pageSize, page.page)
        const result = await cursor.skip(skip).limit(page.pageSize).toArray()
        const viewModels = result.map(m => MongoUserModel.getViewModel(m))
        return page.add(...viewModels)
    }
}