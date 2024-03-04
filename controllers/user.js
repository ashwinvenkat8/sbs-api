const bcrypt = require('bcrypt');

const Account = require('../mongo/model/Account');
const User = require('../mongo/model/User');

const getAllAccounts = async (req, res, next) => {};

const getAccount = async (req, res, next) => {};

const deleteAccount = async (req, res, next) => {};

const getProfile = async (req, res, next) => {};

const updateProfile = async (req, res, next) => {};

const deleteProfile = async (req, res, next) => {};

const requestTxnReview = async (req, res, next) => {};

const authorizeTxnReview = async (req, res, next) => {};

module.exports = {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getProfile,
    updateProfile,
    deleteProfile,
    requestTxnReview,
    authorizeTxnReview
};
