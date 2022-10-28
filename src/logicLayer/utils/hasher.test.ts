import Hasher from "./hasher"

describe('Hasher functions',() => {
    it('hash should return string tuple', async () => {
        const pair = await Hasher.hash('example')
        expect(pair.hash).toBeTruthy()
        expect(pair.salt).toBeTruthy()
    })
    it('compare should return true', async () => {
        const pass = 'woooords45'
        const pair = await Hasher.hash(pass)
        const compared = await Hasher.check(pass,{hash:pair.hash,salt:pair.salt})
        expect(compared).toBe(true)
    })
    it('compare should return flse', async () => {
        const pass = 'somePass'
        const another = 'SomePass'
        const pair = await Hasher.hash(pass)
        const compared = await Hasher.check(another,{hash:pair.hash,salt:pair.salt})
        expect(compared).toBe(false)
    })
})