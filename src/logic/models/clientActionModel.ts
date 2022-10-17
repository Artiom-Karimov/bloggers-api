export enum ClientAction {
    Unset = 'unset',
    Register = 'register',
    ConfirmEmail = 'confirmEmail',
    Login = 'login',
    RenewToken = 'renewToken'
}

export default class ClentActionModel {
    constructor(
        public id:string,
        public ip:string,
        public action:ClientAction,
        public login:string,
        public deviceName:string,
        public success:boolean,
        public timestamp:number
    ) {}   
}