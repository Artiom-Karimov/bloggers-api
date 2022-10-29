import PostViewModel from "./postViewModel";

export default class OldPostViewModel {
    public id:string
    public title:string
    public shortDescription:string
    public content:string
    public blogId:string
    public blogName:string
    public createdAt:string

    constructor(model:PostViewModel) {
        this.id = model.id
        this.title = model.title
        this.shortDescription = model.shortDescription
        this.content = model.content
        this.blogId = model.blogId
        this.blogName = model.blogName
        this.createdAt = model.createdAt
    }
}