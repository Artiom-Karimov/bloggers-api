import { PostModel, PostInputModel } from "./postModel";

export class Posts {
    private posts: Array<PostModel> = []

    public getAll(): Array<PostModel> {
        return this.posts.map((post) => post.clone())
    }
    public getById(id: string): PostModel | undefined {
        return this.posts.find((post) => post.id === id)?.clone()
    }
    public add(post: PostModel): PostModel {
        this.posts.push(post)
        return post.clone()
    }
    public create(data: PostInputModel): PostModel {
        const newPost = new PostModel(this.generateId(), data)
        return this.add(newPost)
    }
    public update(id: string, data: PostInputModel): boolean {
        const existingPost = this.posts.find((b) => b.id === id)
        if(existingPost) {
            existingPost.update(data)
            return true
        }
        else return false
    }
    public delete(id: string): boolean {
        this.posts.forEach((post, index) => {
            if(post.id === id) {
                this.posts.splice(index, 1)
                return true
            }
        })
        return false
    }
    public deleteAll() {
        this.posts = []
    }
    private generateId():string {
        let result = Number(new Date())
        result -= Math.floor(Math.random()*1024)
        return result.toString()
    }
}