import CommentRepository from "../data/repositories/commentRepository";
import CommentModel, { CommentCreateModel } from "./models/commentModel";
import DateGenerator from "./utils/dateGenerator";
import { generateId } from "./utils/idGenerator";

export default class CommentService {
    private readonly repo: CommentRepository

    constructor() {
        this.repo = new CommentRepository()
    }
    public async get(id:string): Promise<CommentModel|undefined> {
        return this.repo.get(id)
    }
    public async create(data:CommentCreateModel):Promise<string|undefined> {
        const newComment = new CommentModel(
            generateId(),
            data,
            DateGenerator.generate()
        )
        return (await this.repo.create(newComment))?.id
    }
}