import CommentModel from "../../logicLayer/models/commentModel";
import CommentViewModel from "../../presentationLayer/models/viewModels/commentViewModel";
import LikesInfoViewModel from "../../presentationLayer/models/viewModels/likesInfoViewModel";
import { IComment } from "../models/commentModel";

export default class CommentMapper {
    public static fromBusiness(model:CommentModel): IComment {
        return {
            _id: model.id,
            postId: model.postId,
            userId: model.userId,
            userLogin: model.userLogin,
            content: model.content,
            createdAt: model.createdAt
        }
    }
    public static toBusiness(model:IComment): CommentModel {
        return new CommentModel(
            model._id,
            {
                postId: model.postId,
                userId: model.userId,
                userLogin: model.userLogin,
                content: model.content
            },
            model.createdAt
        )
    }
    public static toView(model:IComment,likes:LikesInfoViewModel): CommentViewModel {
        return new CommentViewModel(
            model._id,
            model.content,
            model.userId,
            model.userLogin,
            model.createdAt,
            likes
        )
    }
}