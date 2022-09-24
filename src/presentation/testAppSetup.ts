import { BloggersApp } from './bloggersApp'

export class TestApp {
    public static readonly userName = 'admin'
    public static readonly password = 'qwerty'
    public static readonly app = new BloggersApp(3034)
    public static readonly server = this.app.server
    public static async start() { await this.app.startDbOnly() }
    public static async stop() { await this.app.stop() }
}
