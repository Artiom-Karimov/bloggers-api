import PageQueryParams from "./pageQueryParams"

export default class GetCommentsQueryParams extends PageQueryParams {
    public postId: string = ''

    protected override sortByValues = [
         'createdAt', 
         'content', 
         'userId',
         'userLogin'
        ]

    constructor(query: any, postId: string) {
        super(query)
        if(!query) return;
        this.assignSortBy(query.sortBy)
        this.postId = postId
    }
}