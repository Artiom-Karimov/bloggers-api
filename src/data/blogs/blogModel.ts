export type BlogInputModel = {
    name: string,
    youtubeUrl: string
}

export class BlogModel {
    public id: string
    public name: string
    public youtubeUrl: string

    constructor(id: string, data: BlogInputModel) {
        this.id = id
        this.name = data.name
        this.youtubeUrl = data.youtubeUrl
    }
    public clone(): BlogModel {
        return new BlogModel(this.id, { name:this.name, youtubeUrl:this.youtubeUrl })
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
            this.youtubeUrl === another.youtubeUrl
        )
    }
}