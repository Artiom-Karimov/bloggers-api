import express, { Request, Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'

import { setupBlogsRouter } from './presentation/blogs/blogsRouter'
import { setupPostsRouter } from './presentation/posts/postsRouter'
import { Blogs } from './data/blogs/blogs'
import { Posts } from './data/posts/posts'

const port = process.env.PORT || 3034

const blogRepository = new Blogs()
const postRepository = new Posts()

const app = express()
export const server = http.createServer(app)

app.use(bodyParser.json())

app.use('/blogs', setupBlogsRouter(blogRepository))
app.use('/posts', setupPostsRouter(postRepository, blogRepository))

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(404)
})

app.delete('/testing/all-data', (req: Request, res: Response) => {
    blogRepository.deleteAll()
    postRepository.deleteAll()
    res.sendStatus(204)
})

server.listen(port, () => {
    console.log(`Listenning on port ${port}`)
})