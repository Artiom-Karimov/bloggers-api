import LikeModel, { LikeStatus } from "../../logicLayer/models/likeModel";
import { ILike } from "../models/likeModel";

export default class LikeMapper {
    public static fromBusiness(data:LikeModel): ILike {
        return {
            _id:data.id,
            entityId:data.entityId,
            userId:data.userId,
            status:data.status,
            lastModified:new Date(data.lastModified)
        }
    }
    public static toBusiness(data:ILike): LikeModel {
        return new LikeModel(
            data._id,
            data.entityId,
            data.userId,
            data.status as LikeStatus,
            data.lastModified.getTime()
        )
    }
}