import LikesInfoViewModel from "./likesInfoViewModel";
import LikeViewModel from "./likeViewModel";

export default class ExtendedLikesInfoModel extends LikesInfoViewModel {
    constructor(
        likesCount:number,
        dislikesCount:number,
        myStatus:string,
        public newestLikes:LikeViewModel[]
    ) {
        super(likesCount,dislikesCount,myStatus)
    }
    public static fromBasicModel(model:LikesInfoViewModel,newestLikes:LikeViewModel[]): ExtendedLikesInfoModel {
        return new ExtendedLikesInfoModel(
            model.likesCount,
            model.dislikesCount,
            model.myStatus,
            newestLikes
        )
    }
}