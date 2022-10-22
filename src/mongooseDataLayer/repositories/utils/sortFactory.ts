export default class SortFactory {
    public static get(sortBy:string,sortDirection:string): any {
        const order = sortDirection === 'asc' ? 1 : -1 
        const sortObj: {[key:string]:number} = {}
        sortObj[sortBy] = order
        return sortObj
    }
}