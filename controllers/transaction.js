const Account = require('../mongo/model/Account');
const Transaction = require('../mongo/model/Transaction');

const createTransaction = async (req, res, next) => {
    try {
        const validatedBody = await Transaction.validate(req.body);
        const fieldsToProject = { _id: 1, balance: 1 };
        let sender = await Account.findOne({ user: validatedBody.from }, fieldsToProject);
        let beneficiary = await Account.findOne({ user: validatedBody.to }, fieldsToProject);
        let isAmountValid = parseFloat(validatedBody.amount) > 1;

        if(!sender || req.userId !== validatedBody.from.toString()) {
            return res.status(400).json({ message: 'Invalid sender' });
        }
        if(!beneficiary) {
            return res.status(400).json({ message: 'Invalid beneficiary' });
        }
        if(!isAmountValid) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const newTransaction = new Transaction({
            from: sender._id,
            to: beneficiary._id,
            amount: validatedBody.amount,
            status: 'CREATED',
            createdBy: sender._id
        });

        if(parseFloat(validatedBody.amount) >= 10000) {
            newTransaction.status = 'PENDING APPROVAL';
        }

        const savedTransaction = await newTransaction.save();
        
        let updatedSenderBalance = parseFloat(sender.balance) - parseFloat(validatedBody.amount);
        if(updatedSenderBalance < 0) {
            await savedTransaction.updateOne({ status: 'CANCELLED' });
            return res.status(400).json({ message: 'Insufficient balance in sender\'s account' });
        }

        /**
         * TODO: Implement high value transaction authorization mechanism
        */

        const debitFromSender = await Account.updateOne({ _id: sender._id }, { balance: updatedSenderBalance });
        if(!debitFromSender.acknowledged || debitFromSender.modifiedCount !== 1) {
            await savedTransaction.updateOne({ status: 'FAILED' });
            
            // Restore balance
            await Account.updateOne({ _id: sender._id }, { balance: sender.balance });
            
            return res.status(500).json({ error: 'Transaction failed' });
        }
        
        let updatedBeneficiaryBalance = parseFloat(beneficiary.balance) + parseFloat(validatedBody.amount);
        const creditToBeneficiary = await Account.updateOne({ _id: beneficiary._id }, { balance: updatedBeneficiaryBalance });
        
        if(!creditToBeneficiary.acknowledged || creditToBeneficiary.modifiedCount !== 1) {
            await savedTransaction.updateOne({ status: 'FAILED' });
            
            // Restore balances
            await Account.updateOne({ _id: sender._id }, { balance: sender.balance });
            await Account.updateOne({ _id: beneficiary._id }, { balance: beneficiary.balance });
            
            return res.status(500).json({ error: 'Transaction failed' });
        }

        await savedTransaction.updateOne({ status: 'COMPLETED' });

        res.status(200).json({ message: 'Transaction completed' });

    } catch(err) {
        next(err);
    }
};

const getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Account.findOne({ user: req.userId }, { transactions: 1 });

        if(!transactions) {
            return res.status(404).status({ message: 'No transactions found' });
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
            return res.status(404).json({ message: 'Transaction not found' });
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
            return res.status(500).json({ message: 'Transaction update failed' });
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
