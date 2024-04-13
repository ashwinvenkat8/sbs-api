const mongoose = require('mongoose');
const Account = require('../mongo/model/Account');
const Review = require('../mongo/model/Review');
const Transaction = require('../mongo/model/Transaction');
const User = require('../mongo/model/User');

const doTransaction = async (sender, beneficiary, amount) => {
    try {
        const dbSession = await mongoose.startSession();
        dbSession.withTransaction(async () => {
            // DEBIT
            let updatedSenderBalance = parseFloat(sender.balance) - parseFloat(amount);
            const debitFromSender = await Account.updateOne({ _id: sender._id }, { balance: updatedSenderBalance }).session(dbSession);
            if(!debitFromSender.acknowledged || debitFromSender.modifiedCount !== 1) {
                await dbSession.abortTransaction();
                return { statusCode: 500, statusMessage: 'Debit failed', txnStatus: 'FAILED' };
            }

            // CREDIT
            let updatedBeneficiaryBalance = parseFloat(beneficiary.balance) + parseFloat(amount);
            const creditToBeneficiary = await Account.updateOne({ _id: beneficiary._id }, { balance: updatedBeneficiaryBalance }).session(dbSession);
            if(!creditToBeneficiary.acknowledged || creditToBeneficiary.modifiedCount !== 1) {
                await dbSession.abortTransaction();
                return { statusCode: 500, statusMessage: 'Credit failed', txnStatus: 'FAILED' };
            }
        });

        return { statusCode: 200, statusMessage: 'Transaction completed', txnStatus: 'COMPLETED' };
    
    } catch(err) {
        console.log("doTransaction() @ controllers/transaction.js");
        next(err);
    }
};

const createTransaction = async (req, res, next) => {
    try {
        const fieldsToProject = { _id: 1, user: 1, balance: 1 };
        const sender = await Account.findOne({ accountNumber: req.body.from }, fieldsToProject);
        const beneficiary = await Account.findOne({ accountNumber: req.body.to }, fieldsToProject);

        if(!sender || req.userId !== sender.user.toString()) {
            res.status(400).json({ error: 'Invalid sender' });
            return;
        }
        if(!beneficiary) {
            res.status(400).json({ error: 'Invalid beneficiary' });
            return;
        }
        if(req.body.from === req.body.to) {
            res.status(400).json({ error: 'Sender and beneficiary accounts cannot be the same' });
            return;
        }
        if(parseFloat(req.body.amount) < 1) {
            res.status(400).json({ error: 'Invalid amount' });
            return;
        }

        let updatedSenderBalance = parseFloat(sender.balance) - parseFloat(req.body.amount);
        if(updatedSenderBalance < 0) {
            res.status(400).json({ error: 'Insufficient balance in sender\'s account' });
            return;
        }

        const senderTxn = new Transaction({
            from: sender._id,
            to: beneficiary._id,
            amount: req.body.amount,
            message: req.body?.message || null,
            type: 'DEBIT',
            status: 'CREATED'
        });

        const beneficiaryTxn = new Transaction({
            from: sender._id,
            to: beneficiary._id,
            amount: req.body.amount,
            message: req.body?.message || null,
            type: 'CREDIT',
            status: 'CREATED'
        });

        // High-value transaction - creates a review and sets transaction status to 'PENDING APPROVAL'
        if(parseFloat(req.body.amount) >= 10000) {
            senderTxn.status = 'PENDING APPROVAL';
            beneficiaryTxn.status = 'PENDING APPROVAL';
            
            await Account.updateOne({ _id: sender._id }, { $push: { transactions: senderTxn._id }});
            await Account.updateOne({ _id: beneficiary._id }, { $push: { transactions: beneficiaryTxn._id }});
            
            const newReview = new Review({
                reviewObject: senderTxn._id,
                type: 'HIGH VALUE TXN',
                status: 'PENDING APPROVAL'
            });
            const savedReview = await newReview.save();
            
            senderTxn.review = savedReview._id;
            beneficiaryTxn.review = savedReview._id;

            await senderTxn.save();
            await beneficiaryTxn.save();
            
            res.status(201).json({ message: 'High value transaction created and pending approval' });

        // Regular transaction - debits sender and credits beneficiary immediately
        } else {
            let { statusCode, statusMessage, txnStatus } = await doTransaction(sender, beneficiary, req.body.amount);

            senderTxn.status = txnStatus;
            beneficiaryTxn.status = txnStatus;

            const savedSenderTxn = await senderTxn.save();
            const savedBeneficiaryTxn = await beneficiaryTxn.save();

            await Account.updateOne({ _id: sender._id }, { $push: { transactions: savedSenderTxn._id }});
            await Account.updateOne({ _id: beneficiary._id }, { $push: { transactions: savedBeneficiaryTxn._id }});

            res.status(statusCode).json({ message: statusMessage });
        }
    } catch(err) {
        console.log("createTransaction() @ controllers/transaction.js");
        next(err);
    }
};

