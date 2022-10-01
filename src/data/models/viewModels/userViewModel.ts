export default class UserViewModel {
    public id: string
    public login: string
    public email: string
    public createdAt: string

    constructor(
        id: string,
        login: string,
        email: string,
        createdAt: string,
    ) {
        this.id = id
        this.login = login
        this.email = email
        this.createdAt = createdAt
    }    
}