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
exports.uploadData = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const internalDetails_model_1 = __importDefault(require("../models/internalDetails.model"));
const uploadData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            throw new Error('No file uploaded');
        }
        const workbook = xlsx_1.default.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const ref = sheet['!ref'];
        if (!ref) {
            throw new Error('Sheet range is undefined');
        }
        const range = xlsx_1.default.utils.decode_range(ref);
        const cellAddressA3 = xlsx_1.default.utils.encode_cell({ r: 2, c: 0 });
        const cellA3 = sheet[cellAddressA3];
        const titleRegex = /(\w+) Semester (\w+) IA/;
        const titleMatches = cellA3.v.match(titleRegex);
        const semester = titleMatches[1];
        const ia = titleMatches[2];
        const subjectNames = [];
        for (let C = range.s.c + 3; C <= range.e.c; C += 3) {
            const cellAddress = xlsx_1.default.utils.encode_cell({ r: 5, c: C });
            const cell = sheet[cellAddress];
            subjectNames.push(cell ? cell.v : undefined);
        }
        const internalDetails = [];
        for (let R = 2; R <= range.e.r; R++) {
            const cellAddressName = xlsx_1.default.utils.encode_cell({ r: R, c: 2 });
            const cellName = sheet[cellAddressName];
            if (!cellName)
                continue;
            const cellAddressUsn = xlsx_1.default.utils.encode_cell({ r: R, c: 1 });
            const cellUsn = sheet[cellAddressUsn];
            if (!cellUsn)
                continue;
            const subjects = [];
            for (let C = 3; C <= range.e.c; C += 3) {
                const cellAddressMarks = xlsx_1.default.utils.encode_cell({ r: R, c: C });
                const cellMarks = sheet[cellAddressMarks];
                const cellAddressClasses = xlsx_1.default.utils.encode_cell({ r: R, c: C + 1 });
                const cellClasses = sheet[cellAddressClasses];
                const cellAddressAttendance = xlsx_1.default.utils.encode_cell({
                    r: R,
                    c: C + 2,
                });
                const cellAttendance = sheet[cellAddressAttendance];
                if (cellMarks && cellClasses && cellAttendance) {
                    subjects.push({
                        name: subjectNames[(C - 3) / 3],
                        marks: cellMarks.v,
                        classes: cellClasses.v,
                        attendance: cellAttendance.v,
                    });
                }
            }
            if (subjects.length > 0) {
                internalDetails.push({
                    name: cellName.v,
                    usn: cellUsn.v,
                    internalDetails: [
                        {
                            semester: semester,
                            internal: ia,
                            subjects: subjects,
                        },
                    ],
                });
            }
        }
        for (const internalDetail of internalDetails) {
            try {
                const existingData = yield internalDetails_model_1.default.findOne({
                    usn: internalDetail.usn,
                    'internalDetails.semester': internalDetail.internalDetails[0].semester,
                    'internalDetails.internal': internalDetail.internalDetails[0].internal,
                });
                if (existingData) {
                    const hasChanges = existingData.internalDetails[0].subjects.reduce((hasChanges, subject, index) => {
                        const newSubject = internalDetail.internalDetails[0].subjects[index];
                        return (hasChanges ||
                            subject.marks !== newSubject.marks ||
                            subject.classes !== newSubject.classes ||
                            subject.attendance !== newSubject.attendance);
                    }, false);
                    if (hasChanges) {
                        console.log(`Data for USN ${internalDetail.usn}, semester ${internalDetail.internalDetails[0].semester}, and internal ${internalDetail.internalDetails[0].internal} has changes, updating...`);
                        yield internalDetails_model_1.default.findOneAndUpdate({
                            usn: internalDetail.usn,
                            'internalDetails.semester': internalDetail.internalDetails[0].semester,
                            'internalDetails.internal': internalDetail.internalDetails[0].internal,
                        }, {
                            $pull: {
                                internalDetails: {
                                    semester: internalDetail.internalDetails[0].semester,
                                    internal: internalDetail.internalDetails[0].internal,
                                },
                            },
                        });
                        yield internalDetails_model_1.default.findOneAndUpdate({ usn: internalDetail.usn }, { $push: { internalDetails: { $each: internalDetail.internalDetails } } });
                    }
                    else {
                        console.log(`Data for USN ${internalDetail.usn}, semester ${internalDetail.internalDetails[0].semester}, and internal ${internalDetail.internalDetails[0].internal} already exists and has no changes, skipping...`);
                    }
                }
                else {
                    const foundDetails = yield internalDetails_model_1.default.findOne({
                        usn: internalDetail.usn,
                    });
                    if (foundDetails) {
                        yield internalDetails_model_1.default.findOneAndUpdate({ usn: internalDetail.usn }, { $push: { internalDetails: { $each: internalDetail.internalDetails } } });
                        console.log(`Data for USN ${internalDetail.usn} updated with new internal details`);
                    }
                    else {
                        const newInternalDetails = new internalDetails_model_1.default(internalDetail);
                        yield newInternalDetails.save();
                        console.log(`New data for USN ${internalDetail.usn} added`);
                    }
                }
            }
            catch (error) {
                console.error('An error occurred while updating the document:', error);
                return res.status(500).json({ msg: 'Error uploading file' });
            }
        }
        res.send('All files uploaded and updated successfully');
    }
    catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});
exports.uploadData = uploadData;
//# sourceMappingURL=faculty.controller.js.map