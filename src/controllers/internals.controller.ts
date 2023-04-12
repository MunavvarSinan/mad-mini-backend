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
    const { usn, semester } = req.body;

    try {
        const previousResults = await InternalDetailsModel.aggregate([
            { $match: { usn: usn } },
            { $unwind: '$internalDetails' },
            { $match: { 'internalDetails.semester': semester } },
            { $sort: { 'internalDetails.createdAt': 1 } },
            { $group: { _id: '$_id', internalDetails: { $push: '$internalDetails' } } }
        ]);

        if (previousResults.length === 0) {
            res.status(404).send('No internal details found for the given usn and semester');
            return;
        }

        res.status(200).json(previousResults[0].internalDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
