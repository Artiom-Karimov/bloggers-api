import { forEachChild } from "typescript";
import { BlogModel } from "./blogModel";

export class Blogs {
    private blogs: Array<BlogModel> = []

    public getAll(): Array<BlogModel> {
        return this.blogs.map((blog) => blog.clone())
    }
    public getById(id: string): BlogModel | undefined {
        return this.blogs.find((blog) => blog.id === id)?.clone()
    }
    public add(blog: BlogModel): BlogModel {
        this.blogs.push(blog)
        return blog.clone()
    }
    public create(name: string, youtubeUrl: string): BlogModel {
        const newBlog = new BlogModel(Number(new Date()).toString(), name, youtubeUrl)
        return this.add(newBlog)
    }
    public update(blog: BlogModel): boolean {
        const existingBlog = this.blogs.find((b) => b.id === blog.id)
        if(existingBlog) {
            existingBlog.update(blog.name, blog.youtubeUrl)
            return true
        }
        else return false
    }
    public delete(id: string): boolean {
        this.blogs.forEach((blog, index) => {
            if(blog.id === id) {
                this.blogs.splice(index, 1)
                return true
            }
        })
        return false
    }
    public deleteAll() {
        this.blogs = []
    }
}