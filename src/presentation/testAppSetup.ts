import * as config from '../config/config'
import BloggersApp from './bloggersApp'

export default class TestApp {
    public static readonly userName = config.userName
    public static readonly password = config.password
    public static readonly app = new BloggersApp()
    public static readonly server = this.app.server
    public static async start() { await this.app.startDbOnly() }
    public static async stop() { await this.app.stop() }
}
