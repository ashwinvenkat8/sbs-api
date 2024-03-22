const express = require('express');

const {
    createTransaction,
    getAllTransactions,
    getTransaction,
    updateTransaction,
    reviewHVTransaction,
    authorizeHVTransaction
} = require('../controllers/transaction');
const {
    authenticate,
    isSysMgr,
    isExternal,
    isExternalOrSysMgr
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/all', isExternalOrSysMgr, getAllTransactions);

router.post('/new', isExternal, createTransaction);

router.route('/:id')
    .get(isExternalOrSysMgr, getTransaction)
    .patch(isExternalOrSysMgr, updateTransaction);

router.post('/hvTxn/review', isExternal, reviewHVTransaction)
router.post('/hvTxn/authorize', isSysMgr, authorizeHVTransaction);

module.exports = router;
