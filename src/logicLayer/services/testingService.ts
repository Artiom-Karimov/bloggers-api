import "reflect-metadata";
import { injectable } from "inversify";
import { TestingRepository } from "../interfaces/testingRepository";

@injectable()
export default class TestingService {
    constructor(private readonly repo:TestingRepository) {}
    public deleteAll = async () => {
        await this.repo.dropAllData()
    }
}