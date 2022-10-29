export type SessionCreateType = {
    ip:string,
    deviceName:string,
    userId:string,
}

export default class SessionModel {
    constructor(
        public deviceId:string,
        public ip:string,
        public deviceName:string,
        public issuedAt:number,
        public expiresAt:number,
        public userId:string
    ) {}
}