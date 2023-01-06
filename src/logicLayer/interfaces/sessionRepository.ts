import SessionModel from "../models/sessionModel";

export interface ISessionRepository {
    get(id: string): Promise<SessionModel | undefined>
    getByUser(userId: string): Promise<Array<SessionModel>>
    create(session: SessionModel): Promise<string | undefined>
    update(session: SessionModel): Promise<boolean>
    delete(sessionId: string): Promise<boolean>
    deleteAllButOne(userId: string, sessionId: string): Promise<boolean>
}