import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    email: string;
    tokenType: string;
    token: string;
    valid: boolean;
    expiration: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    tokenType: {
        type: String,
    },
    token: { type: String },
    valid: { type: Boolean },
    expiration: { type: Date },

}, {
    timestamps: true
})

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;