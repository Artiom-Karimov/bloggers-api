import "reflect-metadata";
import { ITestingRepository } from "../../logicLayer/interfaces/testingRepository";
import { Blog } from "../models/blogModel";
import { Post } from "../models/postModel";
import { Comment } from '../models/commentModel'
import { DeviceSession } from "../models/deviceSessionModel";
import { User } from "../models/userModel";
import { injectable } from "inversify";

@injectable()
export default class TestingRepository implements ITestingRepository {
    public async dropAllData(): Promise<void> {
        try {
            const promises = [
                Blog.deleteMany({}).exec(),
                Post.deleteMany({}).exec(),
                Comment.deleteMany({}).exec(),
                DeviceSession.deleteMany({}).exec(),
                User.deleteMany({}).exec()
            ]
            await Promise.all(promises)
        } catch (error) {
            console.log(error)
        }
    }

}