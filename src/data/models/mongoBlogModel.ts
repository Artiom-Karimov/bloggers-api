import BlogModel from "../../logic/models/blogModel"

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
    public static convert(mongModel:MongoBlogModel): BlogModel {
        return new BlogModel(
            mongModel._id, 
            { name: mongModel.name, youtubeUrl: mongModel.youtubeUrl }, 
            mongModel.createdAt)
    }
}