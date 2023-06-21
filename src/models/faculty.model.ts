import mongoose from "mongoose";

export interface IFaculty extends mongoose.Document {
    email: string;
    tokenType: String;
    token: string;
    valid: boolean;
    expiration: Date;
    createdAt: Date;
    updatedAt: Date;

}

const facultySchema = new mongoose.Schema({
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

const FacultyModel = mongoose.model<IFaculty>('Faculty', facultySchema);

export default FacultyModel;