const createPayment = async (req, res, next) => {
    try {
        const merchant = await User.findOne({ 'attributes.payment_id': req.params.id }, { _id: 1 });

        if(!merchant) {
            res.status(404).json({ error: 'Merchant not found' });
            return;
        }
        
        const fieldsToProject = { _id: 1, accountNumber: 1, user: 1, balance: 1 };
        const merchantAccount = await Account.findOne({ user: merchant._id }, fieldsToProject);
        const customerAccount = await Account.findOne({ user: req.userId }, fieldsToProject);

        let updatedCustomerBalance = parseFloat(customerAccount.balance) - parseFloat(req.body.amount);
        if(updatedCustomerBalance < 0) {
            res.status(400).json({ error: 'Insufficient balance in customer\'s account' });
            return;
        }

        const customerTxn = new Transaction({
            from: customerAccount._id,
            to: merchantAccount._id,
            amount: req.body.amount,
            message: req.body?.message || null,
            type: 'DEBIT',
            status: 'CREATED'
        });

        const merchantTxn = new Transaction({
            from: customerAccount._id,
            to: merchantAccount._id,
            amount: req.body.amount,
            message: req.body?.message || null,
            type: 'CREDIT',
            status: 'CREATED'
        });

        // High-value transaction - creates a review and sets transaction status to 'PENDING APPROVAL'
        if(parseFloat(req.body.amount) >= 1000) {
            customerTxn.status = 'PENDING APPROVAL';
            merchantTxn.status = 'PENDING APPROVAL';
            
            await Account.updateOne({ _id: customerAccount._id }, { $push: { transactions: customerTxn._id }});
            await Account.updateOne({ _id: merchantAccount._id }, { $push: { transactions: merchantTxn._id }});
            
            const newReview = new Review({
                reviewObject: customerTxn._id,
                type: 'HIGH VALUE TXN',
                status: 'PENDING APPROVAL'
            });
            const savedReview = await newReview.save();
            
            customerTxn.review = savedReview._id;
            merchantTxn.review = savedReview._id;

            await customerTxn.save();
            await merchantTxn.save();
            
            res.status(201).json({ message: 'High value transaction created and pending approval' });

        // Regular transaction - debits sender and credits merchant immediately
        } else {
            let { statusCode, statusMessage, txnStatus } = await doTransaction(customerAccount, merchantAccount, req.body.amount);

            customerTxn.status = txnStatus;
            merchantTxn.status = txnStatus;

            const savedCustomerTxn = await customerTxn.save();
            const savedMerchantTxn = await merchantTxn.save();

            await Account.updateOne({ _id: customerAccount._id }, { $push: { transactions: savedCustomerTxn._id }});
            await Account.updateOne({ _id: merchantAccount._id }, { $push: { transactions: savedMerchantTxn._id }});

            res.status(statusCode).json({ message: statusMessage });
        }
    } catch(err) {
        console.log("createPayment() @ controllers/transaction.js");
        next(err);
    }
};

