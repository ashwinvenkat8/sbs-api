const Account = require('../mongo/model/Account');
const Transaction = require('../mongo/model/Transaction');
const User = require('../mongo/model/User');

const getAllAccounts = async (req, res, next) => {
    try {
        const accounts = await Account.find(
            {},
            { transactions: 0, beneficiaries: 0 }
        ).populate({
            path: 'user',
            select: '-password -sessions',
            retainNullValues: true
        }).exec();

        if(!accounts) {
            return res.status(404).status({ message: 'Found no registered accounts' });
        }

        res.status(200).json(accounts);

    } catch(err) {
        next(err);
    }
};

const getAccount = async (req, res, next) => {
    try {
        const account = await Account.findById(
            req.params.id,
            { transactions: 0, beneficiaries: 0 }
        ).populate({
            path: 'user',
            select: '-password -sessions',
            retainNullValues: true
        }).exec();

        if(!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json(account);

    } catch(err) {
        next(err);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const deleteResult = await Account.deleteOne({ _id: req.params.id });

        console.log(deleteResult);
        res.status(200).json({ message: 'Account deleted' });

    } catch(err) {
        next(err);
    }
};

const getAllProfiles = async (req, res, next) => {
    try {
        const profiles = await User.find(
            {},
            { password: 0, sessions: 0 }
        );

        if(!profiles) {
            return res.status(404).json({ message: 'Found no registered profiles' });
        }

        res.status(200).json(profiles);

    } catch(err) {
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(
            req.params.id,
            { password: 0, sessions: 0 }
        );

        if(!user) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        res.status(200).json(user);

    } catch(err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        // const updatedUser = await User.validate(req.body);

        // if (!Object.keys(updatedUser).length === 0 && updated.constructor === Object) {
        //     await updatedUser.save();
        // }

        const validatedUserData = await User.validate(req.body);
        
        await User.updateOne({ _id: req.userId }, validatedUserData);

        res.status(200).json({ message: 'Profile updated' });

    } catch(err) {
        next(err);
    }
};

const deleteProfile = async (req, res, next) => {
    try {
        await User.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Profile deleted' });

    } catch(err) {
        next(err);
    }
};

const requestTxnReview = async (req, res, next) => {};

const authorizeTxnReview = async (req, res, next) => {};

module.exports = {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getAllProfiles,
    getProfile,
    updateProfile,
    deleteProfile,
    requestTxnReview,
    authorizeTxnReview
};
