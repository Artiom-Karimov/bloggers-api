export default class DeviceSessionModel {
    constructor(
        public id: string,
        public ip:string,
        public deviceName:string,
        public issuedAt:number,
        public userId:string,
        public deviceId:string
    ) {}
}