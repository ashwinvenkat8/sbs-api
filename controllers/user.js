const Account = require('../mongo/model/Account');
const User = require('../mongo/model/User');

const getAllAccounts = async (req, res, next) => {
    try {
        const accounts = await Account.find({}, { transactions: 0, review: 0 })
            .populate({
                path: 'user',
                select: '-otp.secret -password -review -sessions',
                retainNullValues: true
            }).exec();

        if(!accounts) {
            res.status(404).status({ message: 'Found no registered accounts' });
            return;
        }

        res.status(200).json(accounts);

    } catch(err) {
        next(err);
    }
};

const getAccount = async (req, res, next) => {
    try {
        const account = await Account.findById(req.params.id, { transactions: 0, review: 0 })
            .populate({
                path: 'user',
                select: '-otp.secret -password -review -sessions',
                retainNullValues: true
            }).exec();

        if(!account) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }

        res.status(200).json(account);

    } catch(err) {
        next(err);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        await Account.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Account deleted' });
    } catch(err) {
        next(err);
    }
};

const getAllProfiles = async (req, res, next) => {
    try {
        const profiles = await User.find({}, { 'otp.secret': 0, password: 0, review: 0, sessions: 0 });

        if(!profiles) {
            res.status(404).json({ message: 'Found no registered profiles' });
            return;
        }

        res.status(200).json(profiles);

    } catch(err) {
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id, { 'otp.secret': 0, password: 0, review: 0, sessions: 0 });

        if(!user) {
            res.status(404).json({ message: 'User profile not found' });
            return;
        }

        res.status(200).json(user);

    } catch(err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userInDb = await User.findById(req.params.id);

        if(!userInDb) {
            res.status(404).json({ message: 'User profile not found' });
            return;
        }

        delete req.body.email;
        delete req.body.password;
        delete req.body.otp;
        delete req.body.role;
        delete req.body.sessions;
        delete req.body.last_login;

        const validatedUserData = await User.validate(req.body);
        
        const userUpdate = await User.updateOne({ _id: req.params.id }, validatedUserData);

        if(!userUpdate.acknowledged || userUpdate.modifiedCount !== 1) {
            res.status(500).json({ message: 'User profile update failed' });
            return;
        }

        res.status(200).json({ message: 'User profile updated' });

    } catch(err) {
        next(err);
    }
};

const deleteProfile = async (req, res, next) => {
    try {
        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'User profile deleted' });
    } catch(err) {
        next(err);
    }
};

module.exports = {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getAllProfiles,
    getProfile,
    updateProfile,
    deleteProfile
};
