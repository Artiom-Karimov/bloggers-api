export default class BlogViewModel {
    public id: string
    public name: string
    public youtubeUrl: string
    public createdAt: string

    constructor(id:string,name:string,youtubeUrl:string,createdAt:string) {
        this.id = id
        this.name = name
        this.youtubeUrl = youtubeUrl
        this.createdAt = createdAt
    }
}