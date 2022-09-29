import PageQueryParams from "./pageQueryParams"

export default class GetBlogsQueryParams extends PageQueryParams {
    public searchNameTerm: string|null = null

    protected override sortByValues = [ 'createdAt', 'name', 'youtubeUrl' ]

    constructor(query: any) {
        super(query)
        if(!query) return;
        this.assignSearchNameTerm(query.searchNameTerm)
        this.assignSortBy(query.sortBy)
    }
    private assignSearchNameTerm(value:any) {
        if(!value || typeof value !== 'string') return;
        this.searchNameTerm = value
    }
}