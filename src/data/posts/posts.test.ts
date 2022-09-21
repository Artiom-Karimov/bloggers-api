import { expect, test} from '@jest/globals';
import { Posts } from './posts'
import { PostInputModel } from './postModel'

let posts: Posts
let exampleData: Array<PostInputModel>

beforeEach(() => {
    posts = new Posts()

    exampleData = [
        {title:'lorem', shortDescription:'ipsum', content:'dolor', blogId:'sit', blogName:'amet' },
        {title:'consectetur', shortDescription:'adipiscing', content:'elit,', blogId:'sed', blogName:'do' },
        {title:'eiusmod', shortDescription:'tempor', content:'incididunt', blogId:'ut', blogName:'labore' },
        {title:'et', shortDescription:'dolore', content:'magna', blogId:'aliqua.', blogName:'Ut' },
        {title:'enim ad', shortDescription:'minim', content:'veniam,', blogId:'quis', blogName:'nostrud' }        
    ]
})

// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad 
// minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
// voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
// deserunt mollit anim id est laborum.

const fillData = () => {
    exampleData.forEach((obj) => {
        posts.create(obj)
    })
}

test('New Posts should be empty', () => {
    expect(posts.getAll().length).toBe(0)
})

test('Create should return the right model', () => {
    const sample = exampleData[0]

    const post = posts.create(sample)
    expect(post.id).toBeTruthy()
    expect(post.title).toBe(sample.title)
    expect(post.shortDescription).toBe(sample.shortDescription)
    expect(post.content).toBe(sample.content)
    expect(post.blogId).toBe(sample.blogId)
    expect(post.blogName).toBe(sample.blogName)
})

test('Create should add the right model', () => {
    const sample = exampleData[1]

    const post = posts.create(sample)
    const obtainedPost = posts.getById(post.id)
    if(obtainedPost === undefined)
        fail()
    else
        expect(post.equals(obtainedPost)).toBeTruthy()
})

test('GetAll should return the right array', () => {
    fillData()
    const array = posts.getAll()
    expect(array.length).toBe(exampleData.length)
    
    array.forEach((obj, index) => {
        expect(obj.title).toBe(exampleData[index].title)
        expect(obj.shortDescription).toBe(exampleData[index].shortDescription)
        expect(obj.content).toBe(exampleData[index].content)
        expect(obj.blogId).toBe(exampleData[index].blogId)
        expect(obj.blogName).toBe(exampleData[index].blogName)
    })
})

test('Delete should delete', () => {
    fillData()
    let array = posts.getAll()
    const success = posts.delete(array[array.length - 2].id)
    expect(success).toBe(true)
    array = posts.getAll()

    expect(array.length).toBe(exampleData.length - 1)
})

test('DeleteAll should delete all', () => {
    fillData()
    posts.deleteAll()
    const array = posts.getAll()
    expect(array.length).toBe(0)
})
