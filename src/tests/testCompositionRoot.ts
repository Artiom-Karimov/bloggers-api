import * as config from '../config/config'
import { MongoMemoryServer } from 'mongodb-memory-server'

import BlogRepository from '../dataLayer/repositories/blogRepository'
import PostRepository from '../dataLayer/repositories/postRepository'
import BlogPostQueryRepository from '../dataLayer/repositories/queryRepositories.ts/blogPostQueryRepository'
import CommentRepository from '../dataLayer/repositories/commentRepository'
import CommentQueryRepository from '../dataLayer/repositories/queryRepositories.ts/commentQueryRepository'
import UserRepository from '../dataLayer/repositories/userRepository'
import UserQueryRepository from '../dataLayer/repositories/queryRepositories.ts/userQueryRepository'
import DeviceSessionRepository from '../dataLayer/repositories/deviceSessionRepository'
import DeviceSessionQueryRepository from '../dataLayer/repositories/queryRepositories.ts/deviceSessionQueryRepository'
import TestingRepository from '../dataLayer/repositories/testingRepository'

import { ConfirmEmailSender } from '../email/confirmationEmailSender'
import BlogService from '../logicLayer/services/blogService'
import PostService from '../logicLayer/services/postService'
import UserService from '../logicLayer/services/userService'
import CommentService from '../logicLayer/services/commentService'
import AuthRouter from '../presentationLayer/routers/authRouter'
import BlogRouter from '../presentationLayer/routers/blogRouter'
import CommentRouter from '../presentationLayer/routers/commentRouter'
import PostRouter from '../presentationLayer/routers/postRouter'
import UserRouter from '../presentationLayer/routers/userRouter'
import BloggersApp from '../presentationLayer/bloggersApp'
import AuthMiddlewareProvider from '../presentationLayer/middlewares/authMiddlewareProvider'
import DeviceSessionService from '../logicLayer/services/deviceSessionService'
import AuthService from '../logicLayer/services/authService'
import ClientActionRepository from '../logicLayer/utils/clientActionCollection'
import SecurityRouter from '../presentationLayer/routers/securityRouter'
import ClientActionService from '../logicLayer/services/clientActionService'
import TestingRouter from '../presentationLayer/routers/testingRouter'
import TestingService from '../logicLayer/services/testingService'

import mongoose from 'mongoose'
import PasswordRecoveryRepository from '../dataLayer/repositories/passwordRecoveryRepository'
import PasswordRecoveryService from '../logicLayer/services/passwordRecoveryService'
import { RecoverEmailSender } from '../email/recoveryEmailSender'
import LikeQueryRepository from '../dataLayer/repositories/queryRepositories.ts/likeQueryRepository'
import { CommentLike, PostLike } from '../dataLayer/models/likeModel'

const login = config.userName
const password = config.password

let mongoServ: MongoMemoryServer

const blogRepository = new BlogRepository()
const postRepository = new PostRepository()
const userRepository = new UserRepository()
const commentRepository = new CommentRepository()
const postLikeRepository = new LikeQueryRepository(PostLike)
const queryRepository = new BlogPostQueryRepository(postLikeRepository)
const userQueryRepository = new UserQueryRepository()
const commentLikeRepository = new LikeQueryRepository(CommentLike)
const commentQueryRepository = new CommentQueryRepository(commentLikeRepository)
const deviceSessionRepository = new DeviceSessionRepository()
const clientActionRepository = new ClientActionRepository()
const deviceSessionQueryRepository = new DeviceSessionQueryRepository()
const recoveryRepository = new PasswordRecoveryRepository()
const testingRepository = new TestingRepository()

const fakeConfirmEmailSender: ConfirmEmailSender = {
    send(login:string,email:string,code:string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}
const fakeRecoverEmailSender: RecoverEmailSender = {
    send: function (email: string, code: string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}

const blogService = new BlogService(blogRepository)
const postService = new PostService(postRepository)
const deviceService = new DeviceSessionService(deviceSessionRepository)
const userService = new UserService(userRepository)
const commentService = new CommentService(commentRepository)
const actionService = new ClientActionService(clientActionRepository)
const authService = new AuthService(userService,deviceService,actionService,fakeConfirmEmailSender)
const recoveryService = new PasswordRecoveryService(recoveryRepository,actionService,userService,fakeRecoverEmailSender)
const testingService = new TestingService(testingRepository)

const authProvider = new AuthMiddlewareProvider(userService)
const authRouter = new AuthRouter(authService,recoveryService,userQueryRepository,authProvider)
const blogRouter = new BlogRouter(blogService,postService,queryRepository,authProvider)
const commentRouter = new CommentRouter(commentService,commentQueryRepository,authProvider)
const postRouter = new PostRouter(postService,blogService,commentService,queryRepository,commentQueryRepository,authProvider)
const userRouter = new UserRouter(userService,userQueryRepository,authProvider)
const securityRouter = new SecurityRouter(deviceService,deviceSessionQueryRepository,authProvider)
const testingRouter = new TestingRouter(testingService)

const app = new BloggersApp({
    blogRouter,
    postRouter,
    userRouter,
    authRouter,
    commentRouter,
    securityRouter,
    testingRouter
})

const initApp = async () => {
    mongoServ = await MongoMemoryServer.create()
    const uri = mongoServ.getUri()
    await mongoose.connect(uri )//+ '/bloggers')
}

// const initApp = async () => {
//     const uri = 'mongodb://0.0.0.0:27017'
//     await mongoose.connect(uri + '/bloggers')
// }
const stopApp = async () => {
    await app.stop()
    await mongoose.disconnect()
    await mongoServ.stop()
}

export {
    login,
    password,
    app,
    userService,
    recoveryService,
    recoveryRepository,
    initApp,
    stopApp
}


