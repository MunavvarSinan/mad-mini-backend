import xlsx from 'xlsx';
import { Request, Response } from 'express';
import { destroyCookie } from 'nookies';
import InternalDetailsModel, { InternalDetails, Subject } from '../models/internalDetails.model';



export const uploadData = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            throw new Error('No file uploaded');
        }

        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const ref = sheet['!ref'];
        if (!ref) {
            throw new Error('Sheet range is undefined');
        }
        const range = xlsx.utils.decode_range(ref);

        const cellAddressA3 = xlsx.utils.encode_cell({ r: 2, c: 0 }); // assuming title is in A3
        const cellA3 = sheet[cellAddressA3];
        const titleRegex = /(\w+) Semester (\w+) IA/; // regex to extract semester and IA
        const titleMatches = cellA3.v.match(titleRegex);
        const semester = titleMatches[1];
        const ia = titleMatches[2];

        const subjectNames = [];
        for (let C = range.s.c + 3; C <= range.e.c; C += 3) {
            const cellAddress = xlsx.utils.encode_cell({ r: 5, c: C });
            const cell = sheet[cellAddress];
            subjectNames.push(cell ? cell.v : undefined);
        }
        const internalDetails: InternalDetails[] = [];

        for (let R = 2; R <= range.e.r; R++) {
            const cellAddressName = xlsx.utils.encode_cell({ r: R, c: 2 });
            const cellName = sheet[cellAddressName];
            if (!cellName) continue;

            const cellAddressUsn = xlsx.utils.encode_cell({ r: R, c: 1 });
            const cellUsn = sheet[cellAddressUsn];
            if (!cellUsn) continue;

            const subjects: Subject[] = [];

            for (let C = 3; C <= range.e.c; C += 3) {
                const cellAddressMarks = xlsx.utils.encode_cell({ r: R, c: C });
                const cellMarks = sheet[cellAddressMarks];

                const cellAddressClasses = xlsx.utils.encode_cell({ r: R, c: C + 1 });
                const cellClasses = sheet[cellAddressClasses];

                const cellAddressAttendance = xlsx.utils.encode_cell({
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
        internalDetails.forEach(async (internalDetail) => {
            console.log(internalDetail.internalDetails);

            const existingData: InternalDetails | null = await InternalDetailsModel.findOne({
                usn: internalDetail.usn,
                "internalDetails.semester": internalDetail.internalDetails[0].semester,
                "internalDetails.internal": internalDetail.internalDetails[0].internal,
            });
            const foundDetails: InternalDetails | null = await InternalDetailsModel.findOne({
                usn: internalDetail.usn
            });




            if (existingData) {
                console.log(`Data for USN ${internalDetail.usn}, semester ${internalDetail.internalDetails[0].semester}, and internal ${internalDetail.internalDetails[0].internal} already exists, skipping...`);
            } else if (!existingData && foundDetails) {
                await InternalDetailsModel.findOneAndUpdate(
                    { usn: internalDetail.usn },
                    { $push: { internalDetails: { $each: internalDetail.internalDetails } } }
                );
                console.log(`Data for USN ${internalDetail.usn} updated with new internal details`);
            } else {
                const newInternalDetails = new InternalDetailsModel(internalDetail);
                await newInternalDetails.save();
                console.log(`New data for USN ${internalDetail.usn} added`);
            }
        });

        res.send('All files uploaded successfully');

    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
}


