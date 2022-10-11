export type UserInputModel = {
    login: string,
    email: string,
    password: string
}
export type AccountData = {
    login:string,
    email:string,
    passwordHash:string,
    salt:string,
    createdAt:string
}
export type EmailConfirmation = {
    confirmed:boolean,
    code:string,
    codeExpiration:number
}

export default class UserModel {
    public id: string
    public accountData: AccountData
    public emailConfirmation: EmailConfirmation 
    public refreshTokens: string[]

    constructor(
        id: string,
        accountData: AccountData,
        emailConfirmation: EmailConfirmation,
        refreshTokens: string[] = []
    ) {
        this.id = id
        this.accountData = {
            login:accountData.login,
            email:accountData.email,
            passwordHash:accountData.passwordHash,
            salt:accountData.salt,
            createdAt:accountData.createdAt
        }
        this.emailConfirmation = {
            confirmed:emailConfirmation.confirmed,
            code:emailConfirmation.code,
            codeExpiration:emailConfirmation.codeExpiration
        }
        this.refreshTokens = [ ...refreshTokens ]
    }
}