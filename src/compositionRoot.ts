import 'reflect-metadata'
import { Container } from 'inversify'
import * as config from './config/config'

import { Types } from './inversifyTypes'

import { IBlogRepository } from './logicLayer/interfaces/blogRepositoty'
import { IPostRepository } from './logicLayer/interfaces/postRepository'
import { IUserRepository } from './logicLayer/interfaces/userRepository'
import { ICommentRepository } from './logicLayer/interfaces/commentRepository'
import { ISessionRepository } from './logicLayer/interfaces/sessionRepository'
import { ITestingRepository } from './logicLayer/interfaces/testingRepository'
import { IRecoveryRepository } from './logicLayer/interfaces/recoveryRepository'

import { IBlogPostQueryRepository } from './presentationLayer/interfaces/blogPostQueryRepository'
import { IUserQueryRepository } from './presentationLayer/interfaces/userQueryRepository'
import { ICommentQueryRepository } from './presentationLayer/interfaces/commentQueryRepository'
import { ISessionQueryRepository } from './presentationLayer/interfaces/sessionQueryRepository'

import BlogRepository from './dataLayer/repositories/blogRepository'
import PostRepository from './dataLayer/repositories/postRepository'
import UserRepository from './dataLayer/repositories/userRepository'
import CommentRepository from './dataLayer/repositories/commentRepository'
import SessionRepository from './dataLayer/repositories/sessionRepository'
import TestingRepository from './dataLayer/repositories/testingRepository'
import RecoveryRepository from './dataLayer/repositories/recoveryRepository'

import CommentLikeQueryRepository from './dataLayer/repositories/queryRepositories.ts/commentLikeQueryRepository'
import PostLikeQueryRepository from './dataLayer/repositories/queryRepositories.ts/postLikeQueryRepository'
import BlogPostQueryRepository from './dataLayer/repositories/queryRepositories.ts/blogPostQueryRepository'
import UserQueryRepository from './dataLayer/repositories/queryRepositories.ts/userQueryRepository'
import CommentQueryRepository from './dataLayer/repositories/queryRepositories.ts/commentQueryRepository'
import SessionQueryRepository from './dataLayer/repositories/queryRepositories.ts/sessionQueryRepository'

import ConfirmationEmailSender, { IConfirmationEmailSender } from './email/confirmationEmailSender'
import RecoveryEmailSender, { IRecoveryEmailSender } from './email/recoveryEmailSender'

import BlogService from './logicLayer/services/blogService'
import PostService from './logicLayer/services/postService'
import SessionService from './logicLayer/services/sessionService'
import UserService from './logicLayer/services/userService'
import CommentService from './logicLayer/services/commentService'
import AuthService from './logicLayer/services/authService'
import TestingService from './logicLayer/services/testingService'
import RecoveryService from './logicLayer/services/recoveryService'

import AuthMiddlewareProvider from './presentationLayer/middlewares/authMiddlewareProvider'
import BlogRouter from './presentationLayer/routers/blogRouter'
import PostRouter from './presentationLayer/routers/postRouter'
import CommentRouter from './presentationLayer/routers/commentRouter'
import UserRouter from './presentationLayer/routers/userRouter'
import SecurityRouter from './presentationLayer/routers/securityRouter'
import AuthRouter from './presentationLayer/routers/authRouter'
import TestingRouter from './presentationLayer/routers/testingRouter'
import BloggersApp from './presentationLayer/bloggersApp'
import ErrorHandler from './errorHandler'
import mongoose from 'mongoose'

export default class CompositionRoot {
    private readonly container = new Container({ defaultScope: "Singleton" })

    constructor() {
        this.container.bind<ErrorHandler>(ErrorHandler).toSelf()

        this.container.bind<IBlogRepository>(Types.BlogRepository).to(BlogRepository)
        this.container.bind<IPostRepository>(Types.PostRepository).to(PostRepository)
        this.container.bind<IUserRepository>(Types.UserRepository).to(UserRepository)
        this.container.bind<ICommentRepository>(Types.CommentRepository).to(CommentRepository)
        this.container.bind<ISessionRepository>(Types.SessionRepository).to(SessionRepository)
        this.container.bind<ITestingRepository>(Types.TestingRepository).to(TestingRepository)
        this.container.bind<IRecoveryRepository>(Types.RecoveryRepository).to(RecoveryRepository)

        this.container.bind<CommentLikeQueryRepository>(Types.CommentLikeRepository).to(CommentLikeQueryRepository)
        this.container.bind<PostLikeQueryRepository>(Types.PostLikeRepository).to(PostLikeQueryRepository)
        this.container.bind<IBlogPostQueryRepository>(Types.BlogPostQueryRepository).to(BlogPostQueryRepository)
        this.container.bind<IUserQueryRepository>(Types.UserQueryRepository).to(UserQueryRepository)
        this.container.bind<ICommentQueryRepository>(Types.CommentQueryRepository).to(CommentQueryRepository)
        this.container.bind<ISessionQueryRepository>(Types.SessionQueryRepository).to(SessionQueryRepository)

        this.container.bind<IConfirmationEmailSender>(Types.ConfirmEmailSender).to(ConfirmationEmailSender)
        this.container.bind<IRecoveryEmailSender>(Types.RecoveryEmailSender).to(RecoveryEmailSender)

        this.container.bind<BlogService>(Types.BlogService).to(BlogService)
        this.container.bind<PostService>(Types.PostService).to(PostService)
        this.container.bind<SessionService>(Types.SessionService).to(SessionService)
        this.container.bind<UserService>(Types.UserService).to(UserService)
        this.container.bind<CommentService>(Types.CommentService).to(CommentService)
        this.container.bind<AuthService>(Types.AuthService).to(AuthService)
        this.container.bind<TestingService>(Types.TestingService).to(TestingService)
        this.container.bind<RecoveryService>(Types.RecoveryService).to(RecoveryService)

        this.container.bind<AuthMiddlewareProvider>(Types.AuthMiddlewareProvider).to(AuthMiddlewareProvider)

        this.container.bind<BlogRouter>(Types.BlogRouter).to(BlogRouter)
        this.container.bind<PostRouter>(Types.PostRouter).to(PostRouter)
        this.container.bind<CommentRouter>(Types.CommentRouter).to(CommentRouter)
        this.container.bind<UserRouter>(Types.UserRouter).to(UserRouter)
        this.container.bind<SecurityRouter>(Types.SecurityRouter).to(SecurityRouter)
        this.container.bind<AuthRouter>(Types.AuthRouter).to(AuthRouter)
        this.container.bind<TestingRouter>(Types.TestingRouter).to(TestingRouter)

        this.container.bind<BloggersApp>(Types.BloggersApp).to(BloggersApp)
    }

    public async start() {
        const app: BloggersApp = this.container.get(Types.BloggersApp)
        await mongoose.connect(config.mongoUri)
        await app.start()
    }
    public async stop() {
        const app: BloggersApp = this.container.get(Types.BloggersApp)
        await app?.stop()
        await mongoose.disconnect()
    }
}