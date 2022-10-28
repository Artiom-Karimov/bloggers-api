export default class LikesInfoViewModel {
    constructor(
        public likesCount:number,
        public dislikesCount:number,
        public myStatus:string
    ) {}
    public static createEmpty(): LikesInfoViewModel {
        return new LikesInfoViewModel(0,0,'None')
    }
}