const Account = require('../mongo/model/Account');
const Review = require('../mongo/model/Review');
const Transaction = require('../mongo/model/Transaction');

const { doTransaction } = require('./transaction');

const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({});
        
        if(!reviews) {
            res.status(404).json({ error: 'No reviews found' });
            return;
        }

        res.status(200).json(reviews);

    } catch(err) {
        next(err);
    }
};

const getPendingAccountReviews = async (req, res, next) => {
    try {
        const pendingAccountReviews = await Review.find({ status: 'PENDING APPROVAL', type: 'ACCOUNT' });
        
        if(!pendingAccountReviews) {
            res.status(404).json({ error: 'No pending account reviews found' });
            return;
        }

        res.status(200).json(pendingAccountReviews);

    } catch(err) {
        next(err);
    }
};

const getPendingProfileReviews = async (req, res, next) => {
    try {
        const pendingProfileReviews = await Review.find({ status: 'PENDING APPROVAL', type: 'PROFILE' });
        
        if(!pendingProfileReviews) {
            res.status(404).json({ error: 'No pending profile reviews found' });
            return;
        }

        res.status(200).json(pendingProfileReviews);

    } catch(err) {
        next(err);
    }
};

const getPendingTransactionReviews = async (req, res, next) => {
    try {
        const pendingTransactionReviews = await Review.find({ status: 'PENDING APPROVAL', type: 'TRANSACTION' });
        
        if(!pendingTransactionReviews) {
            res.status(404).json({ error: 'No pending transaction reviews found' });
            return;
        }

        res.status(200).json(pendingTransactionReviews);

    } catch(err) {
        next(err);
    }
};

const getPendingHVTxnReviews = async (req, res, next) => {
    try {
        const pendingHVTxnReviews = await Review.find({ status: 'PENDING APPROVAL', type: 'HIGH VALUE TXN' });
        
        if(!pendingHVTxnReviews) {
            res.status(404).json({ error: 'No pending transaction reviews found' });
            return;
        }

        res.status(200).json(pendingHVTxnReviews);

    } catch(err) {
        next(err);
    }
};

const getApprovedAccountReviews = async (req, res, next) => {
    try {
        const approvedAccountReviews = await Review.find({ status: 'APPROVED', type: 'ACCOUNT' });
        
        if(!approvedAccountReviews) {
            res.status(404).json({ error: 'No approved account reviews found' });
            return;
        }

        res.status(200).json(approvedAccountReviews);

    } catch(err) {
        next(err);
    }
};

const getApprovedProfileReviews = async (req, res, next) => {
    try {
        const approvedProfileReviews = await Review.find({ status: 'APPROVED', type: 'PROFILE' });
        
        if(!approvedProfileReviews) {
            res.status(404).json({ error: 'No approved profile reviews found' });
            return;
        }

        res.status(200).json(approvedProfileReviews);

    } catch(err) {
        next(err);
    }
};

const getApprovedTransactionReviews = async (req, res, next) => {
    try {
        const approvedTransactionReviews = await Review.find({ status: 'APPROVED', type: 'TRANSACTION' });
        
        if(!approvedTransactionReviews) {
            res.status(404).json({ error: 'No approved transaction reviews found' });
            return;
        }

        res.status(200).json(approvedTransactionReviews);

    } catch(err) {
        next(err);
    }
};

const getApprovedHVTxnReviews = async (req, res, next) => {
    try {
        const approvedHVTxnReviews = await Review.find({ status: 'APPROVED', type: 'HIGH VALUE TXN' });
        
        if(!approvedHVTxnReviews) {
            res.status(404).json({ error: 'No approved transaction reviews found' });
            return;
        }

        res.status(200).json(approvedHVTxnReviews);

    } catch(err) {
        next(err);
    }
};

const getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if(!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }

        res.status(200).json(review);

    } catch(err) {
        next(err);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const reviewInDb = await Review.findById(req.params.id);

        if(!reviewInDb) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        if(reviewInDb.status !== 'PENDING APPROVAL') {
            res.status(403).json({ error: 'Review cannot be updated' });
            return;
        }

        delete req.body.reviewObject;
        delete req.body.type;
        delete req.body.status;

        const validatedReviewData = await Review.validate(req.body);
        
        const reviewUpdate = await Review.updateOne({ _id: req.params.id }, validatedReviewData);

        if(!reviewUpdate.acknowledged || reviewUpdate.modifiedCount !== 1) {
            res.status(500).json({ error: 'Review update failed' });
            return;
        }

        res.status(200).json({ message: 'Review updated' });

    } catch(err) {
        next(err);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        await Review.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Review deleted' });
    } catch(err) {
        next(err);
    }
};

