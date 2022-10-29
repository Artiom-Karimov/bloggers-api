import "reflect-metadata";
import { inject, injectable } from "inversify";
import { ITestingRepository } from "../interfaces/testingRepository";
import { Types } from "../../inversifyTypes";

@injectable()
export default class TestingService {
    constructor(@inject(Types.TestingRepository) private readonly repo:ITestingRepository) {}
    public deleteAll = async () => {
        await this.repo.dropAllData()
    }
}