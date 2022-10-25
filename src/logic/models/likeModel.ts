import IdGenerator from "../utils/idGenerator";
import { PutLikeInfoModelType } from "./clientActionTypes";

export enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

export default class LikeModel {
    constructor(
        public id:string,
        public entityId:string,
        public userId:string,
        public status: LikeStatus,
        public lastModified:number
    ) {}
    public static create(data:PutLikeInfoModelType): LikeModel {
        return new LikeModel(
            IdGenerator.generate(),
            data.entityId,
            data.userId,
            data.status,
            new Date().getTime()
        )
    }
    public static update(model:LikeModel,status:LikeStatus): LikeModel {
        model.status = status
        model.lastModified = new Date().getTime()
        return model
    }
}