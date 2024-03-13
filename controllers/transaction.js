const mongoose = require('mongoose');
const Account = require('../mongo/model/Account');
const Transaction = require('../mongo/model/Transaction');

const createTransaction = async (req, res, next) => {
    let savedTransaction = null;

    try {
        const fieldsToProject = { _id: 1, user: 1, balance: 1 };
        const sender = await Account.findOne({ accountNumber: req.body.from }, fieldsToProject);
        const beneficiary = await Account.findOne({ accountNumber: req.body.to }, fieldsToProject);
        let isAmountValid = parseFloat(req.body.amount) > 1;

        if(!sender || req.userId !== sender.user.toString()) {
            res.status(400).json({ message: 'Invalid sender' });
            return;
        }
        if(!beneficiary) {
            res.status(400).json({ message: 'Invalid beneficiary' });
            return;
        }
        if(!isAmountValid) {
            res.status(400).json({ message: 'Invalid amount' });
            return;
        }

        const dbSession = await mongoose.startSession();
        dbSession.withTransaction(async () => {
            const newTransaction = new Transaction({
                from: sender._id,
                to: beneficiary._id,
                amount: req.body.amount,
                status: 'CREATED',
                createdBy: sender.user
            });
    
            if(parseFloat(req.body.amount) >= 10000) {
                newTransaction.status = 'PENDING APPROVAL';
            }
    
            savedTransaction = await newTransaction.save();
            
            let updatedSenderBalance = parseFloat(sender.balance) - parseFloat(req.body.amount);
            if(updatedSenderBalance < 0) {
                await savedTransaction.updateOne({ status: 'CANCELLED' }).session(dbSession);
                res.status(400).json({ message: 'Insufficient balance in sender\'s account' });
                return;
            }
    
            /**
             * TODO: Implement high value transaction authorization mechanism
            */
    
            const debitFromSender = await Account.updateOne({ _id: sender._id }, { balance: updatedSenderBalance }).session(dbSession);
            if(!debitFromSender.acknowledged || debitFromSender.modifiedCount !== 1) {
                await savedTransaction.updateOne({ status: 'FAILED' }).session(dbSession);
                
                // Restore balance
                // await Account.updateOne({ _id: sender._id }, { balance: sender.balance });
                await dbSession.abortTransaction();
                
                res.status(500).json({ error: 'Transaction failed' });
                return;
            }
            
            let updatedBeneficiaryBalance = parseFloat(beneficiary.balance) + parseFloat(req.body.amount);
            
            const creditToBeneficiary = await Account.updateOne({ _id: beneficiary._id }, { balance: updatedBeneficiaryBalance }).session(dbSession);
            if(!creditToBeneficiary.acknowledged || creditToBeneficiary.modifiedCount !== 1) {
                await savedTransaction.updateOne({ status: 'FAILED' }).session(dbSession);
                
                // Restore balances
                // await Account.updateOne({ _id: sender._id }, { balance: sender.balance });
                // await Account.updateOne({ _id: beneficiary._id }, { balance: beneficiary.balance });
                await dbSession.abortTransaction();
                
                res.status(500).json({ error: 'Transaction failed' });
                return;
            }

            await savedTransaction.updateOne({ status: 'COMPLETED' }).session(dbSession);
            res.status(200).json({ message: 'Transaction completed' });
        });
        
    } catch(err) {
        await savedTransaction.updateOne({ status: 'FAILED' });
        next(err);
    }
};

const getAllTransactions = async (req, res, next) => {
    try {
        let transactions = null;

        if (req.userRole === 'SYSTEM_MANAGER') {
            transactions = await Transaction.find({});
        } else {
            transactions = await Account.findOne({ user: req.userId }, { transactions: 1 });
        }

        if(!transactions) {
            res.status(404).status({ message: 'No transactions found' });
            return;
        }

        res.status(200).json(transactions);

    } catch(err) {
        next(err);
    }
};

const getTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if(!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        res.status(200).json(transaction);

    } catch(err) {
        next(err);
    }
};

const updateTransaction = async (req, res, next) => {
    try {
        const validatedTxnData = await Transaction.validate(req.body);
        
        const txnUpdate = await Transaction.updateOne({ _id: req.params.id }, validatedTxnData);
        if(!txnUpdate.acknowledged || txnUpdate.modifiedCount !== 1) {
            res.status(500).json({ message: 'Transaction update failed' });
            return;
        }

        res.status(200).json({ message: 'Transaction updated' });

    } catch(err) {
        next(err);
    }
};

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
