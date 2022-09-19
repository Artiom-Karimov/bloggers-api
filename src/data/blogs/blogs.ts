import { BlogModel, BlogInputModel } from "./blogModel";

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
    public create(data: BlogInputModel): BlogModel {
        const newBlog = new BlogModel(this.generateId(), data)
        return this.add(newBlog)
    }
    public update(id: string, data: BlogInputModel): boolean {
        const existingBlog = this.blogs.find((b) => b.id === id)
        if(existingBlog) {
            existingBlog.update(data)
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
    private generateId():string {
        let result = Number(new Date())
        result -= Math.floor(Math.random()*1024)
        return result.toString()
    }
}