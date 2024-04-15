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

        res.status(200).json(accounts.toJSON());

    } catch(err) {
        console.log("getAllAccounts() @ controllers/user.js");
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

        res.status(200).json(account.toJSON());

    } catch(err) {
        console.log("getAccount() @ controllers/user.js");
        next(err);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        await Account.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Account deleted' });
    } catch(err) {
        console.log("deleteAccount() @ controllers/user.js");
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
        console.log("getAllProfiles() @ controllers/user.js");
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
        console.log("getProfile() @ controllers/user.js");
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
        delete req.body.username;
        delete req.body.password;
        delete req.body.otp;
        delete req.body.role;
        delete req.body.attributes.ssn;
        delete req.body.attributes.date_of_birth;
        delete req.body.sessions;
        delete req.body.last_login;
        delete req.body.login_failed;
        delete req.body.is_locked;
        delete req.body.is_inactive;

        const updatedProfile = {
            attributes: userInDb.attributes
        };
        const validatedUserData = await User.validate(req.body);

        for (const [key, value] of Object.entries(validatedUserData.attributes)) {
            if(value) {
                updatedProfile.attributes[key] = value;
            }
        }

        const userUpdate = await User.updateOne({ _id: req.params.id }, updatedProfile);

        if(!userUpdate.acknowledged || userUpdate.modifiedCount !== 1) {
            res.status(500).json({ message: 'User profile update failed' });
            return;
        }

        res.status(200).json({ message: 'User profile updated' });

    } catch(err) {
        console.log("updateProfile() @ controllers/user.js");
        next(err);
    }
};

const deleteProfile = async (req, res, next) => {
    try {
        await User.updateOne({ _id: req.params.id }, { is_inactive: true });
        res.status(200).json({ message: 'User profile deleted' });
    } catch(err) {
        console.log("deleteProfile() @ controllers/user.js");
        next(err);
    }
};

const getMerchants = async (req, res, next) => {
    try {
        const merchants = await User.find({ role: 'MERCHANT' }, { 'attributes.business_name': 1, 'attributes.payment_id': 1 });
        
        if(merchants.length === 0) {
            res.status(404).json({ message: 'No merchants found' });
            return;
        }

        res.status(200).json(merchants);

    } catch(err) {
        console.log("getMerchants() @ controllers/user.js");
        next(err);
    }
}

const getPaymentId = async (req, res, next) => {
    try {
        const paymentId = await User.findById(req.params.id, { 'attributes.payment_id': 1 });

        if(!paymentId) {
            res.status(404).json({ message: 'Merchant not found' });
            return;
        }

        res.status(200).json({ message: paymentId });

    } catch(err) {
        console.log("getPaymentId() @ controllers/user.js");
        next(err);
    }
}

module.exports = {
    getAllAccounts,
    getAccount,
    deleteAccount,
    getAllProfiles,
    getProfile,
    updateProfile,
    deleteProfile,
    getMerchants,
    getPaymentId
};
