import express, { Request, Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import * as config from '../config/config'
import BlogRouter from './routers/blogRouter'
import PostRouter from './routers/postRouter'
import UserRouter from './routers/userRouter'
import AuthRouter from './routers/authRouter'
import CommentRouter from './routers/commentRouter'
import SecurityRouter from './routers/securityRouter'
import TestingRouter from './routers/testingRouter'

export type ConstructorParams = {
    blogRouter?:BlogRouter,
    postRouter?:PostRouter,
    userRouter?:UserRouter,
    authRouter?:AuthRouter,
    commentRouter?:CommentRouter,
    securityRouter?:SecurityRouter,
    testingRouter?:TestingRouter
}

export default class BloggersApp {
    public readonly port: number
    public readonly server: http.Server

    constructor(params:ConstructorParams) {
        this.port = config.port

        const app = express()
        this.server = http.createServer(app)

        app.use(cors())
        app.use(bodyParser.json())
        app.use(cookieParser())
        app.set('trust proxy', true)
        
        if(params.blogRouter) app.use('/blogs', params.blogRouter.router)
        if(params.postRouter) app.use('/posts', params.postRouter.router)
        if(params.userRouter) app.use('/users', params.userRouter.router)
        if(params.authRouter) app.use('/auth', params.authRouter.router)
        if(params.commentRouter) app.use('/comments', params.commentRouter.router)
        if(params.securityRouter) app.use('/security', params.securityRouter.router)
        if(params.testingRouter) app.use('/testing', params.testingRouter.router)

        app.get('/', (req: Request, res: Response) => {
            res.status(200).send('<h1>Положь трубку!</h1>')
        })
    }
    public async start() {
        this.server.listen(this.port, () => {
            console.log(`Listenning on port ${this.port}`)
        })
    }
    public async stop() {
        this.server.close()
    }
}