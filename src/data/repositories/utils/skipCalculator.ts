export const calculateSkip = (pageSize:number,page:number): number => {
    return (page - 1) * pageSize
}