const requestReview = async (req, res, next) => {
    try {
        const validatedReviewData = await Review.validate(req.body);
        
        const newReview = new Review({
            reviewer: validatedReviewData.reviewer,
            reviewObject: validatedReviewData.reviewObject,
            type: validatedReviewData.type,
            status: 'PENDING APPROVAL'
        });
        await newReview.save();

    } catch(err) {
        next(err);
    }
};

const authorizeReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if(!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }

        if(review.status !== 'PENDING APPROVAL') {
            res.status(400).json({ error: 'Review is not pending approval' });
            return;
        }

        if(review.type === 'HIGH VALUE TXN') {
            if(req.userRole !== 'SYSTEM_MANAGER') {
                res.status(403).json({ error: 'Insufficient privilege to authorize high-value transactions' });
                return;
            } else {
                review.reviewer = req.userId;
                review.status = 'APPROVED';
                review.approvedBy.user = req.userId;
                review.approvedBy.timestamp = new Date().toISOString();
                await review.save();

                const senderTxn = await Transaction.findById(review.reviewObject);
                const beneficiaryTxn = await Transaction.findOne({ to: senderTxn?.to, review: review._id, type: 'CREDIT' });

                if(!senderTxn) {
                    res.status(404).json({ error: 'Debit transaction not found' });
                    return;
                }
                if(!beneficiaryTxn) {
                    res.status(404).json({ error: 'Credit transaction not found' });
                    return;
                }

                const sender = await Account.findById(senderTxn?.from);
                const beneficiary = await Account.findById(senderTxn?.to);
                let { statusCode, statusMessage, txnStatus } = await doTransaction(sender, beneficiary, senderTxn.amount);

                senderTxn.status = txnStatus;
                beneficiaryTxn.status = txnStatus;

                await senderTxn.save();
                await beneficiaryTxn.save();

                res.status(statusCode).json({ message: statusMessage });
                return;
            }
        }

        review.reviewer = req.userId;
        review.status = 'APPROVED';
        review.approvedBy.user = req.userId;
        review.approvedBy.timestamp = new Date().toISOString();
        await review.save();

        res.status(200).json({ message: 'Review authorized' });
    
    } catch(err) {
        next(err);
    }
};

const rejectReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if(!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }

        if(review.status !== 'PENDING APPROVAL') {
            res.status(400).json({ error: 'Review is not pending approval' });
            return;
        }

        if(review.type === 'HIGH VALUE TXN') {
            if(req.userRole !== 'SYSTEM_MANAGER') {
                res.status(403).json({ error: 'Insufficient privilege to authorize high-value transactions' });
                return;
            } else {
                review.reviewer = req.userId;
                review.status = 'REJECTED';
                review.rejectedBy.user = req.userId;
                review.rejectedBy.timestamp = new Date().toISOString();
                await review.save();

                const senderTxn = await Transaction.findById(review.reviewObject);
                const beneficiaryTxn = await Transaction.findOne({ to: senderTxn?.to, review: review._id, type: 'CREDIT' });

                if(!senderTxn) {
                    res.status(404).json({ error: 'Debit transaction not found' });
                    return;
                }
                if(!beneficiaryTxn) {
                    res.status(404).json({ error: 'Credit transaction not found' });
                    return;
                }

                senderTxn.status = 'REJECTED';
                beneficiaryTxn.status = 'REJECTED';

                await senderTxn.save();
                await beneficiaryTxn.save();

                res.status(200).json({ message: 'Transaction rejected' });
                return;
            }
        }

        review.reviewer = req.userId;
        review.status = 'REJECTED';
        review.approvedBy.user = req.userId;
        review.approvedBy.timestamp = new Date().toISOString();
        await review.save();

        res.status(200).json({ message: 'Review rejected' });

    } catch(err) {
        next(err);
    }
};

module.exports = {
    getAllReviews,
    getPendingAccountReviews,
    getPendingProfileReviews,
    getPendingTransactionReviews,
    getPendingHVTxnReviews,
    getApprovedAccountReviews,
    getApprovedProfileReviews,
    getApprovedTransactionReviews,
    getApprovedHVTxnReviews,
    getReview,
    updateReview,
    deleteReview,
    requestReview,
    authorizeReview,
    rejectReview
};
