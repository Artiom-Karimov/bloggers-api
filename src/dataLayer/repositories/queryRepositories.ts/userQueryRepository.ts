import "reflect-metadata";
import { injectable } from "inversify";
import { UserQueryRepository as IUserQueryRepository } from "../../../presentationLayer/interfaces/userQueryRepository";
import GetUsersQueryParams from "../../../presentationLayer/models/queryParams/getUsersQueryParams";
import PageViewModel from "../../../presentationLayer/models/viewModels/pageViewModel";
import UserViewModel from "../../../presentationLayer/models/viewModels/userViewModel";
import UserMapper from "../../mappers/userMapper";
import { IUser, User } from "../../models/userModel";
import SortFactory from "../utils/sortFactory";

@injectable()
export default class UserQueryRepository implements IUserQueryRepository {
    public async getById(id: string): Promise<UserViewModel | undefined> {
        try {
            const user = await User.findOne({_id:id})
            return user? UserMapper.toView(user) : undefined
        } catch (error) {
            console.log(error)
            return undefined
        }
    }
    public async get(params: GetUsersQueryParams): Promise<PageViewModel<UserViewModel>> {
        const filter = this.getFilter(params.searchLoginTerm,params.searchEmailTerm)
        const count = await this.getCount(filter)
        const page = new PageViewModel<UserViewModel>(params.pageNumber,params.pageSize,count)
        const query = this.getQuery(filter,params.sortBy,params.sortDirection)
        return this.loadPageUsers(page,query)
    }
    private getFilter(searchLoginTerm:string|null,searchEmailTerm:string|null): any {
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
    private getSingleFilter(param:string,value:string): any {
        const result: any  = {}
        result[param] = RegExp(value, 'i')
        return result
    }
    private async getCount(filter:any): Promise<number> {
        try {
            return User.countDocuments(filter).exec()
        } catch (error) {
            console.log(error)
            return 0
        }
    }
    private getQuery(filter:any,sortBy:string,sortDirection:string): any {
        return User.find(filter).sort(SortFactory.get(sortBy,sortDirection))
    }
    private async loadPageUsers(page:PageViewModel<UserViewModel>,query:any): Promise<PageViewModel<UserViewModel>> {
        try {
            const users: IUser[] = await query.skip(page.calculateSkip()).limit(page.pageSize).exec()
            const viewModels = users.map(u => UserMapper.toView(u))
            return page.add(...viewModels)
        } catch (error) {
            console.log(error)
            return page
        }
    }
}