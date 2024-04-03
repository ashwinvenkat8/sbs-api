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
} = require('../controllers/review');
const {
    authenticate,
    isSysAdminOrSysMgr,
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllReviews);

router.get('/', isSysAdminOrSysMgr, getReviewsByTypeAndStatus);

router.route('/:id')
    .get(getReview)
    .patch(isSysAdminOrSysMgr, updateReview)
    .delete(isSysAdminOrSysMgr, deleteReview);

router.post('/request', isSysAdminOrSysMgr, requestReview);
router.patch('/authorize/:id', authorizeReview);
router.patch('/reject/:id', rejectReview);

module.exports = router;
