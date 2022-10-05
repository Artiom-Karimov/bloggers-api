import CommentModel from "../../../logic/models/commentModel"

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
}