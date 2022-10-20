import { TestingRepository } from "../interfaces/testingRepository";

export default class TestingService {
    constructor(private readonly repo:TestingRepository) {}
    public deleteAll = async () => {
        await this.repo.dropAllData()
    }
}