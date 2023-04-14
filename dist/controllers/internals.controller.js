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
    try {
        const { usn, semester } = req.body;
        console.log(typeof usn, typeof semester);
        const latestResult = yield internalDetails_model_1.default.aggregate([
            { $match: { usn: usn, "internalDetails.semester": semester } },
            { $unwind: "$internalDetails" },
            { $match: { "internalDetails.semester": semester } },
            { $sort: { "internalDetails.createdAt": -1 } },
            { $limit: 1 },
            { $project: { _id: 0, "internalDetails._id": 0 } }
        ]);
        if (latestResult.length === 0) {
            res.status(404).json({ message: "No internal details found for the given usn and semester" });
            return;
        }
        res.json({ internalDetails: latestResult[0].internalDetails });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getInternalDetails = getInternalDetails;
const getPreviousResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usn, semester, subject } = req.body;
    try {
        const previousResults = yield internalDetails_model_1.default.aggregate([
            { $match: { usn: usn } },
            { $unwind: '$internalDetails' },
            { $match: { 'internalDetails.semester': semester } },
            { $group: { _id: '$internalDetails.internal', internals: { $push: '$internalDetails' } } },
            { $sort: { '_id': 1 } }
        ]);
        if (previousResults.length === 0) {
            res.status(404).send('No internal details found for the given usn and semester');
            return;
        }
        let subjectResults = [];
        for (const result of previousResults) {
            const filteredSubjects = result.internals[0].subjects.filter(sub => sub.name === subject);
            if (filteredSubjects.length > 0) {
                const subjectResult = {
                    internal: result._id,
                    name: filteredSubjects[0].name,
                    marks: filteredSubjects[0].marks,
                    classes: filteredSubjects[0].classes,
                    attendance: filteredSubjects[0].attendance
                };
                subjectResults.push(subjectResult);
            }
        }
        if (subjectResults.length === 0) {
            res.status(404).send(`No internal details found for the subject ${subject} in the given usn and semester`);
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