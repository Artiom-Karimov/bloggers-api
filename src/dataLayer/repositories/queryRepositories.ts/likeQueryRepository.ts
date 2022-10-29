import "reflect-metadata";
import { Model } from "mongoose"
import ExtendedLikesInfoModel from "../../../presentationLayer/models/viewModels/extendedLikesInfoModel"
import LikesInfoViewModel from "../../../presentationLayer/models/viewModels/likesInfoViewModel"
import LikeViewModel from "../../../presentationLayer/models/viewModels/likeViewModel"
import { ILike } from "../../models/likeModel"
import { User } from "../../models/userModel"
import { injectable, unmanaged } from "inversify";

@injectable()
export default class LikeQueryRepository {
    constructor(@unmanaged() protected readonly model:Model<ILike>) {}

    public async getExtendedLikes(entityId: string, userId:string|undefined): Promise<ExtendedLikesInfoModel> {
        const basicLikes = await this.getLikes(entityId,userId)
        const newestLikes = await this.getNewestLikes(entityId)
        return ExtendedLikesInfoModel.fromBasicModel(basicLikes,newestLikes)
    }
    public async getLikes(entityId: string, userId:string|undefined): Promise<LikesInfoViewModel> {
        try {
            return new LikesInfoViewModel(
                await this.getLikesCount(entityId),
                await this.getDislikesCount(entityId),
                await this.getUserLike(entityId,userId)
            )
        } catch (error) {
            return LikesInfoViewModel.createEmpty()
        }
    }
    protected async getLikesCount(entityId:string): Promise<number> {
        return this.model.countDocuments({entityId:entityId}).where('status').equals('Like')
    }
    protected async getDislikesCount(entityId:string): Promise<number> {
        return this.model.countDocuments({entityId:entityId}).where('status').equals('Dislike')
    }
    protected async getUserLike(entityId:string,userId:string|undefined): Promise<string> {
        if(!userId) return 'None'
        const result = await this.model.findOne({entityId:entityId,userId:userId})
        return result ? result.status : 'None'
    }
    protected async getNewestLikes(entityId:string): Promise<LikeViewModel[]> {
        const dbLikes = await this.getDbNewestLikes(entityId)
        const promises = dbLikes.map(l => this.getLikeView(l))
        return Promise.all(promises)
    }
    protected async getDbNewestLikes(entityId:string): Promise<ILike[]> {
        try {
            return this.model.find({entityId:entityId})
                .where('status').equals('Like')
                .sort({'lastModified': -1}).limit(3)
                .exec()
        } catch (error) {
            return []
        }
    }
    protected async getLikeView(dbLike:ILike): Promise<LikeViewModel> {
        const user = await User.findOne({_id:dbLike.userId})
        return new LikeViewModel(
            dbLike.lastModified.toISOString(),
            dbLike.userId,
            user ? user.accountData.login : ''
        )
    }
}