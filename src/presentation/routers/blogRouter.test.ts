import request from 'supertest'
import BlogPageViewModel from '../../data/models/pageViewModels/blogPageViewModel'
import BlogViewModel from '../../data/models/viewModels/blogViewModel'
import PostPageViewModel from '../../data/models/pageViewModels/postPageViewModel'
import PostViewModel from '../../data/models/viewModels/postViewModel'
import BlogModel, { BlogInputModel } from '../../logic/models/blogModel'
import { PostInputModel } from '../../logic/models/postModel'
import TestApp from '../testAppSetup'

const base = '/blogs'

let sampleBlogInputs: Array<BlogInputModel>
let samplePostInputs: Array<PostInputModel>

const fillSampleData = () => {
    sampleBlogInputs = []
    for(let i = 0; i < 32; i++) {
        sampleBlogInputs.push({
            name: `blog ${i + 1}`,
            youtubeUrl: `https://youtu.be/blog${i + 1}`
        })
    }
    samplePostInputs = []
    for(let i = 0; i < 27; i++) {
        samplePostInputs.push({
            title: `post ${i+1}`,
            shortDescription: `This is a sample post #${i+1} from tests.`,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ',
            blogId: '',
            blogName: ''
        })
    }
}
const sendBlogSamples = async () => {
    const blogs = sampleBlogInputs.map((data) => {
        return request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(blogs)
}
const sendPostSamples = async (blogId:string, blogName: string) => {
    const posts = samplePostInputs.map((data) => {
        data.blogId = blogId
        data.blogName = blogName
        return request(TestApp.server).post(`${base}/${blogId}/posts`).auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(posts)
}

describe('blogsRouter crud tests', () => {

    beforeAll(async () => {
        await TestApp.start()
        await request(TestApp.server)
            .delete('/testing/all-data')    
        fillSampleData()
    })

    // GetAll (empty)
    it('getAll should return empty array', async () => {
        const response = await request(TestApp.server).get(base)
        expect(response.statusCode).toEqual(200)
        const defaultResult = new BlogPageViewModel(1,10,0)
        expect(response.body).toEqual(defaultResult)
    })

    // Post
    it('post without auth should fail', async () => {
        const response = await request(TestApp.server).post(base).send(sampleBlogInputs[1])
        expect(response.statusCode).toBe(401)
    })
    it('post/put/delete with wrong credentials should fail', async () => {
        const responses = [
            request(TestApp.server).post(base).auth('hello','world').send(sampleBlogInputs[1]),
            request(TestApp.server).put(`${base}/1`).auth('hello','world').send(sampleBlogInputs[1]),
            request(TestApp.server).delete(`${base}/1`).auth('hello','world')
        ]
        const received = await Promise.all(responses)
        received.forEach((res) => {
            expect(res.statusCode).toBe(401)
        })       
    })

    // Post, GetAll
    it('post should create valid models', async () => {
        await sendBlogSamples()
        const response = await request(TestApp.server).get(base)
        const body = response.body as BlogPageViewModel
        expect(body).not.toBeUndefined()
        expect(body.totalCount).toBe(sampleBlogInputs.length)
        expect(body.pagesCount).toBe(4)

        const allHaveIds = body.items.every((blog) => {
            return typeof blog.id === 'string' && blog.id.length > 0
        })
        expect(allHaveIds).toBe(true)

        body.items.forEach((data) => {
            const blog = sampleBlogInputs.find((b) => b.name === data.name && b.youtubeUrl === data.youtubeUrl)
            expect(blog).not.toBeUndefined()
        })
    })

    // Post, Post(posts)  get posts by blogId
    it('get /blogs/blogId/posts should return posts', async () => {
        const blogs = (await request(TestApp.server).get(base)).body.items
        const blog1: BlogViewModel = blogs[0]
        const blog2: BlogViewModel = blogs[1]

        await sendPostSamples(blog1.id,blog1.name)
        await sendPostSamples(blog2.id,blog2.name)

        const blog1Posts = (await request(TestApp.server).get(`${base}/${blog1.id}/posts`)).body as PostPageViewModel
        const blog2Posts = (await request(TestApp.server).get(`${base}/${blog2.id}/posts`)).body as PostPageViewModel

        expect(blog1Posts.totalCount).toBe(samplePostInputs.length)
        expect(blog2Posts.totalCount).toBe(samplePostInputs.length)

        blog2Posts.items.forEach((p) => {
            expect(p.blogId).toBe(blog2.id)
            expect(p.blogName).toBe(blog2.name)
        })
    })

    // Post, get by id
    it('post should return actual id, then get by id should return model', async () => {
        const sample = sampleBlogInputs[0]
        const created = await request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(sample)
        expect(created.statusCode).toBe(201)
        const id = created.body.id
        
        const retrieved = await request(TestApp.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expect(retrieved.body.name).toBe(sample.name)
        expect(retrieved.body.youtubeUrl).toBe(sample.youtubeUrl)
    })

    // Post, put, get by id
    it('put should replace existing entity', async () => {
        const sample = sampleBlogInputs[2]
        const created = await request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(sample)
        const id = created.body.id

        const updateSample = sampleBlogInputs[3]
        const updated = await request(TestApp.server).put(`${base}/${id}`).auth(TestApp.userName, TestApp.password).send(updateSample)
        expect(updated.statusCode).toBe(204)

        const retrieved = await request(TestApp.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expect(retrieved.body.name).toBe(updateSample.name)
        expect(retrieved.body.youtubeUrl).toBe(updateSample.youtubeUrl)
    })

    // Post, delete, get by id
    it('delete should delete existing entity', async () => {
        const sample = sampleBlogInputs[2]
        const created = await request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(sample)
        const id = created.body.id

        const deleted = await request(TestApp.server).delete(`${base}/${id}`).auth(TestApp.userName, TestApp.password)
        expect(deleted.statusCode).toBe(204)

        const retrieved = await request(TestApp.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(404)
    })

    afterAll(() => {
        TestApp.stop()
    })
})