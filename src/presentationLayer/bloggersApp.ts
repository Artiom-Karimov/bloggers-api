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
import { inject, injectable } from 'inversify'
import { Types } from '../inversifyTypes'

@injectable()
export default class BloggersApp {
    public readonly port: number
    public readonly server: http.Server

    constructor(
        @inject(Types.BlogRouter) blogRouter:BlogRouter,
        @inject(Types.PostRouter) postRouter:PostRouter,
        @inject(Types.UserRouter) userRouter:UserRouter,
        @inject(Types.AuthRouter) authRouter:AuthRouter,
        @inject(Types.CommentRouter) commentRouter:CommentRouter,
        @inject(Types.SecurityRouter) securityRouter:SecurityRouter,
        @inject(Types.TestingRouter) testingRouter:TestingRouter,
    ) {
        this.port = config.port

        const app = express()
        this.server = http.createServer(app)

        app.use(cors())
        app.use(bodyParser.json())
        app.use(cookieParser())
        app.set('trust proxy', true)
        
        app.use('/blogs', blogRouter.router)
        app.use('/posts', postRouter.router)
        app.use('/users', userRouter.router)
        app.use('/auth', authRouter.router)
        app.use('/comments', commentRouter.router)
        app.use('/security', securityRouter.router)
        app.use('/testing', testingRouter.router)

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