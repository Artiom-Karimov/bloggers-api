import * as config from './config/config'
//import BloggersMongoDb from "./mongoDataLayer/bloggersMongoDb"
import BlogRepository from './mongooseDataLayer/repositories/blogRepository'
import CommentQueryRepository from './mongooseDataLayer/repositories/commentQueryRepository'
import CommentRepository from './mongooseDataLayer/repositories/commentRepository'
import DeviceSessionQueryRepository from './mongooseDataLayer/repositories/deviceSessionQueryRepository'
import DeviceSessionRepository from './mongooseDataLayer/repositories/deviceSessionRepository'
import PostRepository from './mongooseDataLayer/repositories/postRepository'
import BlogPostQueryRepository from './mongooseDataLayer/repositories/blogPostQueryRepository'
import UserQueryRepository from './mongooseDataLayer/repositories/userQueryRepository'
import UserRepository from './mongooseDataLayer/repositories/userRepository'
import TestingRepository from './mongooseDataLayer/repositories/testingRepository'

import ClientActionCollection from './logic/utils/clientActionCollection'
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
import ClientActionService from './logic/services/clientActionService'
import TestingRouter from './presentation/routers/testingRouter'
import TestingService from './logic/services/testingService'
import mongoose from 'mongoose'
import ErrorHandler from './errorHandler'
import PasswordRecoveryService from './logic/services/passwordRecoveryService'
import PasswordRecoveryRepository from './mongooseDataLayer/repositories/passwordRecoveryRepository'
import RecoveryEmailSender from './email/recoveryEmailSender'


export default class CompositionRoot {
    //private readonly db = new BloggersMongoDb(config.mongoUri)
    private readonly confirmationSender = new ConfirmationEmailSender()
    private readonly recoverySender = new RecoveryEmailSender()

    private readonly blogRepository: BlogRepository
    private readonly postRepository: PostRepository
    private readonly userRepository: UserRepository
    private readonly commentRepository: CommentRepository
    private readonly deviceSessionRepository: DeviceSessionRepository
    private readonly clientActionRepository: ClientActionCollection
    private readonly testingRepository: TestingRepository
    private readonly recoveryRepository: PasswordRecoveryRepository

    private readonly queryRepository: BlogPostQueryRepository
    private readonly userQueryRepository: UserQueryRepository
    private readonly commentQueryRepository: CommentQueryRepository
    private readonly deviceSessionQueryRepository: DeviceSessionQueryRepository

    private readonly blogService: BlogService
    private readonly postService: PostService
    private readonly deviceSessionService: DeviceSessionService
    private readonly userService: UserService
    private readonly commentService: CommentService
    private readonly clientActionService: ClientActionService
    private readonly authService: AuthService
    private readonly recoveryService: PasswordRecoveryService
    private readonly testingService: TestingService

    private readonly authProvider: AuthMiddlewareProvider

    private readonly blogRouter: BlogRouter
    private readonly postRouter: PostRouter
    private readonly commentRouter: CommentRouter
    private readonly userRouter: UserRouter
    private readonly securityRouter: SecurityRouter   
    private readonly authRouter: AuthRouter
    private readonly testingRouter: TestingRouter

    private app: BloggersApp|undefined

    private readonly errorHandler: ErrorHandler
    
    constructor() {
        this.errorHandler = new ErrorHandler()

        this.blogRepository = new BlogRepository()
        this.postRepository = new PostRepository()
        this.userRepository = new UserRepository()
        this.commentRepository = new CommentRepository()
        this.deviceSessionRepository = new DeviceSessionRepository()
        this.clientActionRepository = new ClientActionCollection()
        this.testingRepository = new TestingRepository()
        this.recoveryRepository = new PasswordRecoveryRepository()

        this.queryRepository = new BlogPostQueryRepository()
        this.userQueryRepository = new UserQueryRepository()
        this.commentQueryRepository = new CommentQueryRepository()
        this.deviceSessionQueryRepository = new DeviceSessionQueryRepository()

        this.blogService = new BlogService(this.blogRepository) 
        this.postService = new PostService(this.postRepository) 
        this.deviceSessionService = new DeviceSessionService(this.deviceSessionRepository) 
        this.userService = new UserService(this.userRepository) 
        this.commentService = new CommentService(this.commentRepository)
        this.clientActionService = new ClientActionService(this.clientActionRepository)
        this.authService = new AuthService(this.userService,this.deviceSessionService,this.clientActionService,this.confirmationSender)
        this.testingService = new TestingService(this.testingRepository)
        this.recoveryService = new PasswordRecoveryService(this.recoveryRepository,this.clientActionService,this.userService,this.recoverySender)
        
        this.authProvider = new AuthMiddlewareProvider(this.userService)

        this.blogRouter = new BlogRouter(this.blogService,this.postService,this.queryRepository,this.authProvider)
        this.postRouter = new PostRouter(this.postService,this.blogService,this.commentService,this.queryRepository,this.commentQueryRepository,this.authProvider)
        this.commentRouter = new CommentRouter(this.commentService,this.commentQueryRepository,this.authProvider)
        this.userRouter = new UserRouter(this.userService,this.userQueryRepository,this.authProvider)
        this.securityRouter = new SecurityRouter(this.deviceSessionService,this.deviceSessionQueryRepository,this.authProvider)
        this.authRouter = new AuthRouter(this.authService,this.recoveryService,this.userQueryRepository,this.authProvider)
        this.testingRouter = new TestingRouter(this.testingService)
    }

    public async start() {
        this.app = new BloggersApp({
            authRouter:this.authRouter,
            blogRouter:this.blogRouter,
            commentRouter:this.commentRouter,
            postRouter:this.postRouter,
            userRouter:this.userRouter,
            securityRouter:this.securityRouter,
            testingRouter:this.testingRouter
        })
        await mongoose.connect(config.mongoUri + '/bloggers')
        await this.app.start()
    }
    public async stop() {
        await this.app?.stop()
        await mongoose.disconnect()
    }
}
