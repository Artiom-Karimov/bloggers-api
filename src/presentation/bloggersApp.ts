import express, { Request, Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import * as config from '../config/config'
import BlogRouter from './routers/blogRouter'
import PostRouter from './routers/postRouter'
import UserRouter from './routers/userRouter'
import AuthRouter from './routers/authRouter'

export default class BloggersApp {
    public readonly port: number
    public readonly server: http.Server

    constructor() {
        this.port = config.port

        const app = express()
        this.server = http.createServer(app)

        app.use(bodyParser.json())
        app.use(cookieParser())
        app.use('/blogs', new BlogRouter().router)
        app.use('/posts', new PostRouter().router)
        app.use('/users', new UserRouter().router)
        app.use('/auth', new AuthRouter().router)

        app.get('/', (req: Request, res: Response) => {
            res.sendStatus(404)
        })
        
        app.delete('/testing/all-data', async (req: Request, res: Response) => {
            await config.db.clearAll()
            res.sendStatus(204)
        })
    }
    public async start() {
        await config.db.connect()
        this.server.listen(this.port, () => {
            console.log(`Listenning on port ${this.port}`)
        })
    }
    public async startDbOnly() {
        await config.db.connect()
    }
    public async stop() {
        await config.db.close()
        this.server.close()
    }
}