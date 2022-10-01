export default abstract class PageViewModel<TdbModel,TviewModel> {
    public pagesCount: number
    public page: number
    public pageSize: number
    public totalCount: number
    public items: Array<TviewModel> = []

    constructor(
        pagesCount:number,
        page:number,
        pageSize:number,
        totalCount:number
    ) {
        this.pagesCount = pagesCount
        this.page = page
        this.pageSize = pageSize
        this.totalCount = totalCount
    }
    public abstract add(...mongoModels:TdbModel[]): PageViewModel<TdbModel,TviewModel> 
}