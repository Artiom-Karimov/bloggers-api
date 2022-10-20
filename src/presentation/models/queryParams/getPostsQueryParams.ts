import PageQueryParams from "./pageQueryParams"

export default class GetPostsQueryParams extends PageQueryParams {
    protected override sortByValues = [ 'createdAt', 'title', 'shortDescription', 'content', 'blogName' ]

    constructor(query:any) {
        super(query)
        if(!query) return
        this.assignSortBy(query.sortBy)
    }    
}