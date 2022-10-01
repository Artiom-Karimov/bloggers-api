import UserViewModel from "../viewModels/userViewModel"
import MongoUserModel from "../mongoModels/mongoUserModel"
import PageViewModel from "./PageViewModel"

export default class UserPageViewModel extends PageViewModel<MongoUserModel,UserViewModel> {
    
    constructor(page:number,pageSize:number,totalCount:number) {
        super(page,pageSize,totalCount)
    }
    public add(...mongoBlogs:MongoUserModel[]): UserPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(MongoUserModel.getViewModel(model))
        })
        return this
    }
}