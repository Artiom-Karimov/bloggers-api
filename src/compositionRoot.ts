import * as config from './config/config'
//import BloggersMongoDb from "./mongoDataLayer/bloggersMongoDb"
import BlogRepository from './dataLayer/repositories/blogRepository'
import CommentQueryRepository from './dataLayer/repositories/queryRepositories.ts/commentQueryRepository'
import CommentRepository from './dataLayer/repositories/commentRepository'
import DeviceSessionQueryRepository from './dataLayer/repositories/queryRepositories.ts/deviceSessionQueryRepository'
import DeviceSessionRepository from './dataLayer/repositories/deviceSessionRepository'
import PostRepository from './dataLayer/repositories/postRepository'
import BlogPostQueryRepository from './dataLayer/repositories/queryRepositories.ts/blogPostQueryRepository'
import UserQueryRepository from './dataLayer/repositories/queryRepositories.ts/userQueryRepository'
import UserRepository from './dataLayer/repositories/userRepository'
import TestingRepository from './dataLayer/repositories/testingRepository'

import ClientActionCollection from './logicLayer/utils/clientActionCollection'
import ConfirmationEmailSender from './email/confirmationEmailSender'
import AuthService from './logicLayer/services/authService'
import BlogService from './logicLayer/services/blogService'
import CommentService from './logicLayer/services/commentService'
import DeviceSessionService from './logicLayer/services/deviceSessionService'
import PostService from './logicLayer/services/postService'
import UserService from './logicLayer/services/userService'
import BloggersApp from './presentationLayer/bloggersApp'
import AuthMiddlewareProvider from './presentationLayer/middlewares/authMiddlewareProvider'
import AuthRouter from './presentationLayer/routers/authRouter'
import BlogRouter from './presentationLayer/routers/blogRouter'
import CommentRouter from './presentationLayer/routers/commentRouter'
import PostRouter from './presentationLayer/routers/postRouter'
import SecurityRouter from './presentationLayer/routers/securityRouter'
import UserRouter from './presentationLayer/routers/userRouter'
import ClientActionService from './logicLayer/services/clientActionService'
import TestingRouter from './presentationLayer/routers/testingRouter'
import TestingService from './logicLayer/services/testingService'
import mongoose from 'mongoose'
import ErrorHandler from './errorHandler'
import PasswordRecoveryService from './logicLayer/services/passwordRecoveryService'
import PasswordRecoveryRepository from './dataLayer/repositories/passwordRecoveryRepository'
import RecoveryEmailSender from './email/recoveryEmailSender'
import LikeQueryRepository from './dataLayer/repositories/queryRepositories.ts/likeQueryRepository'
import { CommentLike, PostLike } from './dataLayer/models/likeModel'


export default class CompositionRoot {
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

    private readonly commentLikeRepository: LikeQueryRepository
    private readonly postLikeRepository: LikeQueryRepository

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

        this.commentLikeRepository = new LikeQueryRepository(CommentLike)
        this.postLikeRepository = new LikeQueryRepository(PostLike)

        this.queryRepository = new BlogPostQueryRepository(this.postLikeRepository)
        this.userQueryRepository = new UserQueryRepository()
        this.commentQueryRepository = new CommentQueryRepository(this.commentLikeRepository)
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
        await mongoose.connect(config.mongoUri)
        await this.app.start()
    }
    public async stop() {
        await this.app?.stop()
        await mongoose.disconnect()
    }
}
