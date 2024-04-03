const express = require('express');

const {
    createTransaction,
    createPayment,
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    updateTransaction,
} = require('../controllers/transaction');
const {
    authenticate,
    isSysMgr,
    isExternalOrSysMgr,
    isSysAdminOrSysMgr,
    isReviewApproved,
    isCustomer,
    isExternalOrEmployee
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllTransactions);
router.get('/:userId/all', isSysMgr, isReviewApproved, getUserTransactions);

router.post('/new', isExternalOrEmployee, createTransaction);
router.post('/pay/:id', isCustomer, createPayment);

router.route('/:id')
    .get(isExternalOrSysMgr, getTransaction)
    .patch(isExternalOrSysMgr, updateTransaction);

module.exports = router;
