const express = require('express');

const {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getAllProfiles,
    getProfile,
    updateProfile,
    deleteProfile,
    getMerchants,
    getPaymentId
} = require('../controllers/user');
const {
    authenticate,
    isCustomer,
    isExternal,
    isSysAdmin,
    isReviewApproved,
    isSysAdminOrSysMgr
} = require('../middleware/auth');

const router = express.Router();

router.all('*', authenticate);

router.get('/account/all', isSysAdmin, getAllAccounts);
router.get('/account/review/:id', isSysAdminOrSysMgr, isReviewApproved, getAccount);
router.route('/account/:id')
    .get(isExternal, getAccount)
    .delete(isSysAdmin, deleteAccount);

router.get('/profile/all', isSysAdmin, getAllProfiles);
router.get('/profile/review/:id', isSysAdminOrSysMgr, isReviewApproved, getProfile);
router.route('/profile/:id')
    .get(getProfile)
    .patch(isExternal, updateProfile)
    .delete(isSysAdmin, deleteProfile);

router.get('/merchants', isCustomer, getMerchants);
router.get('/payId/:id', getPaymentId);

module.exports = router;
