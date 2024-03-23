const Review = require('../mongo/model/Review');

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

const getPendingReviews = async (req, res, next) => {
    try {
        const pendingReviews = await Review.find({ status: 'PENDING APPROVAL' });
        
        if(!pendingreviews) {
            res.status(404).json({ error: 'No pending reviews found' });
            return;
        }

        res.status(200).json(pendingReviews);

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
        if(review.reviewer !== req.userId && review.reviewee !== req.userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        res.status(200).json(review);

    } catch(err) {
        next(err);
    }
};

const updateReview = async (req, res, next) => {
    try {
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
            reviewee: validatedReviewData.reviewee,
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

        review.status = 'APPROVED';
        review.approvedBy.user = req.userId;
        review.approvedBy.timestamp = new Date().toISOString();
        await review.save();

        res.status(200).json({ message: 'Review approved' });
    } catch(err) {
        next(err);
    }
};

module.exports = {
    getAllReviews,
    getPendingReviews,
    getReview,
    updateReview,
    deleteReview,
    requestReview,
    authorizeReview
};
