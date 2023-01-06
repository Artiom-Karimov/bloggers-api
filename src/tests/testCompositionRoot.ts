import * as config from '../config/config'
import { MongoMemoryServer } from 'mongodb-memory-server'

import BlogRepository from '../dataLayer/repositories/blogRepository'
import PostRepository from '../dataLayer/repositories/postRepository'
import BlogPostQueryRepository from '../dataLayer/repositories/queryRepositories.ts/blogPostQueryRepository'
import CommentRepository from '../dataLayer/repositories/commentRepository'
import CommentQueryRepository from '../dataLayer/repositories/queryRepositories.ts/commentQueryRepository'
import UserRepository from '../dataLayer/repositories/userRepository'
import UserQueryRepository from '../dataLayer/repositories/queryRepositories.ts/userQueryRepository'
import SessionRepository from '../dataLayer/repositories/sessionRepository'
import SessionQueryRepository from '../dataLayer/repositories/queryRepositories.ts/sessionQueryRepository'
import TestingRepository from '../dataLayer/repositories/testingRepository'

import { IConfirmationEmailSender } from '../email/confirmationEmailSender'
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
import SessionService from '../logicLayer/services/sessionService'
import AuthService from '../logicLayer/services/authService'
import SecurityRouter from '../presentationLayer/routers/securityRouter'
import TestingRouter from '../presentationLayer/routers/testingRouter'
import TestingService from '../logicLayer/services/testingService'

import mongoose from 'mongoose'
import RecoveryRepository from '../dataLayer/repositories/recoveryRepository'
import RecoveryService from '../logicLayer/services/recoveryService'
import { IRecoveryEmailSender } from '../email/recoveryEmailSender'
import PostLikeQueryRepository from '../dataLayer/repositories/queryRepositories.ts/postLikeQueryRepository'
import CommentLikeQueryRepository from '../dataLayer/repositories/queryRepositories.ts/commentLikeQueryRepository'

const login = config.userName
const password = config.password

let mongoServ: MongoMemoryServer

const blogRepository = new BlogRepository()
const postRepository = new PostRepository()
const userRepository = new UserRepository()
const commentRepository = new CommentRepository()
const postLikeRepository = new PostLikeQueryRepository()
const queryRepository = new BlogPostQueryRepository(postLikeRepository)
const userQueryRepository = new UserQueryRepository()
const commentLikeRepository = new CommentLikeQueryRepository()
const commentQueryRepository = new CommentQueryRepository(commentLikeRepository)
const deviceSessionRepository = new SessionRepository()
const deviceSessionQueryRepository = new SessionQueryRepository()
const recoveryRepository = new RecoveryRepository()
const testingRepository = new TestingRepository()

const fakeConfirmEmailSender: IConfirmationEmailSender = {
    send(login: string, email: string, code: string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}
const fakeRecoverEmailSender: IRecoveryEmailSender = {
    send: function (email: string, code: string): Promise<boolean> {
        return new Promise((resolve, reject) => resolve(true))
    }
}

const blogService = new BlogService(blogRepository)
const postService = new PostService(postRepository)
const sessionService = new SessionService(deviceSessionRepository)
const userService = new UserService(userRepository)
const commentService = new CommentService(commentRepository)
const authService = new AuthService(userService, sessionService, fakeConfirmEmailSender)
const recoveryService = new RecoveryService(recoveryRepository, userService, fakeRecoverEmailSender)
const testingService = new TestingService(testingRepository)

const authProvider = new AuthMiddlewareProvider(userService)
const authRouter = new AuthRouter(authService, recoveryService, userQueryRepository, authProvider)
const blogRouter = new BlogRouter(blogService, postService, queryRepository, authProvider)
const commentRouter = new CommentRouter(commentService, commentQueryRepository, authProvider)
const postRouter = new PostRouter(postService, blogService, commentService, queryRepository, commentQueryRepository, authProvider)
const userRouter = new UserRouter(userService, userQueryRepository, authProvider)
const securityRouter = new SecurityRouter(sessionService, deviceSessionQueryRepository)
const testingRouter = new TestingRouter(testingService)

const app = new BloggersApp(blogRouter, postRouter, userRouter, authRouter, commentRouter, securityRouter, testingRouter)

const initApp = async () => {
    mongoServ = await MongoMemoryServer.create()
    const uri = mongoServ.getUri()
    await mongoose.connect(uri)//+ '/bloggers')
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


