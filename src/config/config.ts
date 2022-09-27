import BloggersMongoDb from "../data/bloggersMongoDb"

const port = process.env.PORT ? Number(process.env.PORT) : 3034
const userName = process.env.USER_NAME || 'admin'
const password = process.env.PASSWORD || 'qwerty'
const db = new BloggersMongoDb(process.env.mongoUri || 'mongodb://0.0.0.0:27017')

export {
    port,
    userName,
    password,
    db 
}