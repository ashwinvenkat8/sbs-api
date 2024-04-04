const express = require('express');

const {
    getAllReviews,
    getReviewsByTypeAndStatus,
    getReview,
    updateReview,
    deleteReview,
    requestReview,
    authorizeReview,
    rejectReview,
    getApprovedReview,
} = require('../controllers/review');
const {
    authenticate,
    isSysAdminOrSysMgr,
    isSysAdmin,
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdmin, getAllReviews);
router.get('/filter', isSysAdminOrSysMgr, getReviewsByTypeAndStatus);
router.get('/approved/:id', isSysAdminOrSysMgr, getApprovedReview);

router.route('/:id')
    .get(getReview)
    .patch(isSysAdminOrSysMgr, updateReview)
    .delete(isSysAdminOrSysMgr, deleteReview);

router.post('/request', isSysAdminOrSysMgr, requestReview);
router.patch('/authorize/:id', authorizeReview);
router.patch('/reject/:id', rejectReview);

module.exports = router;
