import BlogModel, { BlogInputModel } from "../models/blogModel";

export interface IBlogRepository {
    get(id:string): Promise<BlogModel|undefined> 
    create(blog:BlogModel): Promise<BlogModel|undefined>
    update(id:string,data:BlogInputModel): Promise<boolean>
    delete(id:string): Promise<boolean>
}