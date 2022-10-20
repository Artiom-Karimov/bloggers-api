import GetBlogsQueryParams from "./getBlogsQueryParams"

const defaultParams = {
    searchNameTerm: null,
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc'
}

describe('testing query params for blogs', () => {
    beforeEach(() => {
        defaultParams.searchNameTerm = null
        defaultParams.pageNumber = 1
        defaultParams.pageSize = 10
        defaultParams.sortBy = 'createdAt'
        defaultParams.sortDirection = 'desc'
    })
    it('passed null should create default', () => {
        const newParams = new GetBlogsQueryParams(null)

        expect(newParams.searchNameTerm).toBe(defaultParams.searchNameTerm)
        expect(newParams.pageNumber).toBe(defaultParams.pageNumber)
        expect(newParams.pageSize).toBe(defaultParams.pageSize)
        expect(newParams.sortBy).toBe(defaultParams.sortBy)
        expect(newParams.sortDirection).toBe(defaultParams.sortDirection)
    })
    it('passed partial info shuld create valid params', () => {
        const newParams = new GetBlogsQueryParams({
            searchNameTerm: 'whoami',
            sortBy: 'name'
        })
        expect(newParams.searchNameTerm).toBe('whoami')
        expect(newParams.pageNumber).toBe(defaultParams.pageNumber)
        expect(newParams.pageSize).toBe(defaultParams.pageSize)
        expect(newParams.sortBy).toBe('name')
        expect(newParams.sortDirection).toBe(defaultParams.sortDirection)
    })
    it('passed wrong info shuld create valid params', () => {
        const newParams = new GetBlogsQueryParams({
            searchNameTerm: /^hello/,
            pageNumber: { id: 'whoops' },
            pageSize: [],
            sortBy: 'really',
            sortDirection: 'down'
        })
        expect(newParams.searchNameTerm).toBe(null)
        expect(newParams.pageNumber).toBe(defaultParams.pageNumber)
        expect(newParams.pageSize).toBe(defaultParams.pageSize)
        expect(newParams.sortBy).toBe(defaultParams.sortBy)
        expect(newParams.sortDirection).toBe(defaultParams.sortDirection)
    })
    it('passed valid info shuld create same params', () => {
        const newParams = new GetBlogsQueryParams({
            searchNameTerm: 'monkey',
            pageNumber: 666,
            pageSize: 43,
            sortBy: 'youtubeUrl',
            sortDirection: 'asc'
        })
        expect(newParams.searchNameTerm).toBe('monkey')
        expect(newParams.pageNumber).toBe(666)
        expect(newParams.pageSize).toBe(43)
        expect(newParams.sortBy).toBe('youtubeUrl')
        expect(newParams.sortDirection).toBe('asc')
    })
})