const express = require('express');

const {
    createTransaction,
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    updateTransaction,
} = require('../controllers/transaction');
const {
    authenticate,
    isExternal,
    isSysMgr,
    isExternalOrSysMgr,
    isSysAdminOrSysMgr,
    isReviewApproved
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllTransactions);
router.get('/:userId/all', isSysMgr, isReviewApproved, getUserTransactions);

router.post('/new', isExternal, createTransaction);

router.route('/:id')
    .get(isExternalOrSysMgr, getTransaction)
    .patch(isExternalOrSysMgr, updateTransaction);

module.exports = router;
