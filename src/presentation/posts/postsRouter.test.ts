import request from 'supertest'
import { BlogInputModel } from '../../data/blogs/blogModel'
import { PostModel, PostInputModel } from '../../data/posts/postModel'
import { TestApp } from '../testAppSetup'

const base = '/posts'

let samplePostInputs: Array<PostInputModel>
const sampleBlogInput = { name: 'hell-o', youtubeUrl: 'https://go.home' }

const fillPosts = async () => {
    const responses = samplePostInputs.map((data) => {
        return request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(responses)
}

const injectBlog = async (model: BlogInputModel): Promise<string> => {
    const created = await request(TestApp.server).post('/blogs').auth(TestApp.userName, TestApp.password).send(model)
    return created.body.id
}

const expectEqual = (a: PostModel, b: PostInputModel) => {
    expect(a.title).toBe(b.title)
    expect(a.shortDescription).toBe(b.shortDescription)
    expect(a.content).toBe(b.content)
    expect(a.blogId).toBe(b.blogId)
}

describe('postsRouter crud tests', () => {

    beforeAll(async () => { 
        await TestApp.start()
        await request(TestApp.server)
            .delete('/testing/all-data')
        const blog = await injectBlog(sampleBlogInput)       
        samplePostInputs = [
            {title:'lorem', shortDescription:'ipsum', content:'dolor', blogId:blog, blogName:'amet' },
            {title:'consectetur', shortDescription:'adipiscing', content:'elit,', blogId:blog, blogName:'do' },
            {title:'eiusmod', shortDescription:'tempor', content:'incididunt', blogId:blog, blogName:'labore' },
            {title:'et', shortDescription:'dolore', content:'magna', blogId:blog, blogName:'Ut' },
            {title:'enim ad', shortDescription:'minim', content:'veniam,', blogId:blog, blogName:'nostrud' } 
        ]
    })

    // GetAll (empty)
    it('getAll should return empty array', async () => {
        const response = await request(TestApp.server).get(base)
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual([])
    })

    // Post
    it('post without auth should fail', async () => {
        const response = await request(TestApp.server).post(base).send(samplePostInputs[1])
        expect(response.statusCode).toBe(401)
    })
    it('post/put/delete with wrong credentials should fail', async () => {
        const responses = [
            request(TestApp.server).post(base).auth('hello','world').send(samplePostInputs[1]),
            request(TestApp.server).put(`${base}/1`).auth('hello','world').send(samplePostInputs[1]),
            request(TestApp.server).delete(`${base}/1`).auth('hello','world')
        ]
        const received = await Promise.all(responses)
        received.forEach((res) => {
            expect(res.statusCode).toBe(401)
        })       
    })

    it('post with wrong data should fail', async () => {
        const invalidData = {
            title:'lorem', 
            shortDescription:'ipsum', 
            content:'dolor', 
            blogId:'non-existing blog', 
        }
        const created = await request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(invalidData)
        expect(created.statusCode).toBe(400)
        expect(created.body.errorsMessages[0].field).toBe('blogId')
    })

    // Post, GetAll
    it('post should create valid models', async () => {
        await fillPosts()
        const response = await request(TestApp.server).get(base)
        const body = response.body as Array<PostModel>
        expect(body).not.toBeUndefined()
        expect(body.length).toBe(samplePostInputs.length)

        const allHaveIds = body.every((post) => {
            return typeof post.id === 'string' && post.id.length > 0
        })
        expect(allHaveIds).toBe(true)

        samplePostInputs.forEach((data) => {
            const blog = body.find((b) => 
                b.title === data.title && 
                b.content === data.content && 
                b.shortDescription === data.shortDescription &&
                b.blogId === data.blogId)
            expect(blog).not.toBeUndefined()
        })
    })

    // Post, get by id
    it('post should return actual id, then get by id should return model', async () => {
        const sample = samplePostInputs[0]
        const created = await request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(sample)
        expect(created.statusCode).toBe(201)
        const id = created.body.id
        
        const retrieved = await request(TestApp.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expectEqual(retrieved.body,sample)
    })

    // Post, put, get by id
    it('put should replace existing entity', async () => {
        const sample = samplePostInputs[2]
        const created = await request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(sample)
        const id = created.body.id

        const updateSample = samplePostInputs[3]
        const updated = await request(TestApp.server).put(`${base}/${id}`).auth(TestApp.userName, TestApp.password).send(updateSample)
        expect(updated.statusCode).toBe(204)

        const retrieved = await request(TestApp.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expectEqual(retrieved.body, updateSample)
    })

    // Post, delete, get by id
    it('delete should delete existing entity', async () => {
        const sample = samplePostInputs[2]
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