"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const subjectSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    marks: { type: Number, required: true },
    classes: { type: Number, required: true },
    attendance: { type: Number, required: true }
});
const InternalModel = new mongoose_1.default.Schema({
    semester: { type: String, required: true },
    internal: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
}, { timestamps: true });
const internalDetailsSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    usn: {
        type: String,
        required: true,
    },
    internalDetails: [InternalModel],
});
const InternalDetailsModel = mongoose_1.default.model('InternalDetails', internalDetailsSchema);
exports.default = InternalDetailsModel;
//# sourceMappingURL=internalDetails.model.js.map