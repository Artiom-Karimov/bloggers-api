import { Router, Request, Response } from 'express'
import { Blogs } from '../../data/blogs'

const blogs = new Blogs()

export const blogsRouter = Router()

export const clearBlogsData = (): void => {
    blogs.deleteAll()
}

blogsRouter.get('/', (req:Request, res:Response) => {
    res.status(200).send(blogs.getAll())
})

blogsRouter.post('/', (req:Request, res:Response) => {
    
})