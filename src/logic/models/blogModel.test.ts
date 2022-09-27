import { expect } from '@jest/globals';
import DateGenerator from '../utils/dateGenerator';
import BlogModel, { BlogInputModel } from './blogModel'

const exampleData = {
    id: '',
    name: '',
    youtubeUrl: ''
}
let exampleInput:BlogInputModel

describe('blogModel operations test', () => {
    beforeEach(() => {
        exampleData.id = "idid"
        exampleData.name = "privet"
        exampleData.youtubeUrl = "https://ps.htt"
        exampleInput = {name:exampleData.name,youtubeUrl:exampleData.youtubeUrl}
    })
   
    it('Constructor should set the right fields', () => {
        const model = new BlogModel(exampleData.id, exampleInput, DateGenerator.generate())
        expect(exampleData.id).toBe(model.id)
        expect(exampleData.name).toBe(model.name)
        expect(exampleData.youtubeUrl).toBe(model.youtubeUrl)
        expect(DateGenerator.validate(model.createdAt)).toBe(true)
    })

    it('Clone should return same values, but not the same object', () => {
        const model = new BlogModel(exampleData.id, exampleInput, DateGenerator.generate())
        const clone = model.clone()
        expect(clone.id).toBe(model.id)
        expect(clone.name).toBe(model.name)
        expect(clone.youtubeUrl).toBe(model.youtubeUrl)
        expect(clone).not.toBe(model)
        expect(clone.createdAt).toBe(model.createdAt)
    })

    it('Update should return new values and the same object', () => {
        const model = new BlogModel(exampleData.id, exampleInput, DateGenerator.generate())
        const updatedModel = model.update({name:'vasya',youtubeUrl:'https://google.com'})
        expect(updatedModel.id).toBe(model.id)
        expect(updatedModel.name).toBe('vasya')
        expect(updatedModel.youtubeUrl).toBe('https://google.com')
        expect(updatedModel).toBe(model)
    })
})


