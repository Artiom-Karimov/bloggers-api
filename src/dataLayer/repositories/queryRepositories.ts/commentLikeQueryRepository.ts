import "reflect-metadata";
import { injectable } from "inversify"
import { CommentLike } from "../../models/likeModel";
import LikeQueryRepository from "./likeQueryRepository";

@injectable()
export default class CommentLikeQueryRepository extends LikeQueryRepository {
    constructor() { super(CommentLike) }
}