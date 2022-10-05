import CommentModel from "../../../logic/models/commentModel"
import CommentViewModel from "../viewModels/commentViewModel"

export default class MongoCommentModel {
    public _id: string
    public postId: string
    public userId: string
    public userLogin: string
    public content: string
    public createdAt: string 

    constructor(model:CommentModel) {
        this._id = model.id
        this.postId = model.postId
        this.userId = model.userId
        this.userLogin = model.userLogin
        this.content = model.content
        this.createdAt = model.createdAt
    }
    public static getBusinessModel(mongoModel:MongoCommentModel): CommentModel {
        return new CommentModel(
            mongoModel._id,
            {
                postId: mongoModel.postId,
                userId: mongoModel.userId,
                userLogin: mongoModel.userLogin,
                content: mongoModel.content        
            },
            mongoModel.createdAt
        )
    }
    public static getViewModel(mongoModel:MongoCommentModel): CommentViewModel {
        return new CommentViewModel(
            mongoModel._id,
            mongoModel.content,
            mongoModel.userId,
            mongoModel.userLogin,
            mongoModel.createdAt
        )
    }

}