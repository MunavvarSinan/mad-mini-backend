import mongoose from "mongoose";

export interface IFaculty extends mongoose.Document {
    email: string;
    name: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;

}

const facultySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    avatar: { type: String },
}, {
    timestamps: true
})

const FacultyModel = mongoose.model<IFaculty>('Faculty', facultySchema);

export default FacultyModel;