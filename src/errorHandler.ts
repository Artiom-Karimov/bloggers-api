export default class ErrorHandler {
    constructor() {
        process.on('uncaughtException', (error: Error) => this.handleError(error))
        process.on('unhandledRejection', (error: Error) => this.handleError(error))
    }
    public handleError = (error:Error) => {
        console.error(error)
    }
}