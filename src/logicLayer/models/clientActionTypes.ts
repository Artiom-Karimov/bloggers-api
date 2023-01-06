import { LikeStatus } from "./likeModel"

export type LoginModelType = {
    login: string,
    password: string,
    ip: string,
    deviceName: string,
}
export type RenewTokenModelType = {
    refreshToken: string,
    ip: string,
    deviceName: string,
}
export type ConfirmEmailModelType = {
    login: string,
    code: string
}
export type SetNewPasswordModelType = {
    password: string,
    code: string
}
export type PutLikeInfoModelType = {
    userId: string,
    entityId: string,
    status: LikeStatus
}