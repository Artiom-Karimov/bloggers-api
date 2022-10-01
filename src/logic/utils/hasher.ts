import bcrypt from 'bcrypt'

export default class Hasher {
    public static async hash(password:string): Promise<[hash:string,salt:string]> {
        const salt = await bcrypt.genSalt(42)
        const hash = await bcrypt.hash(Hasher.applySalt(password,salt),42)
        return [hash,salt]
    }
    public static async check(password:string, hash:string, salt:string): Promise<boolean> {
        return await bcrypt.compare(Hasher.applySalt(password,salt),hash)
    }
    private static applySalt(password:string,salt:string): string {
        return `${password}${salt}`
    }
}