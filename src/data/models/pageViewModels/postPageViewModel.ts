import PostViewModel from "../viewModels/postViewModel"
import MongoPostModel from "../mongoModels/mongoPostModel"
import PageViewModel from "./PageViewModel"

export default class PostPageViewModel extends PageViewModel<MongoPostModel,PostViewModel> {

    constructor(pagesCount:number, page:number,pageSize:number,totalCount:number) {
        super(pagesCount,page,pageSize,totalCount)
    }
    public add(...mongoBlogs:MongoPostModel[]): PostPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(MongoPostModel.getViewModel(model))
        })
        return this
    }
}