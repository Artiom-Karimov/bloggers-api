export type PostInputModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
}

export default class PostModel {
    public id: string
    public title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public createdAt: string

    constructor(id:string, data: PostInputModel, createdAt: string) {
        this.id = id
        this.title = data.title
        this.shortDescription = data.shortDescription
        this.content = data.content
        this.blogId = data.blogId
        this.blogName = data.blogName
        this.createdAt = createdAt
    }
}