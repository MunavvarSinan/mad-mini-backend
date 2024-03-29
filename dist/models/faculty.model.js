"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const facultySchema = new mongoose_1.default.Schema({
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
});
const FacultyModel = mongoose_1.default.model('Faculty', facultySchema);
exports.default = FacultyModel;
//# sourceMappingURL=faculty.model.js.map