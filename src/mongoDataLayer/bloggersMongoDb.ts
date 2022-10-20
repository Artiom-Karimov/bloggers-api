import { MongoClient, Db, Collection } from "mongodb"
import MongoBlogModel from "./models/mongoBlogModel"
import MongoCommentModel from "./models/mongoCommentModel"
import MongoDeviceSessionModel from "./models/mongoDeviceSessionModel"
import MongoPostModel from "./models/mongoPostModel"
import MongoUserModel from "./models/mongoUserModel"

export default class BloggersMongoDb {
    public readonly blogCollection: Collection<MongoBlogModel>
    public readonly postCollection: Collection<MongoPostModel>
    public readonly userCollection: Collection<MongoUserModel>
    public readonly commentCollection: Collection<MongoCommentModel>
    public readonly deviceSessionCollection: Collection<MongoDeviceSessionModel>

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
        this.commentCollection = this.db.collection<MongoCommentModel>('comments')
        this.deviceSessionCollection = this.db.collection<MongoDeviceSessionModel>('deviceSessions')
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
        await this.userCollection.deleteMany({})
        await this.commentCollection.deleteMany({})
        await this.deviceSessionCollection.deleteMany({})
    } 
}