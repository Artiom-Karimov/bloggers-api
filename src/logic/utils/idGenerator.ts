import CryptoJS from 'crypto-js'

export const generateId = ():string => {
    let result = Number(new Date())
    result -= Math.floor(Math.random()*4096)
    result += Math.floor(Math.random()*1024)
    return CryptoJS.MD5(result.toString()).toString()
}