const requestPayment = async (req, res, next) => {
    try {
        if(!req.body?.accountNumber || !req.body?.amount) {
            res.status(400).json({ error: 'Incomplete payment request' });
            return;
        }

        const customerAccount = await Account.findOne({ accountNumber: req.body.accountNumber }, { _id: 1, user: 1, accountNumber: 1 });
        if(!customerAccount) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }

        const merchantAccount = await Account.findOne({ user: req.userId }, { _id: 1 });
        if(!merchantAccount) {
            res.status(404).json({ error: 'Merchant not found' });
            return;
        }

        const customerTxn = new Transaction({
            from: customerAccount._id,
            to: merchantAccount._id,
            amount: req.body?.amount,
            message: req.body?.message || null,
            type: 'DEBIT',
            status: 'PENDING APPROVAL'
        });

        const merchantTxn = new Transaction({
            from: customerAccount._id,
            to: merchantAccount._id,
            amount: req.body?.amount,
            message: req.body?.message || null,
            type: 'CREDIT',
            status: 'PENDING APPROVAL'
        });

        await Account.updateOne({ _id: customerAccount._id }, { $push: { transactions: customerTxn._id }});
        await Account.updateOne({ _id: merchantAccount._id }, { $push: { transactions: merchantTxn._id }});

        const newReview = new Review({
            reviewer: customerAccount._id,
            reviewObject: customerTxn._id,
            type: 'PAYMENT',
            status: 'PENDING APPROVAL'
        });
        const savedReview = await newReview.save();

        customerTxn.review = savedReview._id;
        merchantTxn.review = savedReview._id;

        await customerTxn.save();
        await merchantTxn.save();

        res.status(201).json({ message: 'Payment request created and pending approval' });
    } catch(err) {
        console.log("requestPayment() @ controllers/transaction.js");
        next(err);
    }
};

const getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({})
            .populate({
                path: 'from to',
                select: `accountNumber`,
                populate: {
                    path: 'user',
                    select: '-_id attributes.first_name attributes.last_name'
                }
            }).exec();

        if(!transactions) {
            res.status(404).status({ error: 'No transactions found' });
            return;
        }

        res.status(200).json(transactions.toJSON());

    } catch(err) {
        console.log("getAllTransactions() @ controllers/transaction.js");
        next(err);
    }
};

const getUserTransactions = async (req, res, next) => {
    try {
        let filter = null;
        if(!req.reviewee) {
            filter = { user: req.userId };
        } else {
            filter = { user: req.reviewee };
        }

        const transactions = await Account.findOne(filter, { transactions: 1 })
            .populate({
                path: 'transactions',
                select: '-review',
                populate: {
                    path: 'from to',
                    select: `accountNumber`,
                    populate: {
                        path: 'user',
                        select: '-_id attributes.first_name attributes.last_name'
                    }
                }
            }).exec();

        if(!transactions) {
            res.status(404).status({ error: 'No transactions found' });
            return;
        }

        res.status(200).json(transactions.toJSON());

    } catch(err) {
        console.log("getUserTransactions() @ controllers/transaction.js");
        next(err);
    }
}

const getTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate({
                path: 'from to',
                select: `accountNumber`,
                populate: {
                    path: 'user',
                    select: '-_id attributes.first_name attributes.last_name'
                }
            }).exec();

        if(!transaction) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        res.status(200).json(transaction.toJSON());

    } catch(err) {
        console.log("getTransaction() @ controllers/transaction.js");
        next(err);
    }
};

const updateTransaction = async (req, res, next) => {
    try {
        const txnInDb = await Transaction.findById(req.params.id);

        if(!txnInDb) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        delete req.body.from;
        delete req.body.to;
        delete req.body.amount;
        delete req.body.type;
        
        const validatedTxnData = await Transaction.validate(req.body);
        
        const txnUpdate = await Transaction.updateOne({ _id: req.params.id }, validatedTxnData);
        if(!txnUpdate.acknowledged || txnUpdate.modifiedCount !== 1) {
            res.status(500).json({ error: 'Transaction update failed' });
            return;
        }

        res.status(200).json({ message: 'Transaction updated' });

    } catch(err) {
        console.log("updateTransaction() @ controllers/transaction.js");
        next(err);
    }
};

const deleteTransaction = async (req, res, next) => {
    try {
        await Transaction.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Transaction deleted' });
    } catch(err) {
        console.log("deleteTransaction() @ controllers/transaction.js");
        next(err);
    }
};

module.exports = {
    doTransaction,
    createTransaction,
    createPayment,
    requestPayment,
    getAllTransactions,
    getUserTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction
};
