import * as config from '../config/config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import BloggersMongoDb from '../mongoDataLayer/bloggersMongoDb'

import BlogRepository from '../mongooseDataLayer/repositories/blogRepository'
import PostRepository from '../mongooseDataLayer/repositories/postRepository'
import BlogPostQueryRepository from '../mongooseDataLayer/repositories/blogPostQueryRepository'
import CommentRepository from '../mongooseDataLayer/repositories/commentRepository'
import CommentQueryRepository from '../mongooseDataLayer/repositories/commentQueryRepository'
import UserRepository from '../mongooseDataLayer/repositories/userRepository'
import UserQueryRepository from '../mongooseDataLayer/repositories/userQueryRepository'
import DeviceSessionRepository from '../mongooseDataLayer/repositories/deviceSessionRepository'
import DeviceSessionQueryRepository from '../mongooseDataLayer/repositories/deviceSessionQueryRepository'
import TestingRepository from '../mongooseDataLayer/repositories/testingRepository'

import { ConfirmEmailSender } from '../email/confirmationEmailSender'
import BlogService from '../logic/services/blogService'
import PostService from '../logic/services/postService'
import UserService from '../logic/services/userService'
import CommentService from '../logic/services/commentService'
import AuthRouter from '../presentation/routers/authRouter'
import BlogRouter from '../presentation/routers/blogRouter'
import CommentRouter from '../presentation/routers/commentRouter'
import PostRouter from '../presentation/routers/postRouter'
import UserRouter from '../presentation/routers/userRouter'
import BloggersApp from '../presentation/bloggersApp'
import AuthMiddlewareProvider from '../presentation/middlewares/authMiddlewareProvider'
import DeviceSessionService from '../logic/services/deviceSessionService'
import AuthService from '../logic/services/authService'
import ClientActionRepository from '../logic/utils/clientActionCollection'
import SecurityRouter from '../presentation/routers/securityRouter'
import ClientActionService from '../logic/services/clientActionService'
import TestingRouter from '../presentation/routers/testingRouter'
import TestingService from '../logic/services/testingService'

import mongoose from 'mongoose'

const login = config.userName
const password = config.password

let mongoServ: MongoMemoryServer
let db: BloggersMongoDb

let blogRepository: BlogRepository
let postRepository: PostRepository
let userRepository: UserRepository
let commentRepository: CommentRepository
let queryRepository: BlogPostQueryRepository
let userQueryRepository: UserQueryRepository
let commentQueryRepository: CommentQueryRepository
let deviceSessionRepository: DeviceSessionRepository
let clientActionRepository: ClientActionRepository
let deviceSessionQueryRepository: DeviceSessionQueryRepository
let testingRepository: TestingRepository

const fakeConfirmEmailSender: ConfirmEmailSender = {
    send(login:string,email:string,code:string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}

let blogService: BlogService
let postService: PostService
let deviceService: DeviceSessionService
let userService: UserService
let commentService: CommentService
let authService: AuthService
let actionService: ClientActionService
let testingService: TestingService

let authProvider: AuthMiddlewareProvider

let authRouter: AuthRouter
let blogRouter: BlogRouter
let commentRouter: CommentRouter
let postRouter: PostRouter
let userRouter: UserRouter
let securityRouter: SecurityRouter
let testingRouter: TestingRouter

let app: BloggersApp

// const initDb = async () => {
//     mongoServ = await MongoMemoryServer.create()
//     const uri = mongoServ.getUri()
//     db = new BloggersMongoDb(uri)
//     await mongoose.connect(uri)
//     await db.connect()
// }
const initDb = async () => {
    const uri = 'mongodb://0.0.0.0:27017'
    db = new BloggersMongoDb(uri)
    await mongoose.connect(uri + '/bloggers')
    await db.connect()
}
const initRepos = async () => {
    if(!db) await initDb()
    blogRepository = new BlogRepository()
    postRepository = new PostRepository()
    userRepository = new UserRepository()
    commentRepository = new CommentRepository()
    queryRepository = new BlogPostQueryRepository()
    userQueryRepository = new UserQueryRepository()
    commentQueryRepository = new CommentQueryRepository()
    deviceSessionRepository = new DeviceSessionRepository()
    clientActionRepository = new ClientActionRepository()
    deviceSessionQueryRepository = new DeviceSessionQueryRepository()
    testingRepository = new TestingRepository()
}
const initServices = async () => {
    if(!blogRepository) await initRepos()
    blogService = new BlogService(blogRepository)
    postService = new PostService(postRepository)
    deviceService = new DeviceSessionService(deviceSessionRepository)
    userService = new UserService(userRepository)
    commentService = new CommentService(commentRepository)
    actionService = new ClientActionService(clientActionRepository)
    authService = new AuthService(userService,deviceService,actionService,fakeConfirmEmailSender)
    testingService = new TestingService(testingRepository)
}
const initRouters = async () => {
    if(!blogService) await initServices()
    authProvider = new AuthMiddlewareProvider(userService)
    authRouter = new AuthRouter(authService,userQueryRepository,authProvider)
    blogRouter = new BlogRouter(blogService,postService,queryRepository,authProvider)
    commentRouter = new CommentRouter(commentService,commentQueryRepository,authProvider)
    postRouter = new PostRouter(postService,blogService,commentService,queryRepository,commentQueryRepository,authProvider)
    userRouter = new UserRouter(userService,userQueryRepository,authProvider)
    securityRouter = new SecurityRouter(deviceService,deviceSessionQueryRepository,authProvider)
    testingRouter = new TestingRouter(testingService)
}

const initApp = async () => {
    if(!authRouter) await initRouters()
    app = new BloggersApp({
        blogRouter,
        postRouter,
        userRouter,
        authRouter,
        commentRouter,
        securityRouter,
        testingRouter
    })
}
const stopApp = async () => {
    await app.stop()
    await db.close()
    await mongoose.disconnect()
    //await mongoServ.stop()
}

export {
    login,
    password,
    db,
    app,

    userService,
    initServices,
    initApp,
    stopApp
}


