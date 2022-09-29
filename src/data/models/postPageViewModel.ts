import PostViewModel from "./postViewModel"
import MongoPostModel from "./mongoPostModel"

export default class PostPageViewModel {
    public pagesCount: number
    public page: number
    public pageSize: number
    public totalCount: number
    public items: Array<PostViewModel> = []

    constructor(pagesCount:number, page:number,pageSize:number,totalCount:number) {
        this.pagesCount = pagesCount
        this.page = page
        this.pageSize = pageSize
        this.totalCount = totalCount
    }
    public add(...mongoBlogs:MongoPostModel[]): PostPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(PostViewModel.fromMongoModel(model))
        })
        return this
    }
}