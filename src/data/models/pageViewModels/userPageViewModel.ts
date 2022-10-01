import UserViewModel from "../viewModels/userViewModel"
import MongoUserModel from "../mongoModels/mongoUserModel"
import PageViewModel from "./PageViewModel"

export default class BlogPageViewModel extends PageViewModel<MongoUserModel,UserViewModel> {
    
    constructor(pagesCount:number, page:number,pageSize:number,totalCount:number) {
        super(pagesCount,page,pageSize,totalCount)
    }
    public add(...mongoBlogs:MongoUserModel[]): BlogPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(MongoUserModel.getViewModel(model))
        })
        return this
    }
}