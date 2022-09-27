export type BlogInputModel = {
    name: string,
    youtubeUrl: string
}

export default class BlogModel {
    public id: string
    public name: string
    public youtubeUrl: string
    public createdAt: string

    constructor(id: string, data: BlogInputModel, createdAt: string) {
        this.id = id
        this.name = data.name
        this.youtubeUrl = data.youtubeUrl
        this.createdAt = createdAt
    }
    public clone(): BlogModel {
        return new BlogModel(
            this.id, 
            { name:this.name, youtubeUrl:this.youtubeUrl }, 
            this.createdAt)
    }
    public update(data: BlogInputModel): BlogModel {
        this.name = data.name
        this.youtubeUrl = data.youtubeUrl
        return this
    }
    public equals(another: BlogModel): boolean {
        return (
            this.id === another.id &&
            this.name === another.name &&
            this.youtubeUrl === another.youtubeUrl &&
            this.createdAt === another.createdAt
        )
    }
}