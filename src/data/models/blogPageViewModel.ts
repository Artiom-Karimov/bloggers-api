import BlogViewModel from "./blogViewModel"
import MongoBlogModel from "./mongoBlogModel"

export default class BlogPageViewModel {
    public pagesCount: number
    public page: number
    public pageSize: number
    public totalCount: number
    public items: Array<BlogViewModel> = []

    constructor(pagesCount:number, page:number,pageSize:number,totalCount:number) {
        this.pagesCount = pagesCount
        this.page = page
        this.pageSize = pageSize
        this.totalCount = totalCount
    }
    public add(...mongoBlogs:MongoBlogModel[]): BlogPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(BlogViewModel.fromMongoModel(model))
        })
        return this
    }
}