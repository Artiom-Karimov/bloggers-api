export default class DeviceSessionViewModel {
    constructor(
        public ip: string,
        public title: string,
        public lastActiveDate: string,
        public deviceId: string
    ) {}
}