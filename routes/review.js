const express = require('express');

const {
    getAllReviews,
    getPendingAccountReviews,
    getPendingProfileReviews,
    getPendingTransactionReviews,
    getApprovedAccountReviews,
    getApprovedProfileReviews,
    getApprovedTransactionReviews,
    getReview,
    updateReview,
    deleteReview,
    requestReview,
    authorizeReview,
    getPendingHVTxnReviews,
    getApprovedHVTxnReviews
} = require('../controllers/review');
const {
    authenticate,
    isSysAdminOrSysMgr,
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllReviews);

router.get('/pending/account', isSysAdminOrSysMgr, getPendingAccountReviews);
router.get('/pending/profile', isSysAdminOrSysMgr, getPendingProfileReviews);
router.get('/pending/transaction', isSysAdminOrSysMgr, getPendingTransactionReviews);
router.get('/pending/hvTxn', isSysAdminOrSysMgr, getPendingHVTxnReviews);

router.get('/approved/account', isSysAdminOrSysMgr, getApprovedAccountReviews);
router.get('/approved/profile', isSysAdminOrSysMgr, getApprovedProfileReviews);
router.get('/approved/transaction', isSysAdminOrSysMgr, getApprovedTransactionReviews);
router.get('/approved/hvTxn', isSysAdminOrSysMgr, getApprovedHVTxnReviews);

router.route('/:id')
    .get(getReview)
    .patch(isSysAdminOrSysMgr, updateReview)
    .delete(isSysAdminOrSysMgr, deleteReview);

router.post('/request', isSysAdminOrSysMgr, requestReview);
router.patch('/authorize/:id', authorizeReview);

module.exports = router;
