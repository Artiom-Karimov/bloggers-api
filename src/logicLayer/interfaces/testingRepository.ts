export interface ITestingRepository {
    dropAllData(): Promise<void>
}