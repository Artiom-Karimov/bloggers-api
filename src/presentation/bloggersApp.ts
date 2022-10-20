import express, { Request, Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import * as config from '../config/config'
import BlogRouter from './routers/blogRouter'
import PostRouter from './routers/postRouter'
import UserRouter from './routers/userRouter'
import AuthRouter from './routers/authRouter'
import CommentRouter from './routers/commentRouter'
import BloggersMongoDb from '../mongoDataLayer/bloggersMongoDb'
import SecurityRouter from './routers/securityRouter'

export type ConstructorParams = {
    db:BloggersMongoDb,
    blogRouter?:BlogRouter,
    postRouter?:PostRouter,
    userRouter?:UserRouter,
    authRouter?:AuthRouter,
    commentRouter?:CommentRouter,
    securityRouter?:SecurityRouter
}

export default class BloggersApp {
    public readonly port: number
    public readonly server: http.Server
    private readonly db: BloggersMongoDb

    constructor(params:ConstructorParams) {
        this.port = config.port
        this.db = params.db

        const app = express()
        this.server = http.createServer(app)

        app.use(bodyParser.json())
        app.use(cookieParser())
        app.set('trust proxy', true)
        
        if(params.blogRouter) app.use('/blogs', params.blogRouter.router)
        if(params.postRouter) app.use('/posts', params.postRouter.router)
        if(params.userRouter) app.use('/users', params.userRouter.router)
        if(params.authRouter) app.use('/auth', params.authRouter.router)
        if(params.commentRouter) app.use('/comments', params.commentRouter.router)
        if(params.securityRouter) app.use('/security', params.securityRouter.router)

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
    public async stop() {
        await this.db.close()
        this.server.close()
    }
}