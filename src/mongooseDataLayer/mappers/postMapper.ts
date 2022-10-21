import PostModel from "../../logic/models/postModel";
import PostViewModel from "../../presentation/models/viewModels/postViewModel";
import { IPost } from "../models/postModel";

export default class PostMapper {
    public static fromBusiness(model:PostModel): IPost {
        return {
            _id:model.id,
            title:model.title,
            shortDescription:model.shortDescription,
            content:model.content,
            blogId:model.blogId,
            blogName:model.blogName,
            createdAt:model.createdAt
        }
    }
    public static toBusiness(model:IPost): PostModel {
        return new PostModel(
            model._id,
            {
                title:model.title,
                shortDescription:model.shortDescription,
                content:model.content,
                blogId:model.blogId,
                blogName:model.blogName
            },
            model.createdAt
        )
    }
    public static toView(model:IPost): PostViewModel {
        return new PostViewModel(
            model._id,
            model.title,
            model.shortDescription,
            model.content,
            model.blogId,
            model.blogName,
            model.createdAt
        )
    }
}
