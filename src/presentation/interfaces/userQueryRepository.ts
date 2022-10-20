import GetUsersQueryParams from "../models/queryParams/getUsersQueryParams";
import PageViewModel from "../models/viewModels/pageViewModel";
import UserViewModel from "../models/viewModels/userViewModel";

export interface UserQueryRepository {
    getById(id:string): Promise<UserViewModel|undefined>
    get(params:GetUsersQueryParams): Promise<PageViewModel<UserViewModel>>
}