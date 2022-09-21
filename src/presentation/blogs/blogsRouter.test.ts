import request from 'supertest'
import { server } from '../../index'
import { BlogInputModel, BlogModel } from '../../data/blogs/blogModel'

const base = '/blogs'
const userName = 'admin'
const password = 'qwerty'

let sampleBlogInputs: Array<BlogInputModel>

const fillBlogs = async () => {
    const responses = sampleBlogInputs.map((data) => {
        return request(server).post(base).auth(userName, password).send(data)
    })
    await Promise.all(responses)
}

describe('blogsRouter crud tests', () => {

    beforeAll(async () => {        
        sampleBlogInputs = [
            {name:'odin',youtubeUrl:'https://you.tube'},
            {name:'tri',youtubeUrl:'https://youtu.be'},
            {name:'pyat',youtubeUrl:'https://yo.u.tube/123456'},
            {name:'sem',youtubeUrl:'https://youtub.e'},
            {name:'devyat',youtubeUrl:'https://y.o.u.tu/be'}
        ]
    })

    beforeEach(async () => {
        await request(server)
            .delete('/testing/all-data')
    })

    // GetAll (empty)
    it('getAll should return empty array', async () => {
        const response = await request(server).get(base)
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual([])
    })

    // Post
    it('post without auth should fail', async () => {
        const response = await request(server).post(base).send(sampleBlogInputs[1])
        expect(response.statusCode).toBe(401)
    })
    it('post/put/delete with wrong credentials should fail', async () => {
        const responses = [
            request(server).post(base).auth('hello','world').send(sampleBlogInputs[1]),
            request(server).put(`${base}/1`).auth('hello','world').send(sampleBlogInputs[1]),
            request(server).delete(`${base}/1`).auth('hello','world')
        ]
        const received = await Promise.all(responses)
        received.forEach((res) => {
            expect(res.statusCode).toBe(401)
        })       
    })

    // Post, GetAll
    it('post should create valid models', async () => {
        await fillBlogs()
        const response = await request(server).get(base)
        const body = response.body as Array<BlogModel>
        expect(body).not.toBeUndefined()
        expect(body.length).toBe(sampleBlogInputs.length)

        const allHaveIds = body.every((blog) => {
            return typeof blog.id === 'string' && blog.id.length > 0
        })
        expect(allHaveIds).toBe(true)

        sampleBlogInputs.forEach((data) => {
            const blog = body.find((b) => b.name === data.name && b.youtubeUrl === data.youtubeUrl)
            expect(blog).not.toBeUndefined()
        })
    })

    // Post, get by id
    it('post should return actual id, then get by id should return model', async () => {
        const sample = sampleBlogInputs[0]
        const created = await request(server).post(base).auth(userName, password).send(sample)
        expect(created.statusCode).toBe(201)
        const id = created.body.id
        
        const retrieved = await request(server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expect(retrieved.body.name).toBe(sample.name)
        expect(retrieved.body.youtubeUrl).toBe(sample.youtubeUrl)
    })

    // Post, put, get by id
    it('put should replace existing entity', async () => {
        const sample = sampleBlogInputs[2]
        const created = await request(server).post(base).auth(userName, password).send(sample)
        const id = created.body.id

        const updateSample = sampleBlogInputs[3]
        const updated = await request(server).put(`${base}/${id}`).auth(userName, password).send(updateSample)
        expect(updated.statusCode).toBe(204)

        const retrieved = await request(server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expect(retrieved.body.name).toBe(updateSample.name)
        expect(retrieved.body.youtubeUrl).toBe(updateSample.youtubeUrl)
    })

    // Post, delete, get by id
    it('delete should delete existing entity', async () => {
        const sample = sampleBlogInputs[2]
        const created = await request(server).post(base).auth(userName, password).send(sample)
        const id = created.body.id

        const deleted = await request(server).delete(`${base}/${id}`).auth(userName, password)
        expect(deleted.statusCode).toBe(204)

        const retrieved = await request(server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(404)
    })

    afterAll(() => {
        server.close()
    })
})