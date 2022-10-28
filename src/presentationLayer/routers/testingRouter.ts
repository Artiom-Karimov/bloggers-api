import { Request, Response, Router } from "express";
import TestingService from "../../logicLayer/services/testingService";

export default class TestingRouter {
    public readonly router: Router
    
    constructor(private readonly service: TestingService) {
        this.router = Router()
        this.setRoutes()
    }
    private setRoutes = () => {
        this.router.delete('/all-data', async (req:Request,res:Response) => {
            await this.service.deleteAll()
            res.sendStatus(204)
        })
    }
}