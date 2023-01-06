export enum AuthError {
    NoError,
    LoginExists,
    EmailExists,
    AlreadyConfirmed,
    WrongCode,
    WrongToken,
    WrongCredentials,
    UserNotFound,
    Unknown
}