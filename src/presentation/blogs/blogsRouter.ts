import { Router, Request, Response } from 'express'

import { Blogs } from '../../data/blogs/blogs'
import { blogValidationMiddleware, nameValidation, youtubeUrlValidation } from '../validation/blogValidationMiddleware'

const blogs = new Blogs()

export const blogsRouter = Router()

export const clearBlogsData = () => {
    blogs.deleteAll()
}

blogsRouter.get('/', (req:Request, res:Response) => {
    res.status(200).send(blogs.getAll())
})

blogsRouter.get('/:id', (req:Request, res:Response) => {
    const blog = blogs.getById(req.params.id)
    if(blog === undefined)
        res.send(404)
    else
        res.status(200).send(blog)
})

blogsRouter.post('/', 
    nameValidation,
    youtubeUrlValidation,
    blogValidationMiddleware,
    (req:Request, res:Response) => {
        res.status(201).send(blogs.create({ name:req.body.name, youtubeUrl:req.body.youtubeUrl }))
})

blogsRouter.put('/:id',
    nameValidation,
    youtubeUrlValidation,
    blogValidationMiddleware,
    (req:Request,res:Response) => {
        const blog = blogs.getById(req.params.id)
        if(blog === undefined)
            res.send(404)
        else {
            blogs.update(req.params.id, { name:req.body.name, youtubeUrl:req.body.youtubeUrl })
            res.send(204)
        }
    })

blogsRouter.delete('/:id', (req:Request,res:Response) => {
    if(blogs.delete(req.params.id))
        res.send(204)
    else
        res.send(404)
})