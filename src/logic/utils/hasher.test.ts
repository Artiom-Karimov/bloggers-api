import Hasher from "./hasher"

describe('Hasher functions',() => {
    it('hash should return string tuple', async () => {
        const [ hash, salt ] = await Hasher.hash('example')
        expect(hash).toBeTruthy()
        expect(salt).toBeTruthy()
    })
    it('compare should return true', async () => {
        const pass = 'woooords45'
        const [ hash, salt ] = await Hasher.hash(pass)
        const compared = await Hasher.check(pass,hash,salt)
        expect(compared).toBe(true)
    })
    it('compare should return flse', async () => {
        const pass = 'somePass'
        const another = 'SomePass'
        const [ hash, salt ] = await Hasher.hash(pass)
        const compared = await Hasher.check(another,hash,salt)
        expect(compared).toBe(false)
    })
})