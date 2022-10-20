export default class CommentViewModel {
    public id: string    
    public content: string
    public userId: string
    public userLogin: string
    public createdAt: string 

    constructor(
        id: string,
        content: string,
        userId: string,
        userLogin: string,
        createdAt: string 
    ) {
        this.id = id
        this.content = content
        this.userId = userId
        this.userLogin = userLogin
        this.createdAt = createdAt
    }
}