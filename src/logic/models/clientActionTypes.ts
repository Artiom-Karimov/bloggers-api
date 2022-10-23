export type LoginModelType = {
    login:string,
    password:string,
    ip:string,
    deviceName:string
}
export type RegisterModelType = {
    login:string,
    email:string,
    password:string,
    ip:string,
    deviceName:string
}
export type ResendEmailModelType = {
    email:string,
    ip:string,
    deviceName:string
}
export type RenewTokenModelType = {
    refreshToken:string,
    ip:string,
    deviceName:string
}
export type ConfirmEmailModelType = {
    login:string,
    ip:string,
    deviceName:string,
    code:string
}
export type RecoverPasswordModelType = {
    ip:string,
    email:string
}
export type SetNewPasswordModelType = {
    ip:string,
    password:string,
    code:string
}