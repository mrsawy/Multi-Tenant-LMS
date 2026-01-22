import { Document, Types } from "mongoose";

export const removePassword = (data: Document<Types.ObjectId>) => {
    const { password, ...dataWithoutPassword } = data.toObject();
    return dataWithoutPassword;
}
export const remove = (toBeRemovedFields: string[], data: Document<Types.ObjectId>) => {
    const dataWithoutFields = { ...data.toObject() };
    toBeRemovedFields.forEach(field => {
        if (dataWithoutFields[field]) delete dataWithoutFields[field];
    });
    return dataWithoutFields;
}