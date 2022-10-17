import * as config from './config/config'
import BloggersMongoDb from "./data/bloggersMongoDb"
import BlogRepository from './data/repositories/blogRepository'
import CommentQueryRepository from './data/repositories/commentQueryRepository'
import CommentRepository from './data/repositories/commentRepository'
import DeviceSessionQueryRepository from './data/repositories/deviceSessionQueryRepository'
import DeviceSessionRepository from './data/repositories/deviceSessionRepository'
import LoginAttemptRepository from './data/repositories/clientActionRepository'
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

const db = new BloggersMongoDb(config.mongoUri)

const blogRepository = new BlogRepository(db)
const postRepository = new PostRepository(db)
const userRepository = new UserRepository(db)
const commentRepository = new CommentRepository(db)
const queryRepository = new QueryRepository(db)
const userQueryRepository = new UserQueryRepository(db)
const commentQueryRepository = new CommentQueryRepository(db)
const deviceSessionRepository = new DeviceSessionRepository(db)
const deviceSessionQueryRepository = new DeviceSessionQueryRepository(db)
const loginAttemptRepository = new LoginAttemptRepository(db)

const confirmationEmailSender = new ConfirmationEmailSender()

const blogService = new BlogService(blogRepository)
const postService = new PostService(postRepository)
const deviceService = new DeviceSessionService(deviceSessionRepository)
const userService = new UserService(userRepository)
const authService = new AuthService(userService,deviceService,loginAttemptRepository,confirmationEmailSender)
const commentService = new CommentService(commentRepository)

const authProvider = new AuthMiddlewareProvider(userService)

const authRouter = new AuthRouter(authService,userQueryRepository,authProvider)
const blogRouter = new BlogRouter(blogService,postService,queryRepository,authProvider)
const commentRouter = new CommentRouter(commentService,commentQueryRepository,authProvider)
const postRouter = new PostRouter(postService,blogService,commentService,queryRepository,commentQueryRepository,authProvider)
const userRouter = new UserRouter(userService,userQueryRepository,authProvider)
const securityRouter = new SecurityRouter(deviceService,deviceSessionQueryRepository,authProvider)

const app = new BloggersApp({
    db:db,
    authRouter:authRouter,
    blogRouter:blogRouter,
    commentRouter:commentRouter,
    postRouter:postRouter,
    userRouter:userRouter,
    securityRouter:securityRouter
})

export {
    blogRepository,
    postRepository,
    userRepository,
    commentRepository,
    queryRepository,
    userQueryRepository,
    commentQueryRepository,
    blogService,
    postService,
    userService,
    commentService,
    authRouter,
    blogRouter,
    commentRouter,
    postRouter,
    userRouter,
    app
}
