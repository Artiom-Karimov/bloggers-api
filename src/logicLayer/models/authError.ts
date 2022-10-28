export enum AuthError {
    NoError,
    ActionLimit,
    LoginExists,
    EmailExists,
    AlreadyConfirmed,
    WrongCode,
    WrongToken,
    WrongCredentials,
    UserNotFound,
    Unknown
}