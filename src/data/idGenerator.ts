export class IdGenerator {
    public static generate():string {
        let result = Number(new Date())
        result -= Math.floor(Math.random()*1024)
        return result.toString()
    }
}