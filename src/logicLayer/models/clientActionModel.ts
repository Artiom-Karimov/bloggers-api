export enum ClientAction {
    Unset = 'unset',
    Register = 'register',
    ResendEmail = 'resendEmail',
    ConfirmEmail = 'confirmEmail',
    Login = 'login',
    RenewToken = 'renewToken',
    RecoverPassword = 'recoverPassword',
    SetNewPassword = 'setNewPassword'
}

export default class ClentActionModel {
    constructor(
        public ip:string,
        public action:ClientAction,
        public timestamp:number
    ) {}   
}