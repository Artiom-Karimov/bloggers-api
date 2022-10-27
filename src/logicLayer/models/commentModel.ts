import { convertTypeAcquisitionFromJson } from "typescript"

export type CommentInputModel = {
    postId: string,
    userId: string,
    content: string
}
export type CommentCreateModel = {
    postId: string,
    userId: string,
    userLogin: string,
    content: string
}

export default class CommentModel {
    public id: string
    public postId: string
    public userId: string
    public userLogin: string
    public content: string
    public createdAt: string

    constructor(
        id:string, 
        data:CommentCreateModel, 
        createdAt:string
        ) {
        this.id = id
        this.postId = data.postId
        this.userId = data.userId
        this.userLogin = data.userLogin
        this.content = data.content
        this.createdAt = createdAt
    }
}