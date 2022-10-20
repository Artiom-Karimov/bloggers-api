import request from 'supertest'
import CommentViewModel from '../../presentation/models/commentViewModel'
import { PostInputModel } from '../../logic/models/postModel'
import * as root from '../testCompositionRoot'
import * as helpers from './routerTestHelpers'

const base = '/comments'
let postId: string
let userToken: string

const fillSamples = () => {
    helpers.clearCommentSamples()
    for(let i = 0; i < 16; i++) {
        helpers.sampleCommentInputs.push({
            postId:postId,
            userId: 'moron',
            content: `comment number ${i+1} and it is long enough`
        })
    }
}

const prepare = async () => {
    await root.initApp()
    await request(root.app.server)
        .delete('/testing/all-data')
    const blog = await helpers.createBlog({name: 'just kidding', youtubeUrl: 'https://plpl.pl/pl'})
    const postData: PostInputModel = {
        title: 'screw this',
        shortDescription: 'no way you\'re gonna leave',
        content: 'but the content is not present',
        blogId: blog,
        blogName: 'whatever' 
    }
    postId = await helpers.createPost(postData)
    userToken = await helpers.createUserToken('ignat','poop@po.op','firstAnimalName')
    fillSamples()
}

const end = async () => {
    await request(root.app.server).delete('/testing/all-data')
    await root.stopApp()
}

describe('commentRouter tests', () => {
    beforeAll(async () => {
        await prepare()
    })

    it('should get 404', async () => {
        const response = await request(root.app.server).get(`${base}/12345`)
        expect(response.statusCode).toBe(404)
    })

    it('should create actual comments', async () => {
        const created = await helpers.createCommentSamples(userToken)
        created.forEach(id => {
            expect(id).toBeTruthy()
        })
        const promises = created.map(id => {
            return request(root.app.server).get(`${base}/${id}`)
        })
        const responses = await Promise.all(promises)
        const comments = responses.map(r => r.body as CommentViewModel)
        comments.forEach(c => {
            const exists = helpers.sampleCommentInputs.some(s => {
                return s.content === c.content
            })
            expect(exists).toBe(true)
        })
    })

    it('should change existing comment', async () => {
        const comments = await request(root.app.server).get(`/posts/${postId}/comments`)
        expect(comments.statusCode).toBe(200)
        expect(comments.body.totalCount).toBeGreaterThan(0)
        const initComment = comments.body.items[0] as CommentViewModel

        const newContent = 'ah jeez, i forgot to tell something'
        const changed = await request(root.app.server).put(`${base}/${initComment.id}`)
            .auth(userToken, {type: 'bearer'}).send({content:newContent})
        expect(changed.statusCode).toBe(204)

        const newComment = await request(root.app.server).get(`${base}/${initComment.id}`)
        expect(newComment.body.content).toBe(newContent)
    })

    it('should delete existing comment', async () => {
        const comments = await request(root.app.server).get(`/posts/${postId}/comments`)
        const initComment = comments.body.items[1] as CommentViewModel

        const deleted = await request(root.app.server).delete(`${base}/${initComment.id}`)
            .auth(userToken, {type: 'bearer'})
        expect(deleted.statusCode).toBe(204)

        const noComment = await request(root.app.server).get(`${base}/${initComment.id}`)
        expect(noComment.statusCode).toBe(404)
    })

    afterAll(async () => {
        await end()
    })
})

