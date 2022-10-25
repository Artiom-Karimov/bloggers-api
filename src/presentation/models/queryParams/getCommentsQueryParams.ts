import PageQueryParams from "./pageQueryParams"

export default class GetCommentsQueryParams extends PageQueryParams {

    protected override sortByValues = [
         'createdAt', 
         'content', 
         'userId',
         'userLogin'
        ]

    constructor(query: any, public postId: string, public userId:string = '') {
        super(query)
        if(!query) return;
        this.assignSortBy(query.sortBy)
    }
}