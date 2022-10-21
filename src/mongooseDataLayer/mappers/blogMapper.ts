import BlogModel from "../../logic/models/blogModel";
import BlogViewModel from "../../presentation/models/viewModels/blogViewModel";
import { IBlog } from "../models/blogModel";

export default class BlogMapper {
    public static fromBusiness(model:BlogModel): IBlog {
        return {
            _id:model.id,
            name:model.name,
            youtubeUrl:model.youtubeUrl,
            createdAt:model.createdAt
        }
    }
    public static toBusiness(model:IBlog): BlogModel {
        return new BlogModel(
            model._id,
            { name:model.name,youtubeUrl:model.youtubeUrl },
            model.createdAt
        )
    }
    public static toView(model:IBlog): BlogViewModel {
        return new BlogViewModel(
            model._id,
            model.name,
            model.youtubeUrl,
            model.createdAt
        )
    }
}