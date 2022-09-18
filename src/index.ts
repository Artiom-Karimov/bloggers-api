import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'

import { blogsRouter, clearBlogsData } from './presentation/blogs/blogsRouter'
import { postsRouter, clearPostsData } from './presentation/posts/postsRouter'

const port = process.env.PORT || 3034

const app = express()
app.use(bodyParser.json())

app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)

app.get('/', (req: Request, res: Response) => {
    res.send(404)
})

app.delete('/testing/all-data', (req: Request, res: Response) => {
    clearBlogsData()
    clearPostsData()
    res.send(204)
})

app.listen(port, () => {
    console.log(`Listenning on port ${port}`)
})