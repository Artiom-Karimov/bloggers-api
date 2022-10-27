import PageQueryParams from "./pageQueryParams"

export default class GetPostsQueryParams extends PageQueryParams {
    protected override sortByValues = [ 'createdAt', 'title', 'shortDescription', 'content', 'blogName' ]
    public userId:string
    constructor(query:any, userId:string|undefined) {
        super(query)
        this.userId = userId ?? ''
        if(!query) return
        this.assignSortBy(query.sortBy)
    }    
}