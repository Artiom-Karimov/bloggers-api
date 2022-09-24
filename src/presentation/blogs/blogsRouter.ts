import { Router, Request, Response } from 'express'

import { BlogRepository } from '../../data/blogs/blogRepository'
import { nameValidation, youtubeUrlValidation } from '../validation/blogValidation'
import { authorizationMiddleware } from '../authorizationMiddleware'
import { validationMiddleware } from '../validation/validationMiddleware'

export class BlogsRouter {
    public readonly router: Router
    private readonly blogs:BlogRepository

    constructor(blogs:BlogRepository) {
        this.blogs = blogs
        this.router = Router()
        this.setRoutes()
    }

    private setRoutes() {
        this.router.get('/', async (req:Request, res:Response) => {
            res.status(200).send(await this.blogs.getAll())
        })

        this.router.get('/:id', async (req:Request, res:Response) => {
            const blog = await this.blogs.get(req.params.id)
            if(blog === undefined)
                res.send(404)
            else
                res.status(200).send(blog)
        })

        this.router.post('/',
            authorizationMiddleware,
            nameValidation, youtubeUrlValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const created = await this.blogs.create({ name:req.body.name, youtubeUrl:req.body.youtubeUrl })
            if(created) res.status(201).send(created)
            else res.send(404)
        })

        this.router.put('/:id',
            authorizationMiddleware,
            nameValidation, youtubeUrlValidation,
            validationMiddleware,
        async (req:Request,res:Response) => {
            const blog = await this.blogs.get(req.params.id)
            if(blog === undefined)
                res.send(404)
            else {
                const updated = await this.blogs.update(req.params.id, { name:req.body.name, youtubeUrl:req.body.youtubeUrl })
                res.send(updated? 204 : 500)
            }
        })

        this.router.delete('/:id', 
            authorizationMiddleware,
            async (req:Request,res:Response) => {
            if(await this.blogs.delete(req.params.id))
                res.send(204)
            else
                res.send(404)
        })
    }
}