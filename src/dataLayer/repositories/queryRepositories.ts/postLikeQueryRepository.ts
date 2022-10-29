import "reflect-metadata";
import { injectable } from "inversify"
import { PostLike } from "../../models/likeModel";
import LikeQueryRepository from "./likeQueryRepository";

@injectable()
export default class PostLikeQueryRepository extends LikeQueryRepository {
    constructor() { super(PostLike) }
}