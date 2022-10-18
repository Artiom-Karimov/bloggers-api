import * as config from './config/config'
import BloggersMongoDb from "./data/bloggersMongoDb"
import BlogRepository from './data/repositories/blogRepository'
import CommentQueryRepository from './data/repositories/commentQueryRepository'
import CommentRepository from './data/repositories/commentRepository'
import DeviceSessionQueryRepository from './data/repositories/deviceSessionQueryRepository'
import DeviceSessionRepository from './data/repositories/deviceSessionRepository'
import ClientActionRepository from './data/repositories/clientActionRepository'
import PostRepository from './data/repositories/postRepository'
import QueryRepository from './data/repositories/queryRepository'
import UserQueryRepository from './data/repositories/userQueryRepository'
import UserRepository from './data/repositories/userRepository'
import ConfirmationEmailSender from './email/confirmationEmailSender'
import AuthService from './logic/services/authService'
import BlogService from './logic/services/blogService'
import CommentService from './logic/services/commentService'
import DeviceSessionService from './logic/services/deviceSessionService'
import PostService from './logic/services/postService'
import UserService from './logic/services/userService'
import BloggersApp from './presentation/bloggersApp'
import AuthMiddlewareProvider from './presentation/middlewares/authMiddlewareProvider'
import AuthRouter from './presentation/routers/authRouter'
import BlogRouter from './presentation/routers/blogRouter'
import CommentRouter from './presentation/routers/commentRouter'
import PostRouter from './presentation/routers/postRouter'
import SecurityRouter from './presentation/routers/securityRouter'
import UserRouter from './presentation/routers/userRouter'
import { MongoMemoryServer } from 'mongodb-memory-server'
import ClientActionMongoDb from './data/clientActionMongoDb'

export default class CompositionRoot {
    private readonly db = new BloggersMongoDb(config.mongoUri)
    private readonly confirmationEmailSender = new ConfirmationEmailSender()

    private readonly blogRepository: BlogRepository
    private readonly postRepository: PostRepository
    private readonly userRepository: UserRepository
    private readonly commentRepository: CommentRepository
    private readonly deviceSessionRepository: DeviceSessionRepository

    private readonly queryRepository: QueryRepository
    private readonly userQueryRepository: UserQueryRepository
    private readonly commentQueryRepository: CommentQueryRepository
    private readonly deviceSessionQueryRepository: DeviceSessionQueryRepository

    private readonly blogService: BlogService
    private readonly postService: PostService
    private readonly deviceSessionService: DeviceSessionService
    private readonly userService: UserService
    private readonly commentService: CommentService

    private readonly authProvider: AuthMiddlewareProvider

    private readonly blogRouter: BlogRouter
    private readonly postRouter: PostRouter
    private readonly commentRouter: CommentRouter
    private readonly userRouter: UserRouter
    private readonly securityRouter: SecurityRouter

    private actionDb: ClientActionMongoDb|undefined
    private actionRepository: ClientActionRepository|undefined
    private authService: AuthService|undefined
    private authRouter: AuthRouter|undefined

    private app: BloggersApp|undefined
    
    constructor() {
        this.blogRepository = new BlogRepository(this.db)
        this.postRepository = new PostRepository(this.db)
        this.userRepository = new UserRepository(this.db)
        this.commentRepository = new CommentRepository(this.db)
        this.deviceSessionRepository = new DeviceSessionRepository(this.db)

        this.queryRepository = new QueryRepository(this.db)
        this.userQueryRepository = new UserQueryRepository(this.db)
        this.commentQueryRepository = new CommentQueryRepository(this.db)
        this.deviceSessionQueryRepository = new DeviceSessionQueryRepository(this.db)

        this.blogService = new BlogService(this.blogRepository) 
        this.postService = new PostService(this.postRepository) 
        this.deviceSessionService = new DeviceSessionService(this.deviceSessionRepository) 
        this.userService = new UserService(this.userRepository) 
        this.commentService = new CommentService(this.commentRepository)
        
        this.authProvider = new AuthMiddlewareProvider(this.userService)

        this.blogRouter = new BlogRouter(this.blogService,this.postService,this.queryRepository,this.authProvider)
        this.postRouter = new PostRouter(this.postService,this.blogService,this.commentService,this.queryRepository,this.commentQueryRepository,this.authProvider)
        this.commentRouter = new CommentRouter(this.commentService,this.commentQueryRepository,this.authProvider)
        this.userRouter = new UserRouter(this.userService,this.userQueryRepository,this.authProvider)
        this.securityRouter = new SecurityRouter(this.deviceSessionService,this.deviceSessionQueryRepository,this.authProvider)
    }

    public async start() {
        await this.initActionDb()
        this.initAuthRouter()
        this.app = new BloggersApp({
            db:this.db,
            authRouter:this.authRouter,
            blogRouter:this.blogRouter,
            commentRouter:this.commentRouter,
            postRouter:this.postRouter,
            userRouter:this.userRouter,
            securityRouter:this.securityRouter
        })
        await this.app.start()
    }

    private async initActionDb() {
        try {
            const server = await MongoMemoryServer.create()
            this.actionDb = new ClientActionMongoDb(server.getUri())
            await this.actionDb.connect()
        } catch (err) {
            console.error(err)
        }
    }
    private initAuthRouter() {
        if(!this.actionDb) return
        this.actionRepository = new ClientActionRepository(this.actionDb)
        this.authService = new AuthService(this.userService,this.deviceSessionService,this.actionRepository,this.confirmationEmailSender)
        this.authRouter = new AuthRouter(this.authService,this.userQueryRepository,this.authProvider)
    }
}
