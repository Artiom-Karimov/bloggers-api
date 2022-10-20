import { TestingRepository as ITestingRepository } from '../../logic/interfaces/testingRepository'
import BloggersMongoDb from '../bloggersMongoDb';

export default class TestingRepository implements ITestingRepository {
    constructor(private readonly db:BloggersMongoDb) {}
    public dropAllData = async (): Promise<void> => {
        await this.db.clearAll()
    }
}