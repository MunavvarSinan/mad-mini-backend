import mongoose from 'mongoose';

export interface Subject {
    name: string;
    marks: number;
    classes: number;
    attendance: number;
}

export interface InternalDetails {
    name: string;
    usn: string;
    internalDetails: {
        semester: string;
        internal: string;
        subjects: Subject[];
    }[];

}

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    marks: { type: Number, required: true },
    classes: { type: Number, required: true },
    attendance: { type: Number, required: true }
});

const InternalModel = new mongoose.Schema({
    semester: { type: String, required: true },
    internal: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
}, { timestamps: true });

const internalDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    usn: {
        type: String,
        required: true,
    },
    internalDetails: [InternalModel],
},
    // { timestamps: true });
)

// internalDetailsSchema.index({ usn: 1 })
const InternalDetailsModel = mongoose.model<InternalDetails & mongoose.Document>('InternalDetails', internalDetailsSchema);

export default InternalDetailsModel;
