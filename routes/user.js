const express = require('express');

const {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getAllProfiles,
    getProfile,
    updateProfile,
    deleteProfile
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

router.get('/profile/all', isSysAdmin, getAllProfiles);
router.route('/profile/:id')
    .get(getProfile)
    .patch(updateProfile)
    .delete(isSysAdmin, deleteProfile);

module.exports = router;
