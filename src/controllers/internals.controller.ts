import InternalDetailsModel from "../models/internalDetails.model";
import { Request, Response } from 'express';

export const getInternalDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { usn, semester } = req.body;
        console.log(typeof usn, typeof semester)
        // Group the documents by usn and semester, sort them by createdAt in descending order, and take the first item
        const latestResult = await InternalDetailsModel.aggregate([
            { $match: { usn: usn, "internalDetails.semester": semester } },
            { $unwind: "$internalDetails" },
            { $match: { "internalDetails.semester": semester } },
            { $sort: { "internalDetails.createdAt": -1 } },
            { $limit: 1 },
            { $project: { _id: 0, "internalDetails._id": 0 } }
        ]);

        // If there is no result, send a 404 response
        if (latestResult.length === 0) {
            res.status(404).json({ message: "No internal details found for the given usn and semester" });
            return;
        }

        // Send the latest result as the response
        res.json({ internalDetails: latestResult[0].internalDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getPreviousResults = async (req: Request, res: Response): Promise<void> => {
    const { usn, semester, subject } = req.body;

    try {
        const previousResults = await InternalDetailsModel.aggregate([
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
            const filteredSubjects = result.internals[0].subjects.filter((sub: any) => sub.name === subject);
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
