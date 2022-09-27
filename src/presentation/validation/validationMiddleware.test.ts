import { expect } from '@jest/globals';
import { APIErrorResult } from './apiErrorResultFormatter';
import { removeDuplicates } from './validationMiddleware';  

describe('validation logic tests', () => {
    it('removeDuplicates should remove duplicates', () => {
        const duplicatedErrors = new APIErrorResult([
            { message:'bubble gum', field: 'gubble bum' },
            { message:'bubble gum', field: 'gubble bum' },
            { message:'bubble gum', field: 'torture' },
        ])
        const result = removeDuplicates(duplicatedErrors)
        expect(result.errorsMessages.length).toBe(2)
    })
})