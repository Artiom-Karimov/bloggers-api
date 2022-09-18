import { expect, test} from '@jest/globals';
import { BlogModel } from './blogModel'

const exampleData = {
    id: '',
    name: '',
    youtubeUrl: ''
}

beforeEach(() => {
    exampleData.id = "idid"
    exampleData.name = "privet"
    exampleData.youtubeUrl = "https://ps.htt"
})

test('Constructor should set the right fields', () => {
    const model = new BlogModel(exampleData.id, exampleData.name, exampleData.youtubeUrl)
    expect(exampleData.id).toBe(model.id)
    expect(exampleData.name).toBe(model.name)
    expect(exampleData.youtubeUrl).toBe(model.youtubeUrl)
})

test('Clone should return same values, but not the same object', () => {
    const model = new BlogModel(exampleData.id, exampleData.name, exampleData.youtubeUrl)
    const clone = model.clone()
    expect(clone.id).toBe(model.id)
    expect(clone.name).toBe(model.name)
    expect(clone.youtubeUrl).toBe(model.youtubeUrl)
    expect(clone).not.toBe(model)
})

test('Update should return new values and the same object', () => {
    const model = new BlogModel(exampleData.id, exampleData.name, exampleData.youtubeUrl)
    const updatedModel = model.update('vasya','https://google.com')
    expect(updatedModel.id).toBe(model.id)
    expect(updatedModel.name).toBe('vasya')
    expect(updatedModel.youtubeUrl).toBe('https://google.com')
    expect(updatedModel).toBe(model)
})