import { MongoClient, Db, Collection } from "mongodb"
import MongoBlogModel from "./models/mongoModels/mongoBlogModel"
import MongoPostModel from "./models/mongoModels/mongoPostModel"
import MongoUserModel from "./models/mongoModels/mongoUserModel"

export default class BloggersMongoDb {
    public readonly blogCollection: Collection<MongoBlogModel>
    public readonly postCollection: Collection<MongoPostModel>
    public readonly userCollection: Collection<MongoUserModel>

    private readonly mongoUri: string
    private readonly client: MongoClient
    private readonly db: Db
    
    constructor(mongoUri:string) {
        this.mongoUri = mongoUri
        this.client = new MongoClient(this.mongoUri)
        this.db = this.client.db('bloggers')
        this.blogCollection = this.db.collection<MongoBlogModel>('blogs')
        this.postCollection = this.db.collection<MongoPostModel>('posts')
        this.userCollection = this.db.collection<MongoUserModel>('users')
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
    public async clearAll() {
        await this.blogCollection.deleteMany({})
        await this.postCollection.deleteMany({})
    } 
}