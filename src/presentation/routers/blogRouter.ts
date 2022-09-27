import { Router, Request, Response } from 'express'

import * as config from '../../config/config'
import BlogService from '../../logic/blogService'
import { blogValidation } from '../validation/validators'
import { authorizationMiddleware } from '../authorizationMiddleware'
import { validationMiddleware } from '../validation/validationMiddleware'

export default class BlogRouter {
    public readonly router: Router
    private readonly blogs: BlogService

    constructor() {
        this.router = Router()
        this.blogs = new BlogService()
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
            blogValidation,
            validationMiddleware,
        async (req:Request, res:Response) => {
            const created = await this.blogs.create({ name:req.body.name, youtubeUrl:req.body.youtubeUrl })
            if(created) res.status(201).send(created)
            else res.send(404)
        })

        this.router.put('/:id',
            authorizationMiddleware,
            blogValidation,
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