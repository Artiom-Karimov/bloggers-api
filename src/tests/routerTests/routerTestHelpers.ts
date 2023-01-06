import request from 'supertest'

import { BlogInputModel } from "../../logicLayer/models/blogModel"
import { CommentCreateModel } from '../../logicLayer/models/commentModel'
import { PostInputModel } from "../../logicLayer/models/postModel"
import { UserInputModel } from '../../logicLayer/models/userModel'
import * as root from '../testCompositionRoot'

export let sampleBlogInputs: Array<BlogInputModel> = []
export let samplePostInputs: Array<PostInputModel> = []
export let sampleUserInputs: Array<UserInputModel> = []
export let sampleCommentInputs: Array<CommentCreateModel> = []

export const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const clearBlogSamples = () => {
    sampleBlogInputs = []
}
export const clearPostSamples = () => {
    samplePostInputs = []
}
export const clearUserSamples = () => {
    sampleUserInputs = []
}
export const clearCommentSamples = () => {
    sampleCommentInputs = []
}

export const createBlogSamples = async () => {
    const blogs = sampleBlogInputs.map((data) => {
        return request(root.app.server).post('/blogs').auth(root.login, root.password).send(data)
    })
    await Promise.all(blogs)
}
export const createPostSamplesByBlog = async (blogId: string, blogName: string) => {
    const posts = samplePostInputs.map((data) => {
        data.blogId = blogId
        data.blogName = blogName
        return request(root.app.server).post(`/blogs/${blogId}/posts`).auth(root.login, root.password).send(data)
    })
    await Promise.all(posts)
}
export const createPostSamples = async () => {
    const responses = samplePostInputs.map((data) => {
        return request(root.app.server).post('/posts').auth(root.login, root.password).send(data)
    })
    await Promise.all(responses)
}
export const createUserSamples = async (): Promise<any[]> => {
    const promises = sampleUserInputs.map((u) => {
        return request(root.app.server).post('/users').auth(root.login, root.password).send(u)
    })
    const responses = await Promise.all(promises)
    return responses.map(r => r.body)
}
export const createCommentSamples = async (userToken: string): Promise<string[]> => {
    const promises = sampleCommentInputs.map(c => {
        return request(root.app.server).post(`/posts/${c.postId}/comments`)
            .auth(userToken, { type: "bearer" }).send({ content: c.content })
    })
    const responses = await Promise.all(promises)
    return responses.map(r => r.body.id)
}



export const createBlog = async (data: BlogInputModel): Promise<string> => {
    const created = await request(root.app.server).post('/blogs').auth(root.login, root.password).send(data)
    return created.body.id
}
export const createPost = async (data: PostInputModel): Promise<string> => {
    const created = await request(root.app.server).post('/posts').auth(root.login, root.password).send(data)
    return created.body.id
}
export const createUser = async (login: string, email: string, password: string): Promise<string> => {
    const userInput: UserInputModel = {
        login: login,
        email: email,
        password: password
    }
    const created = await request(root.app.server)
        .post('/users').auth(root.login, root.password).send(userInput)
    return created.body.id
}
export const createUserToken = async (login: string, email: string, password: string): Promise<string> => {
    const id = await createUser(login, email, password)
    const authorized = await request(root.app.server).post('/auth/login')
        .send({ login: login, password: password })
    return authorized.body.accessToken
}

export const parseRefreshCookie = (cookies: string[]): string => {
    const cookie = cookies.find((q) => q.includes('refreshToken'))
    return cookie ? cookie : ''
}

//"refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNjY1NDkzNzkyODI4OTc1IiwiaWF0IjoxNjY1NDkzNzk0LCJleHAiOjE2NjU0OTM4MTR9.Vz1JsmEQE3KadbR-0pz4qM5btaAXra_JEY2Ktb-NPTg; Max-Age=86; Path=/; Expires=Tue, 11 Oct 2022 13:11:21 GMT; HttpOnly; Secure"