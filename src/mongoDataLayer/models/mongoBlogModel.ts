import BlogModel from "../../logic/models/blogModel"
import BlogViewModel from "../../presentation/models/viewModels/blogViewModel"

export default class MongoBlogModel {
    public _id: string
    public name: string
    public youtubeUrl: string
    public createdAt: string

    constructor(blog:BlogModel) {
        this._id = blog.id
        this.name = blog.name
        this.youtubeUrl = blog.youtubeUrl
        this.createdAt = blog.createdAt
    }
    public static getBusinessModel(mongoModel:MongoBlogModel): BlogModel {
        return new BlogModel(
            mongoModel._id, 
            { name: mongoModel.name, youtubeUrl: mongoModel.youtubeUrl }, 
            mongoModel.createdAt)
    }
    public static getViewModel(mongoModel:MongoBlogModel): BlogViewModel {
        return new BlogViewModel(
            mongoModel._id,
            mongoModel.name,
            mongoModel.youtubeUrl,
            mongoModel.createdAt
        )
    }
}