const Account = require('../mongo/model/Account');
const Review = require('../mongo/model/Review');
const Transaction = require('../mongo/model/Transaction');
const User = require('../mongo/model/User');

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
        console.log("getAllReviews() @ controllers/review.js");
        next(err);
    }
};

const getReviewsByFilter = async (req, res, next) => {
    try {
        const validStatus = ['PENDING APPROVAL', 'APPROVED', 'REJECTED'];
        const validType = ['HIGH VALUE TXN', 'PAYMENT', 'TRANSACTION', 'PROFILE', 'ACCOUNT'];
        let filter = {};
        
        const createdBy = req.query?.createdBy;
        const reviewStatus = req.query?.status;
        const reviewType = req.query?.type;
        const reviewer = req.query?.reviewer;
        const reviewObject = req.query?.reviewObject;

        if(createdBy) {
            if(!await User.exists({ _id: createdBy })) {
                res.status(400).json({ error: 'User not found' });
                return;
            }
            filter['createdBy'] = createdBy;
        }
        
        if(reviewStatus) {
            if(!validStatus.includes(reviewStatus)) {
                res.status(400).json({ error: 'Invalid review status' });
                return;
            }
            filter['status'] = reviewStatus;
        }
        
        if(reviewType) {
            if(!validType.includes(reviewType)) {
                res.status(400).json({ error: 'Invalid review type' });
                return;
            }
            filter['type'] = reviewType;
        }
        
        if(reviewer) {
            if(!await User.exists({ _id: reviewer })) {
                res.status(400).json({ error: 'Reviewer not found' });
                return;
            }
            filter['reviewer'] = reviewer;
        }
        
        if(reviewObject) {
            switch(reviewType.toUpperCase()) {
                case 'ACCOUNT':
                case 'TRANSACTION': {
                    if(!await Account.exists({ _id: reviewObject })) {
                        res.status(400).json({ error: 'Account not found' });
                        return;
                    }
                    break;
                }
                case 'HIGH VALUE TXN':
                case 'PAYMENT': {
                    if(!await Transaction.exists({ _id: reviewObject })) {
                        res.status(400).json({ error: 'Transaction not found' });
                        return;
                    }
                    break;
                }
                case 'PROFILE': {
                    if(!await User.exists({ _id: reviewObject })) {
                        res.status(400).json({ error: 'User not found' });
                        return;
                    }
                    break;
                }
            }
            filter['reviewObject'] = reviewObject;
        }

        if(Object.keys(filter).length === 0 && filter.constructor === Object) {
            res.status(400).json({ error: 'No filters provided' });
            return;
        }

        let reviews = null;

        if(reviewType) {
            reviews = await Review.find(filter)
                .populate({
                    path: 'reviewObject',
                    ref: reviewType
                })
                .populate({
                    path: 'reviewer approvedBy rejectedBy createdBy',
                    select: '-_id attributes.first_name attributes.last_name'
                }).exec();

        } else {
            reviews = await Review.find(filter)
                .populate({
                    path: 'reviewer approvedBy rejectedBy createdBy',
                    select: '-_id attributes.first_name attributes.last_name'
                }).exec();
        }
        
        if(!reviews) {
            res.status(404).json({ error: `No ${reviewStatus.toLowerCase()} ${reviewType.toLowerCase()} reviews found` });
            return;
        }

        res.status(200).json(reviews);

    } catch(err) {
        console.log("getReviewsByFilter() @ controllers/review.js");
        next(err);
    }
};

const getApprovedReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if(!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        if(review.status !== 'APPROVED') {
            res.status(400).json({ error: 'Review is not approved' });
            return;
        }

        switch(review.type) {
            case 'TRANSACTION': {
                const transactions = await Account.findOne({ _id: review.reviewObject }, { transactions: 1 });
                
                if(!transactions) {
                    res.status(404).json( { error: 'Transactions not found' });
                } else {
                    res.status(200).json(transactions.toJSON());
                }
                
                break;
            }
            case 'PROFILE': {
                const fieldsToProject = { 'otp.secret': 0, password: 0, 'sessions.token': 0 };
                const profile = await User.findOne({ _id: review.reviewObject }, fieldsToProject);
                
                if(!profile) {
                    res.status(404).json( { error: 'Profile not found' });
                } else {
                    res.status(200).json(profile);
                }
                
                break;
            }
            case 'ACCOUNT': {
                const fieldsToProject = { user: 0, transactions: 0 };
                const account = await Account.findOne({ _id: review.reviewObject }, fieldsToProject);
                
                if(!account) {
                    res.status(404).json( { error: 'Account not found' });
                } else {
                    res.status(200).json(account.toJSON());
                }
                
                break;
            }
            default: {
                res.status(400).json({ error: 'Invalid review type' });
            }
        }
    } catch(err) {
        console.log("getApprovedReview() @ controllers/review.js");
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
        console.log("getReview() @ controllers/review.js");
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
        console.log("updateReview() @ controllers/review.js");
        next(err);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        await Review.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Review deleted' });
    } catch(err) {
        console.log("deleteReview() @ controllers/review.js");
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
            status: 'PENDING APPROVAL',
            createdBy: validatedReviewData.createdBy
        });
        await newReview.save();

        switch(newReview.type) {
            case 'ACCOUNT':
            case 'TRANSACTION': {
                await Account.updateOne({ _id: newReview.reviewObject }, { review: newReview._id });
                break;
            }
            case 'PROFILE': {
                await User.updateOne({ _id: newReview.reviewObject }, { review: newReview._id });
                break;
            }
            default: {
                res.status(400).json({ error: 'Invalid review type' });
                return;
            }
        }

        res.status(201).json({ message: 'Review request created' });

    } catch(err) {
        console.log("requestReview() @ controllers/review.js");
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
                if(!senderTxn) {
                    res.status(404).json({ error: 'Debit transaction not found' });
                    return;
                }
                
                const beneficiaryTxn = await Transaction.findOne({ to: senderTxn?.to, review: review._id, type: 'CREDIT' });
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
        } else if(review.type === 'PAYMENT') {
            if(req.userRole !== 'CUSTOMER') {
                res.status(403).json({ error: 'Insufficient privilege to authorize merchant payment' });
                return;
            } else {
                review.reviewer = req.userId;
                review.status = 'APPROVED';
                review.approvedBy.user = req.userId;
                review.approvedBy.timestamp = new Date().toISOString();
                await review.save();

                const senderTxn = await Transaction.findById(review.reviewObject);
                if(!senderTxn) {
                    res.status(404).json({ error: 'Debit transaction not found' });
                    return;
                }

                const beneficiaryTxn = await Transaction.findOne({ to: senderTxn?.to, review: review._id, type: 'CREDIT' });
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
        console.log("authorizeReview() @ controllers/review.js");
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
        console.log("rejectReview() @ controllers/review.js");
        next(err);
    }
};

module.exports = {
    getAllReviews,
    getReviewsByFilter,
    getApprovedReview,
    getReview,
    updateReview,
    deleteReview,
    requestReview,
    authorizeReview,
    rejectReview
};
