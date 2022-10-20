export interface TestingRepository {
    dropAllData(): Promise<void>
}