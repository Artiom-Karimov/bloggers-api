export default class CreateUserModel {
    public login: string
    public password: string
    public email: string

    constructor(login:string,password:string,email:string) {
        this.login = login
        this.password = password
        this.email = email
    }
}