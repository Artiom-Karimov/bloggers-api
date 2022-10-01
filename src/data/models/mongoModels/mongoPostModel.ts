import PostModel from "../../../logic/models/postModel"
import PostViewModel from "../viewModels/postViewModel"

export default class MongoPostModel {
    public _id: string
    public title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public createdAt: string

    constructor(post:PostModel) {
        this._id = post.id
        this.title = post.title
        this.shortDescription = post.shortDescription
        this.content = post.content
        this.blogId = post.blogId
        this.blogName = post.blogName
        this.createdAt = post.createdAt
    }
    public static getBusinessModel(mongoModel:MongoPostModel): PostModel {
        return new PostModel(
            mongoModel._id,
            {
                title: mongoModel.title,
                shortDescription: mongoModel.shortDescription,
                content: mongoModel.content,
                blogId: mongoModel.blogId,
                blogName: mongoModel.blogName
            },
            mongoModel.createdAt
        )
    }
    public static getViewModel(mongoModel:MongoPostModel): PostViewModel {
        return new PostViewModel(
            mongoModel._id,
            mongoModel.title,
            mongoModel.shortDescription,
            mongoModel.content,
            mongoModel.blogId,
            mongoModel.blogName,
            mongoModel.createdAt
        )
    }
}