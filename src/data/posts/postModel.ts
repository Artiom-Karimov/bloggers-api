import { getDate } from "../dateGenerator"

export type PostInputModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
}

export class PostModel {
    public id: string
    public title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public createdAt: string

    constructor(id:string, data: PostInputModel) {
        this.id = id
        this.title = data.title
        this.shortDescription = data.shortDescription
        this.content = data.content
        this.blogId = data.blogId
        this.blogName = data.blogName
        this.createdAt = getDate()
    }
    public clone(): PostModel {
        const clone =  new PostModel(
            this.id, {
                title: this.title,
                shortDescription: this.shortDescription,
                content: this.content,
                blogId: this.blogId,
                blogName: this.blogName 
            }
        )
        clone.createdAt = this.createdAt
        return clone
    }
    public update(data: PostInputModel): PostModel {
        this.title = data.title
        this.shortDescription = data.shortDescription
        this.content = data.content
        this.blogId = data.blogId
        this.blogName = data.blogName
        return this;
    }
    public equals(another: PostModel): boolean {
        return (
            this.id === another.id &&
            this.title === another.title &&
            this.shortDescription === another.shortDescription &&
            this.content === another.content &&
            this.blogId === another.blogId &&
            this.blogName === another.blogName &&
            this.createdAt === another.createdAt
        )
    }
}