const express = require('express');

const {
    createTransaction,
    createPayment,
    requestPayment,
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/transaction');
const {
    authenticate,
    isEmployee,
    isExternal,
    isSysMgr,
    isNotSysAdmin,
    isReviewApproved,
    isCustomerOrEmployee,
    isMerchantOrEmployee,
    isExternalOrEmployee,
    isSysAdminOrSysMgr
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isSysAdminOrSysMgr, getAllTransactions);
router.get('/myTxns', isExternal, getUserTransactions);
router.get('/:userId/all', isSysMgr, isReviewApproved, getUserTransactions);

router.post('/new', isExternalOrEmployee, createTransaction);
router.post('/pay/request', isMerchantOrEmployee, requestPayment);
router.post('/pay/:id', isCustomerOrEmployee, createPayment);

router.route('/:id')
    .get(isNotSysAdmin, getTransaction)
    .patch(isEmployee, updateTransaction)
    .delete(isEmployee, deleteTransaction);

module.exports = router;
