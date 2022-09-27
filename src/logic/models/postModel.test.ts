import { expect } from '@jest/globals';
import DateGenerator from '../utils/dateGenerator';
import PostModel, { PostInputModel } from './postModel'

const exampleData = {
    id: '',
    title: '',
    shortDescription: '',
    content: '',
    blogId: '',
    blogName: ''
}
let exampleInput:PostInputModel
let updateModel:PostInputModel

describe('postModel operatons test', () => {
    beforeEach(() => {
        exampleData.id = "idid"
        exampleData.title = "privet"
        exampleData.shortDescription = "why so serious?"
        exampleData.content = 'none'
        exampleData.blogId = 'pfoof'
        exampleData.blogName = 'just kidding'
        exampleInput = {
            title: exampleData.title,
            shortDescription: exampleData.shortDescription,
            content: exampleData.content,
            blogId: exampleData.blogId,
            blogName: exampleData.blogName
        }
        updateModel = {
            title: 'noonafig',
            shortDescription: 'tuda zhe',
            content: 'nichego horoshego',
            blogId: 'kto',
            blogName: 'ya'
        }
    })
    
    it('Constructor should set the right fields', () => {
        const model = new PostModel(exampleData.id, exampleInput, DateGenerator.generate())
        expect(exampleData.id).toBe(model.id)
        expect(exampleData.title).toBe(model.title)
        expect(exampleData.shortDescription).toBe(model.shortDescription)
        expect(exampleData.content).toBe(model.content)
        expect(exampleData.blogId).toBe(model.blogId)
        expect(exampleData.blogName).toBe(model.blogName)
        expect(DateGenerator.validate(model.createdAt)).toBe(true)
    })
    
    it('Clone should return same values, but not the same object', () => {
        const model = new PostModel(exampleData.id, exampleInput, DateGenerator.generate())
        const clone = model.clone()
        expect(clone.id).toBe(model.id)
        expect(clone.title).toBe(model.title)
        expect(clone.shortDescription).toBe(model.shortDescription)
        expect(clone.content).toBe(model.content)
        expect(clone.blogId).toBe(model.blogId)
        expect(clone.blogName).toBe(model.blogName)
        expect(clone.createdAt).toBe(model.createdAt)
        
        expect(clone.equals(model)).toBeTruthy()
        expect(model.equals(clone)).toBeTruthy()
    
        expect(model).not.toBe(clone)
    })
    
    it('Update should return new values and the same object', () => {
        const model = new PostModel(exampleData.id, exampleInput, DateGenerator.generate())
        const id = model.id
    
        const newModel = model.update(updateModel)
        
        expect(newModel.id).toBe(id)
        expect(newModel.title).toBe(updateModel.title)
        expect(newModel.shortDescription).toBe(updateModel.shortDescription)
        expect(newModel.content).toBe(updateModel.content)
        expect(newModel.blogId).toBe(updateModel.blogId)
        expect(newModel.blogName).toBe(updateModel.blogName)
    
        expect(newModel).toBe(model)
    })
})

