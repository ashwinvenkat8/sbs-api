const express = require('express');

const {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getProfile,
    updateProfile,
    deleteProfile,
    requestTxnReview,
    authorizeTxnReview
} = require('../controllers/user');
const {
    authenticate,
    isSysAdmin,
    isSysMgr,
    isExternal
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);
router.get('/account/all', isSysAdmin, getAllAccounts);
router.route('/account/:id')
    .get(getAccount)
    .delete(isSysAdmin, deleteAccount);
router.route('/profile/:id')
    .get(getProfile)
    .patch(updateProfile)
    .delete(isSysAdmin, deleteProfile);
router.post('/review/request', isSysMgr, requestTxnReview);
router.post('/review/authorize', isExternal, authorizeTxnReview);

module.exports = router;
