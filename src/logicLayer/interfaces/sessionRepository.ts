import SessionModel from "../models/sessionModel";

export interface ISessionRepository {
    get(id:string): Promise<SessionModel|undefined>
    getByUser(id:string): Promise<Array<SessionModel>>
    create(session:SessionModel): Promise<string|undefined>
    update(session:SessionModel): Promise<boolean>
    delete(id:string): Promise<boolean>
}