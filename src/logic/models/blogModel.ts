export type BlogInputModel = {
    name: string,
    youtubeUrl: string
}

export default class BlogModel {
    public id: string
    public name: string
    public youtubeUrl: string
    public createdAt: string

    constructor(
        id: string, 
        data: BlogInputModel, 
        createdAt: string
        ) {
            this.id = id
            this.name = data.name
            this.youtubeUrl = data.youtubeUrl
            this.createdAt = createdAt
    }
}