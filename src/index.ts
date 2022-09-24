import { BloggersApp } from "./presentation/bloggersApp"

export const defaultPort = process.env.PORT ? Number(process.env.PORT) : 3034
const app = new BloggersApp(defaultPort)
app.start()