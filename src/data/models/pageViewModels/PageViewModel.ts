export default abstract class PageViewModel<TdbModel,TviewModel> {
    public pagesCount: number
    public page: number
    public pageSize: number
    public totalCount: number
    public items: Array<TviewModel> = []

    constructor(
        page:number,
        pageSize:number,
        totalCount:number
    ) {        
        this.page = page
        this.pageSize = pageSize
        this.totalCount = totalCount
        this.pagesCount = this.calcPagesCount()
    }
    public abstract add(...mongoModels:TdbModel[]): PageViewModel<TdbModel,TviewModel> 
    private calcPagesCount(): number {
        return Math.ceil(this.totalCount / this.pageSize)
    }
}