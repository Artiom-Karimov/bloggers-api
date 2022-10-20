import CommentModel from "../models/commentModel";

export interface CommentRepository {
    get(id:string): Promise<CommentModel|undefined>
    create(comment:CommentModel): Promise<string|undefined>
    update(id:string,content:string): Promise<boolean>
    delete(id:string): Promise<boolean>
}