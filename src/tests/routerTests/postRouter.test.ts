import request from 'supertest'
import PageViewModel from '../../presentation/models/viewModels/pageViewModel'
import PostModel, { PostInputModel } from '../../logic/models/postModel'
import * as root from '../testCompositionRoot'
import * as helpers from './routerTestHelpers'
import PostViewModel from '../../presentation/models/viewModels/postViewModel'

const base = '/posts'

const fillSamples = (blogId:string) => {
    helpers.clearPostSamples()
    for(let i = 1; i < 21; i++) {
        helpers.samplePostInputs.push({
            title:`post ${i}`, 
            shortDescription:`ddddescription ${i}`, 
            content:'c-c-c-c-c-c-content!', 
            blogId:blogId, 
            blogName:'not yet' 
        })
    }
}

const expectEqual = (a: PostModel, b: PostInputModel) => {
    expect(a.title).toBe(b.title)
    expect(a.shortDescription).toBe(b.shortDescription)
    expect(a.content).toBe(b.content)
    expect(a.blogId).toBe(b.blogId)
}
const prepare = async () => {
    await root.initApp()
    await request(root.app.server)
        .delete('/testing/all-data')
    const blog = await helpers.createBlog({name: 'nononon', youtubeUrl: 'https://sptth.aa'})       
    fillSamples(blog)
}
const end = async () => {
    await request(root.app.server)
    .delete('/testing/all-data')
    await root.stopApp()
}

describe('postsRouter crud tests', () => {

    beforeAll(async () => { 
        await prepare()
    })

    // GetAll (empty)
    it('getAll should return empty array', async () => {
        const response = await request(root.app.server).get(base)
        expect(response.statusCode).toEqual(200)
        const model = response.body as PageViewModel<PostViewModel>
        expect(model.totalCount).toBe(0)
        expect(model.items).toEqual([])
    })

    // Post
    it('post without auth should fail', async () => {
        const response = await request(root.app.server).post(base).send(helpers.samplePostInputs[1])
        expect(response.statusCode).toBe(401)
    })
    it('post/put/delete with wrong credentials should fail', async () => {
        const responses = [
            request(root.app.server).post(base).auth('hello','world').send(helpers.samplePostInputs[1]),
            request(root.app.server).put(`${base}/1`).auth('hello','world').send(helpers.samplePostInputs[1]),
            request(root.app.server).delete(`${base}/1`).auth('hello','world')
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
        const created = await request(root.app.server).post(base).auth(root.login, root.password).send(invalidData)
        expect(created.statusCode).toBe(400)
        expect(created.body.errorsMessages[0].field).toBe('blogId')
    })

    // Post, GetAll
    it('post should create valid models', async () => {
        await helpers.createPostSamples()
        const response = await request(root.app.server).get(base)
        const body = response.body as PageViewModel<PostViewModel>
        expect(body).not.toBeUndefined()
        expect(body.totalCount).toBe(helpers.samplePostInputs.length)

        const allHaveIds = body.items.every((post) => {
            return typeof post.id === 'string' && post.id.length > 0
        })
        expect(allHaveIds).toBe(true)

        body.items.forEach((data) => {
            const post = helpers.samplePostInputs.find((p) => 
                p.title === data.title && 
                p.content === data.content && 
                p.shortDescription === data.shortDescription &&
                p.blogId === data.blogId)
            expect(post).not.toBeUndefined()
        })
    })

    // Post, get by id
    it('post should return actual id, then get by id should return model', async () => {
        const sample = helpers.samplePostInputs[0]
        const created = await request(root.app.server).post(base).auth(root.login, root.password).send(sample)
        expect(created.statusCode).toBe(201)
        const id = created.body.id
        
        const retrieved = await request(root.app.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expectEqual(retrieved.body,sample)
    })

    // Post, put, get by id
    it('put should replace existing entity', async () => {
        const sample = helpers.samplePostInputs[2]
        const created = await request(root.app.server).post(base).auth(root.login, root.password).send(sample)
        const id = created.body.id

        const updateSample = helpers.samplePostInputs[3]
        const updated = await request(root.app.server).put(`${base}/${id}`).auth(root.login, root.password).send(updateSample)
        expect(updated.statusCode).toBe(204)

        const retrieved = await request(root.app.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(200)
        expectEqual(retrieved.body, updateSample)
    })

    // Post, delete, get by id
    it('delete should delete existing entity', async () => {
        const sample = helpers.samplePostInputs[2]
        const created = await request(root.app.server).post(base).auth(root.login, root.password).send(sample)
        const id = created.body.id

        const deleted = await request(root.app.server).delete(`${base}/${id}`).auth(root.login, root.password)
        expect(deleted.statusCode).toBe(204)

        const retrieved = await request(root.app.server).get(`${base}/${id}`)
        expect(retrieved.statusCode).toBe(404)
    })

    afterAll(async () => {
        await end()
    })
})

describe('postRouter comment tests', () => {
    beforeAll(async () => {
        await prepare()
        await helpers.createPostSamples()
    })

    it('get should return 404', async () => {
        const result = await request(root.app.server).get(`${base}/ololo/comments`)
        expect(result.statusCode).toBe(404)
    })

    it('get should return empty page', async () => {
        const posts = await request(root.app.server).get(base)
        const post = posts.body.items[2]
        const result = await request(root.app.server).get(`${base}/${post.id}/comments`)
        expect(result.statusCode).toBe(200)
        expect(result.body.totalCount).toBe(0)
    })

    it('unauthorized post should return 401', async () => {
        const posts = await request(root.app.server).get(base)
        const post = posts.body.items[3]
        const result = await request(root.app.server).post(`${base}/${post.id}/comments`)
            .send({content:'this should not be in database'})
        expect(result.statusCode).toBe(401)
    })

    it('actual user should be able to post', async () => {
        const token = await helpers.createUserToken('postMama','post@po.st','postPapa')
        
        const posts = await request(root.app.server).get(base)
        const post = posts.body.items[3]
        
        const content = 'this should get to the database'
        const created = await request(root.app.server).post(`${base}/${post.id}/comments`)
            .send({content:content}).set({authorization:`Bearer ${token}`})

        expect(created.statusCode).toBe(201)
        expect(created.body.id).toBeTruthy()
        expect(created.body.content).toBe(content)
    })


    afterAll(async () => {
        await end()
    })
})