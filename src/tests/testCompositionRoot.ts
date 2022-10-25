import * as config from '../config/config'
import { MongoMemoryServer } from 'mongodb-memory-server'

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
import PasswordRecoveryRepository from '../mongooseDataLayer/repositories/passwordRecoveryRepository'
import PasswordRecoveryService from '../logic/services/passwordRecoveryService'
import { RecoverEmailSender } from '../email/recoveryEmailSender'

const login = config.userName
const password = config.password

let mongoServ: MongoMemoryServer

const blogRepository = new BlogRepository()
const postRepository = new PostRepository()
const userRepository = new UserRepository()
const commentRepository = new CommentRepository()
const queryRepository = new BlogPostQueryRepository()
const userQueryRepository = new UserQueryRepository()
const commentQueryRepository = new CommentQueryRepository()
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


