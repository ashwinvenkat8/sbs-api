const Account = require('../mongo/model/Account');
const Transaction = require('../mongo/model/Transaction');
const User = require('../mongo/model/User');

const createTransaction = async (req, res, next) => {};

const getAllTransactions = async (req, res, next) => {};

const getTransaction = async (req, res, next) => {};

const updateTransaction = async (req, res, next) => {};

const reviewHVTransaction = async (req, res, next) => {};

const authorizeHVTransaction = async (req, res, next) => {};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransaction,
    updateTransaction,
    reviewHVTransaction,
    authorizeHVTransaction
};
