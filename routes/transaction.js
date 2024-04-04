const express = require('express');

const {
    createTransaction,
    createPayment,
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/transaction');
const {
    authenticate,
    isEmployee,
    isSysMgr,
    isNotSysAdmin,
    isReviewApproved,
    isCustomerOrEmployee,
    isExternalOrEmployee,
    isSysAdminOrSysMgr
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllTransactions);
router.get('/:userId/all', isSysMgr, isReviewApproved, getUserTransactions);

router.post('/new', isExternalOrEmployee, createTransaction);
router.post('/pay/:id', isCustomerOrEmployee, createPayment);

router.route('/:id')
    .get(isNotSysAdmin, getTransaction)
    .patch(isEmployee, updateTransaction)
    .delete(isEmployee, deleteTransaction);

module.exports = router;
