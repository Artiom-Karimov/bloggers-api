export default class PostViewModel {
    public id: string
    public title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public createdAt: string

    constructor(
        id:string,
        title:string,
        shortDescription:string,
        content:string,
        blogId:string,
        blogName:string,
        createdAt:string
    ) {
        this.id = id
        this.title = title
        this.shortDescription = shortDescription
        this.content = content
        this.blogId = blogId
        this.blogName = blogName
        this.createdAt = createdAt
    }
}