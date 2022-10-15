export default class LoginAttemptModel {
    constructor(
        public id:string,
        public ip:string,
        public login:string,
        public deviceName:string,
        public success:boolean,
        public timestamp:number
    ) {}
}