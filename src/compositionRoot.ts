import * as config from './config/config'
import BloggersMongoDb from "./mongoDataLayer/bloggersMongoDb"
import BlogRepository from './mongoDataLayer/repositories/blogRepository'
import CommentQueryRepository from './mongoDataLayer/repositories/commentQueryRepository'
import CommentRepository from './mongoDataLayer/repositories/commentRepository'
import DeviceSessionQueryRepository from './mongoDataLayer/repositories/deviceSessionQueryRepository'
import DeviceSessionRepository from './mongoDataLayer/repositories/deviceSessionRepository'
import ClientActionCollection from './logic/utils/clientActionCollection'
import PostRepository from './mongoDataLayer/repositories/postRepository'
import BlogPostQueryRepository from './mongoDataLayer/repositories/blogPostQueryRepository'
import UserQueryRepository from './mongoDataLayer/repositories/userQueryRepository'
import UserRepository from './mongoDataLayer/repositories/userRepository'
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

export default class CompositionRoot {
    private readonly db = new BloggersMongoDb(config.mongoUri)
    private readonly confirmationEmailSender = new ConfirmationEmailSender()

    private readonly blogRepository: BlogRepository
    private readonly postRepository: PostRepository
    private readonly userRepository: UserRepository
    private readonly commentRepository: CommentRepository
    private readonly deviceSessionRepository: DeviceSessionRepository
    private readonly clientActionRepository: ClientActionCollection

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

    private readonly authProvider: AuthMiddlewareProvider

    private readonly blogRouter: BlogRouter
    private readonly postRouter: PostRouter
    private readonly commentRouter: CommentRouter
    private readonly userRouter: UserRouter
    private readonly securityRouter: SecurityRouter   
    private readonly authRouter: AuthRouter

    private app: BloggersApp|undefined
    
    constructor() {
        this.blogRepository = new BlogRepository(this.db)
        this.postRepository = new PostRepository(this.db)
        this.userRepository = new UserRepository(this.db)
        this.commentRepository = new CommentRepository(this.db)
        this.deviceSessionRepository = new DeviceSessionRepository(this.db)
        this.clientActionRepository = new ClientActionCollection()

        this.queryRepository = new BlogPostQueryRepository(this.db)
        this.userQueryRepository = new UserQueryRepository(this.db)
        this.commentQueryRepository = new CommentQueryRepository(this.db)
        this.deviceSessionQueryRepository = new DeviceSessionQueryRepository(this.db)

        this.blogService = new BlogService(this.blogRepository) 
        this.postService = new PostService(this.postRepository) 
        this.deviceSessionService = new DeviceSessionService(this.deviceSessionRepository) 
        this.userService = new UserService(this.userRepository) 
        this.commentService = new CommentService(this.commentRepository)
        this.clientActionService = new ClientActionService(this.clientActionRepository)
        this.authService = new AuthService(this.userService,this.deviceSessionService,this.clientActionService,this.confirmationEmailSender)
        
        this.authProvider = new AuthMiddlewareProvider(this.userService)

        this.blogRouter = new BlogRouter(this.blogService,this.postService,this.queryRepository,this.authProvider)
        this.postRouter = new PostRouter(this.postService,this.blogService,this.commentService,this.queryRepository,this.commentQueryRepository,this.authProvider)
        this.commentRouter = new CommentRouter(this.commentService,this.commentQueryRepository,this.authProvider)
        this.userRouter = new UserRouter(this.userService,this.userQueryRepository,this.authProvider)
        this.securityRouter = new SecurityRouter(this.deviceSessionService,this.deviceSessionQueryRepository,this.authProvider)
        this.authRouter = new AuthRouter(this.authService,this.userQueryRepository,this.authProvider)
    }

    public async start() {
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
}
