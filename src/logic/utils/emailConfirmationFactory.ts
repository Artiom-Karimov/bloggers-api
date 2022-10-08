import { EmailConfirmation } from "../models/userModel"
import ConfirmCodeGenerator from "./confirmCodeGenerator"

export default class EmailConfirmationFactory {
    public static getNew(): EmailConfirmation {
        const [code,expiration] = ConfirmCodeGenerator.generate()
        return {
            confirmed:false,
            code:code,
            codeExpiration:expiration
        }
    }
    public static getConfirmed(): EmailConfirmation {
        return {
            confirmed:true,
            code:'<none>',
            codeExpiration:0
        }
    }
}