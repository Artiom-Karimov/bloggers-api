import BlogViewModel from "../viewModels/blogViewModel"
import MongoBlogModel from "../mongoModels/mongoBlogModel"
import PageViewModel from "./PageViewModel"

export default class BlogPageViewModel extends PageViewModel<MongoBlogModel,BlogViewModel> {
    
    constructor(page:number,pageSize:number,totalCount:number) {
        super(page,pageSize,totalCount)
    }
    public add(...mongoBlogs:MongoBlogModel[]): BlogPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(MongoBlogModel.getViewModel(model))
        })
        return this
    }
}