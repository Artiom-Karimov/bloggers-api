import request from 'supertest'

import { BlogInputModel } from "../../../logic/models/blogModel"
import { CommentInputModel } from '../../../logic/models/commentModel'
import { PostInputModel } from "../../../logic/models/postModel"
import { UserInputModel } from '../../../logic/models/userModel'
import TestApp from '../../testAppSetup'

export let sampleBlogInputs: Array<BlogInputModel> = []
export let samplePostInputs: Array<PostInputModel> = []
export let sampleUserInputs: Array<UserInputModel> = []
export let sampleCommentInputs: Array<CommentInputModel> = []

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
        return request(TestApp.server).post('/blogs').auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(blogs)
}
export const createPostSamplesByBlog = async (blogId:string, blogName: string) => {
    const posts = samplePostInputs.map((data) => {
        data.blogId = blogId
        data.blogName = blogName
        return request(TestApp.server).post(`/blogs/${blogId}/posts`).auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(posts)
}
export const createPostSamples = async () => {
    const responses = samplePostInputs.map((data) => {
        return request(TestApp.server).post('/posts').auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(responses)
}
export const createUserSamples = async (): Promise<any[]> => {
    const promises = sampleUserInputs.map((u) => {
        return request(TestApp.server).post('/users').auth(TestApp.userName, TestApp.password).send(u)
    })
    const responses = await Promise.all(promises)
    return responses.map(r => r.body)
}
export const createCommentSamples = async (userToken:string): Promise<string[]> => {
    const promises = sampleCommentInputs.map(c => {
        return request(TestApp.server).post(`/posts/${c.postId}/comments`)
            .auth(userToken, {type: "bearer"}).send({ content: c.content })
    })
    const responses = await Promise.all(promises)
    return responses.map(r => r.body.id)
}



export const createBlog = async (data: BlogInputModel): Promise<string> => {
    const created = await request(TestApp.server).post('/blogs').auth(TestApp.userName, TestApp.password).send(data)
    return created.body.id
}
export const createPost = async (data: PostInputModel): Promise<string> => {
    const created = await request(TestApp.server).post('/posts').auth(TestApp.userName, TestApp.password).send(data)
    return created.body.id
}
export const createUser = async (login:string,password:string): Promise<string> => {
    const userInput: UserInputModel = {
        login:login,
        email:'whatever@mail.com',
        password:password
    } 
    const created = await request(TestApp.server)
        .post('/users').auth(TestApp.userName, TestApp.password).send(userInput)
    return created.body.id
}
export const createUserToken = async (login:string,password:string): Promise<string> => {    
    const id = await createUser(login,password)
    const authorized = await request(TestApp.server).post('/auth/login')
        .send({ login:login, password:password })
    return authorized.body.accessToken
}