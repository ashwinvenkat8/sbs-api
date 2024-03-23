const express = require('express');

const {
    getAllReviews,
    getPendingReviews,
    getReview,
    updateReview,
    deleteReview,
    requestReview,
    authorizeReview
} = require('../controllers/review');
const {
    authenticate,
    isSysMgr,
    isExternal,
    isSysAdminOrSysMgr
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllReviews);
router.get('/pending', isSysAdminOrSysMgr, getPendingReviews);

router.route('/:id')
    .get(getReview)
    .patch(isSysAdminOrSysMgr, updateReview)
    .delete(isSysAdminOrSysMgr, deleteReview);

router.post('/request', isSysMgr, requestReview);
router.patch('/authorize/:id', isExternal, authorizeReview);

module.exports = router;
