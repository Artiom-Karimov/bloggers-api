import { MongoClient, Db, Collection } from "mongodb"
import { BlogModel } from "./blogs/blogModel"
import { PostModel } from "./posts/postModel"

export class BloggersMongDb {
    public readonly blogCollection: Collection<BlogModel>
    public readonly postCollection: Collection<PostModel>

    private readonly mongoUri: string
    private readonly client: MongoClient
    private readonly db: Db
    
    constructor() {
        this.mongoUri = process.env.mongoUri || 'mongodb://0.0.0.0:27017'
        this.client = new MongoClient(this.mongoUri)
        this.db = this.client.db('bloggers')
        this.blogCollection = this.db.collection<BlogModel>('blogs')
        this.postCollection = this.db.collection<PostModel>('posts')
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