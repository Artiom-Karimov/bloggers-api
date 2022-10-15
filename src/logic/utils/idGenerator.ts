export default class IdGenerator {
    public static generate():string {
        let datetime = Number(new Date())
        let randomNumber = Math.floor(Math.random()*4096)
        randomNumber ^= Math.floor(Math.random()*4096)
        let stringResult = `${datetime}${randomNumber}`    
        return stringResult
    }
}