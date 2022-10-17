import * as config from '../config/config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import BloggersMongoDb from '../data/bloggersMongoDb'
import BlogRepository from '../data/repositories/blogRepository'
import PostRepository from '../data/repositories/postRepository'
import UserRepository from '../data/repositories/userRepository'
import CommentRepository from '../data/repositories/commentRepository'
import QueryRepository from '../data/repositories/queryRepository'
import UserQueryRepository from '../data/repositories/userQueryRepository'
import CommentQueryRepository from '../data/repositories/commentQueryRepository'
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
import DeviceSessionRepository from '../data/repositories/deviceSessionRepository'
import DeviceSessionService from '../logic/services/deviceSessionService'
import AuthService from '../logic/services/authService'
import ClientActionRepository from '../data/repositories/clientActionRepository'
import SecurityRouter from '../presentation/routers/securityRouter'
import DeviceSessionQueryRepository from '../data/repositories/deviceSessionQueryRepository'

const login = config.userName
const password = config.password

let mongoServ: MongoMemoryServer
let db: BloggersMongoDb

let blogRepository: BlogRepository
let postRepository: PostRepository
let userRepository: UserRepository
let commentRepository: CommentRepository
let queryRepository: QueryRepository
let userQueryRepository: UserQueryRepository
let commentQueryRepository: CommentQueryRepository
let deviceSessionRepository: DeviceSessionRepository
let clientActionRepository: ClientActionRepository
let deviceSessionQueryRepository: DeviceSessionQueryRepository

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

let authProvider: AuthMiddlewareProvider

let authRouter: AuthRouter
let blogRouter: BlogRouter
let commentRouter: CommentRouter
let postRouter: PostRouter
let userRouter: UserRouter
let securityRouter: SecurityRouter

let app: BloggersApp

const initDb = async () => {
    mongoServ = await MongoMemoryServer.create()
    db = new BloggersMongoDb(mongoServ.getUri())
    await db.connect()
}
// const initDb = async () => {
//     db = new BloggersMongoDb('mongodb://0.0.0.0:27017')
//     await db.connect()
// }
const initRepos = async () => {
    if(!db) await initDb()
    blogRepository = new BlogRepository(db)
    postRepository = new PostRepository(db)
    userRepository = new UserRepository(db)
    commentRepository = new CommentRepository(db)
    queryRepository = new QueryRepository(db)
    userQueryRepository = new UserQueryRepository(db)
    commentQueryRepository = new CommentQueryRepository(db)
    deviceSessionRepository = new DeviceSessionRepository(db)
    clientActionRepository = new ClientActionRepository(db)
    deviceSessionQueryRepository = new DeviceSessionQueryRepository(db)
}
const initServices = async () => {
    if(!blogRepository) await initRepos()
    blogService = new BlogService(blogRepository)
    postService = new PostService(postRepository)
    deviceService = new DeviceSessionService(deviceSessionRepository)
    userService = new UserService(userRepository)
    commentService = new CommentService(commentRepository)
    authService = new AuthService(userService,deviceService,clientActionRepository,fakeConfirmEmailSender)
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
}

const initApp = async () => {
    if(!authRouter) await initRouters()
    app = new BloggersApp({
        db,
        blogRouter,
        postRouter,
        userRouter,
        authRouter,
        commentRouter,
        securityRouter
    })
}
const stopDb = async () => {
    await db.close()
}
const stopApp = async () => {
    await app.stop()
    await mongoServ.stop()
}

export {
    login,
    password,
    db,
    app,

    userService,
    initServices,
    initApp,
    stopDb,
    stopApp
}


