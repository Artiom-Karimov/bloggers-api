import request from 'supertest'
import PostPageViewModel from '../../data/models/pageViewModels/postPageViewModel'
import { BlogInputModel } from '../../logic/models/blogModel'
import PostModel, { PostInputModel } from '../../logic/models/postModel'
import { UserInputModel } from '../../logic/models/userModel'
import TestApp from '../testAppSetup'

const base = '/posts'

let samplePostInputs: Array<PostInputModel>
const sampleBlogInput = { name: 'hell-o', youtubeUrl: 'https://go.home' }

const fillSamples = (blogId:string) => {
    samplePostInputs = []
    for(let i = 1; i < 21; i++) {
        samplePostInputs.push({
            title:`post ${i}`, 
            shortDescription:`ddddescription ${i}`, 
            content:'c-c-c-c-c-c-content!', 
            blogId:blogId, 
            blogName:'not yet' 
        })
    }
}
const createPosts = async () => {
    const responses = samplePostInputs.map((data) => {
        return request(TestApp.server).post(base).auth(TestApp.userName, TestApp.password).send(data)
    })
    await Promise.all(responses)
}
const injectBlog = async (model: BlogInputModel): Promise<string> => {
    const created = await request(TestApp.server).post('/blogs').auth(TestApp.userName, TestApp.password).send(model)
    return created.body.id
}
const injectUser = async (model: UserInputModel): Promise<string> => {
    const created = await request(TestApp.server).post('/users').auth(TestApp.userName, TestApp.password).send(model)
    return created.body.id
}
const createUserToken = async (login:string,password:string): Promise<string> => {
    const userModel: UserInputModel = {
        login: login,
        email: 'postmama@moo.on',
        password: password
    }
    const id = await injectUser(userModel)
    const authorized = await request(TestApp.server).post('/auth/login')
        .send({ login:login, password:password })
    return authorized.body.accessToken
}
const expectEqual = (a: PostModel, b: PostInputModel) => {
    expect(a.title).toBe(b.title)
    expect(a.shortDescription).toBe(b.shortDescription)
    expect(a.content).toBe(b.content)
    expect(a.blogId).toBe(b.blogId)
}
const prepare = async () => {
    await TestApp.start()
    await request(TestApp.server)
        .delete('/testing/all-data')
    const blog = await injectBlog(sampleBlogInput)       
    fillSamples(blog)
}
const end = async () => {
    await request(TestApp.server)
    .delete('/testing/all-data')
    await TestApp.stop()
}

describe('postsRouter crud tests', () => {

    beforeAll(async () => { 
        await prepare()
    })

    // GetAll (empty)
    it('getAll should return empty array', async () => {
        const response = await request(TestApp.server).get(base)
        expect(response.statusCode).toEqual(200)
        const model = response.body as PostPageViewModel
        expect(model.totalCount).toBe(0)
        expect(model.items).toEqual([])
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
        await createPosts()
        const response = await request(TestApp.server).get(base)
        const body = response.body as PostPageViewModel
        expect(body).not.toBeUndefined()
        expect(body.totalCount).toBe(samplePostInputs.length)

        const allHaveIds = body.items.every((post) => {
            return typeof post.id === 'string' && post.id.length > 0
        })
        expect(allHaveIds).toBe(true)

        body.items.forEach((data) => {
            const post = samplePostInputs.find((p) => 
                p.title === data.title && 
                p.content === data.content && 
                p.shortDescription === data.shortDescription &&
                p.blogId === data.blogId)
            expect(post).not.toBeUndefined()
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

    afterAll(async () => {
        await end()
    })
})

describe('postRouter comment tests', () => {
    beforeAll(async () => {
        await prepare()
        await createPosts()
    })

    it('get should return 404', async () => {
        const result = await request(TestApp.server).get(`${base}/ololo/comments`)
        expect(result.statusCode).toBe(404)
    })

    it('get should return empty page', async () => {
        const posts = await request(TestApp.server).get(base)
        const post = posts.body.items[2]
        const result = await request(TestApp.server).get(`${base}/${post.id}/comments`)
        expect(result.statusCode).toBe(200)
        expect(result.body.totalCount).toBe(0)
    })

    it('unauthorized post should return 401', async () => {
        const posts = await request(TestApp.server).get(base)
        const post = posts.body.items[3]
        const result = await request(TestApp.server).post(`${base}/${post.id}/comments`)
            .send({content:'this should not be in database'})
        expect(result.statusCode).toBe(401)
    })

    it('actual user should be able to post', async () => {
        const token = await createUserToken('postMama','postPapa')
        
        const posts = await request(TestApp.server).get(base)
        const post = posts.body.items[3]
        
        const content = 'this should get to the database'
        const created = await request(TestApp.server).post(`${base}/${post.id}/comments`)
            .send({content:content}).set({authorization:`Bearer ${token}`})

        expect(created.statusCode).toBe(201)
        expect(created.body.id).toBeTruthy()
        expect(created.body.content).toBe(content)
    })


    afterAll(async () => {
        await end()
    })
})