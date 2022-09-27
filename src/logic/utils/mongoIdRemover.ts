export const removeMongoId = (data: any): any => {
    if(data._id)
        delete data._id
    return data
}