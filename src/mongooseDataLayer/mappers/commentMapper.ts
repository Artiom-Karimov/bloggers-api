import CommentModel from "../../logic/models/commentModel";
import CommentViewModel from "../../presentation/models/viewModels/commentViewModel";
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
    public static toView(model:IComment): CommentViewModel {
        return new CommentViewModel(
            model._id,
            model.content,
            model.userId,
            model.userLogin,
            model.createdAt
        )
    }
}