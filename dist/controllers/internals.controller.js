"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreviousResults = exports.getInternalDetails = void 0;
const internalDetails_model_1 = __importDefault(require("../models/internalDetails.model"));
const getInternalDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usn, semester } = req.body;
    try {
        const userDetails = yield internalDetails_model_1.default.findOne({ usn }).sort({ 'internalDetails.semester': -1 });
        if (!userDetails) {
            res.status(404).json({ message: "No internal details found for the given USN" });
            return;
        }
        const highestSemester = userDetails.internalDetails[0].semester;
        const highestSemesterResult = userDetails.internalDetails.find(detail => detail.semester === highestSemester);
        if (!highestSemesterResult) {
            res.status(404).json({ message: "No internal details found for the highest semester" });
            return;
        }
        res.json({ internalDetails: highestSemesterResult });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getInternalDetails = getInternalDetails;
const getPreviousResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usn, semester, internal } = req.body;
    try {
        const previousResults = yield internalDetails_model_1.default.aggregate([
            { $match: { usn: usn } },
            { $unwind: '$internalDetails' },
            { $match: { 'internalDetails.semester': semester, 'internalDetails.internal': internal } },
            { $group: { _id: '$internalDetails.internal', internals: { $push: '$internalDetails' } } },
            { $sort: { '_id': 1 } }
        ]);
        if (previousResults.length === 0) {
            res.status(404).send(`No internal details found for the given usn, semester, and internal`);
            return;
        }
        let subjectResults = [];
        for (const result of previousResults) {
            const filteredSubjects = result.internals[0].subjects;
            if (filteredSubjects.length > 0) {
                const subjectResult = {
                    internal: result._id,
                    semester: semester,
                    subjects: filteredSubjects
                };
                subjectResults.push(subjectResult);
            }
        }
        if (subjectResults.length === 0) {
            res.status(404).send(`No internal details found for the given usn, semester, and internal`);
            return;
        }
        res.status(200).json(subjectResults);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getPreviousResults = getPreviousResults;
//# sourceMappingURL=internals.controller.js.map