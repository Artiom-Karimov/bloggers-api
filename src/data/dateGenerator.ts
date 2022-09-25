export const getDate = (): string => {
    const now = new Date()
    return now.toISOString()
}

export const dateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;