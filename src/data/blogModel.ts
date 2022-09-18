export class BlogModel {
    public id: string
    public name: string
    public youtubeUrl: string

    constructor(id: string, name: string, youtubeUrl: string) {
        this.id = id
        this.name = name
        this.youtubeUrl = youtubeUrl
    }
    public clone(): BlogModel {
        return new BlogModel(this.id, this.name, this.youtubeUrl)
    }
    public update(name: string, youtubeUrl: string): BlogModel {
        this.name = name
        this.youtubeUrl = youtubeUrl
        return this
    }
}