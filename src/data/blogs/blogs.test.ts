import { expect, test} from '@jest/globals';
import { Blogs } from './blogs'
import { BlogModel } from './blogModel'

let blogs: Blogs
let exampleData: Array<{name:string,youtubeUrl:string}>

beforeEach(() => {
    blogs = new Blogs()

    exampleData = [
        {name:'odin',youtubeUrl:'dva'},
        {name:'tri',youtubeUrl:'chetyre'},
        {name:'pyat',youtubeUrl:'shest'},
        {name:'sem',youtubeUrl:'vosem'},
        {name:'devyat',youtubeUrl:'desyat'},
    ]
})

const fillData = () => {
    exampleData.forEach((obj) => {
        blogs.create(obj.name, obj.youtubeUrl)
    })
}

test('New blogs should be empty', () => {
    expect(blogs.getAll().length).toBe(0)
})

test('Create should return the right model', () => {
    const name = 'privet'
    const url = 'poka'

    const blog = blogs.create(name, url)
    expect(blog.id).toBeTruthy()
    expect(blog.name).toBe(name)
    expect(blog.youtubeUrl).toBe(url)
})

test('Create should add the right model', () => {
    const name = 'privet'
    const url = 'poka'

    const blog = blogs.create(name, url)
    const obtainedBlog = blogs.getById(blog.id)
    expect(blog.id).toBe(obtainedBlog?.id)
    expect(blog.name).toBe(obtainedBlog?.name)
    expect(blog.youtubeUrl).toBe(obtainedBlog?.youtubeUrl)
})

test('GetAll should return the right array', () => {
    fillData()
    const array = blogs.getAll()
    expect(array.length).toBe(exampleData.length)
    
    array.forEach((obj, index) => {
        expect(obj.name).toBe(exampleData[index].name)
        expect(obj.youtubeUrl).toBe(exampleData[index].youtubeUrl)
    })
})

test('Delete should delete', () => {
    fillData()
    let array = blogs.getAll()
    blogs.delete(array[array.length - 2].id)
    array = blogs.getAll()

    expect(array.length).toBe(exampleData.length - 1)
})

test('DeleteAll should delete all', () => {
    fillData()
    blogs.deleteAll()
    const array = blogs.getAll()
    expect(array.length).toBe(0)
})
