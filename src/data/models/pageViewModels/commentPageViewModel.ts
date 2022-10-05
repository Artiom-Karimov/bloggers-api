import MongoCommentModel from "../mongoModels/mongoCommentModel";
import CommentViewModel from "../viewModels/commentViewModel";
import PageViewModel from "./PageViewModel"

export default class CommentPageViewModel extends PageViewModel<MongoCommentModel,CommentViewModel> {

    constructor(page:number,pageSize:number,totalCount:number) {
        super(page,pageSize,totalCount)
    }
    public add(...mongoBlogs:MongoCommentModel[]): CommentPageViewModel {
        mongoBlogs.forEach((model) => {
            this.items.push(MongoCommentModel.getViewModel(model))
        })
        return this
    }
}