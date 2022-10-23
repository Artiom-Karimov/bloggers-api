const port:number = Number(process.env.PORT!)
const baseUrl:string = process.env.baseUrl || `http://localhost:${port}`
const userName:string = process.env.USER_NAME!
const password:string = process.env.PASSWORD!
const cookieMaxAge:number = Number(process.env.cookieMaxAge) || 24 * 3600
const mongoUri:string = process.env.mongoUri || 'mongodb://0.0.0.0:27017'
const jwt = {
    secret:process.env.jwtSecret!,
    expire:process.env.jwtExpire || '10s',
    refreshExpire:process.env.jwtRefreshExpire || '20s',
    refreshExpireMillis:process.env.jwtRefreshExpireMillis? Number(process.env.jwtRefreshExpireMillis) : 20_000
}
const email = {
    user:process.env.mailUser!,
    password:process.env.mailPassword!,
    senderName:process.env.mailSenderName || 'Noreply',
    confirmExpirationMinutes: Number(process.env.mailExpireMinutes!),
    linkBase:baseUrl
}
const userAuth = {
    actionLimit:
        process.env.clientActionLimit ? Number(process.env.clientActionLimit ) : 5,
    actionLimitTime:
        process.env.clientActionLimitTime ? Number(process.env.clientActionLimitTime) : 10_000,
    recoveryExpiration:
        process.env.recoveryExpiration ? Number(process.env.recoveryExpiration) : 600_000 // 10 min
}

export {
    port,
    baseUrl,
    userName,
    password,
    mongoUri,
    jwt,
    userAuth,
    email,
    cookieMaxAge
}