export enum ClientAction {
    Unset = 'unset',
    Register = 'register',
    ResendEmail = 'resendEmail',
    ConfirmEmail = 'confirmEmail',
    Login = 'login',
    RenewToken = 'renewToken'
}

export default class ClentActionModel {
    constructor(
        public ip:string,
        public action:ClientAction,
        public timestamp:number
    ) {}   
}