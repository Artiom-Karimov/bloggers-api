import { Collection } from "mongodb";
import MongoClentActionModel from "./models/mongoModels/MongoClientActionModel";

export interface ClientActionDb {
    readonly clientActionCollection: Collection<MongoClentActionModel>
}