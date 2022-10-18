import { Collection, Db, MongoClient } from "mongodb";
import MongoClentActionModel from "./models/mongoModels/MongoClientActionModel";

export default class ClientActionMongoDb {
    public readonly clientActionCollection: Collection<MongoClentActionModel>

    private readonly mongoUri: string
    private readonly client: MongoClient
    private readonly db: Db

    constructor(mongoUri:string) {
        this.mongoUri = mongoUri
        this.client = new MongoClient(this.mongoUri)
        this.db = this.client.db('bloggers')
        this.clientActionCollection = this.db.collection<MongoClentActionModel>('clientActions')
    }
    public async connect() {
        try {
            await this.client.connect()
            await this.db.command({ping:1})
        }
        catch(error) {
            console.log(error)
            await this.client.close()
        }
    }
    public async close() {
        try {
            await this.client.close()
        } catch {}
    } 
}