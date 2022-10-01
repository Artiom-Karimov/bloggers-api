export type UserInputModel = {
    login: string,
    email: string,
    password: string
}

export default class UserModel {
    public id: string
    public login: string
    public email: string
    public createdAt: string
    public passwordHash: string
    public salt: string

    constructor(
        id: string,
        login: string,
        email: string,
        createdAt: string,
        passwordHash: string,
        salt: string
    ) {
        this.id = id
        this.login = login
        this.email = email
        this.createdAt = createdAt
        this.passwordHash = passwordHash
        this.salt = salt
    }
}