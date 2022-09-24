import express, { Request, Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'

import { BlogsRouter } from '../presentation/blogs/blogsRouter'
import { PostsRouter } from '../presentation/posts/postsRouter'
import { BloggersMongDb } from '../data/bloggersMongoDb'
import { BlogRepository } from '../data/blogs/blogRepository'
import { PostRepository } from '../data/posts/postRepository'

export class BloggersApp {
    public readonly port: number
    public readonly server: http.Server
    
    private readonly db: BloggersMongDb

    constructor(port: number) {
        this.port = port
        this.db = new BloggersMongDb()

        const app = express()
        this.server = http.createServer(app)

        app.use(bodyParser.json())
        app.use('/blogs', new BlogsRouter(new BlogRepository(this.db)).router)
        app.use('/posts', new PostsRouter(new PostRepository(this.db)).router)

        app.get('/', (req: Request, res: Response) => {
            res.sendStatus(404)
        })
        
        app.delete('/testing/all-data', async (req: Request, res: Response) => {
            await this.db.clearAll()
            res.sendStatus(204)
        })
    }
    public async start() {
        await this.db.connect()
        this.server.listen(this.port, () => {
            console.log(`Listenning on port ${this.port}`)
        })
    }
    public async startDbOnly() {
        await this.db.connect()
    }
    public async stop() {
        await this.db.close()
        this.server.close()
    }
}