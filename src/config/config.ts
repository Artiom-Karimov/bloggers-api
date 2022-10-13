const port:number = Number(process.env.PORT!)
const baseUrl:string = process.env.baseUrl || `http://localhost:${port}`
const userName:string = process.env.USER_NAME!
const password:string = process.env.PASSWORD!
const cookieMaxAge:number = Number(process.env.cookieMaxAge) || 24 * 3600
const mongoUri:string = process.env.mongoUri || 'mongodb://0.0.0.0:27017'
const jwt = {
    jwtSecret:process.env.jwtSecret!,
    jwtExpire:process.env.jwtExpire || '10s',
    jwtRefreshExpire:process.env.jwtRefreshExpire || '20s'
}
const email = {
    user:process.env.mailUser!,
    password:process.env.mailPassword!,
    senderName:process.env.mailSenderName || 'Noreply',
    confirmExpirationMinutes: Number(process.env.mailExpireMinutes!),
    linkBase:baseUrl
}

export {
    port,
    baseUrl,
    userName,
    password,
    mongoUri,
    jwt,
    email,
    cookieMaxAge
}