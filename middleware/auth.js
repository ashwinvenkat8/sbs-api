const jwt = require('jsonwebtoken');

const User = require('../mongo/model/User');
const Review = require('../mongo/model/Review');

const authenticate = async (req, res, next) => {
    const token = req.headers?.authorization;
    if (!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userInDb = await User.exists({ _id: decodedToken.userId });
        
        if (!userInDb) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if(['CUSTOMER', 'MERCHANT'].includes(userInDb.role)) {
            req.accountId = decodedToken.accountId;
        }

        req.userId = decodedToken.userId;
        req.userRole = decodedToken.role;
        next();
        
    } catch(err) {
        console.log("authenticate() @ middleware/auth.js");
        
        if(err.name === 'TokenExpiredError') {
            const activeSession = await User.findOne(
                { sessions: { $elemMatch: { token: token }}},
                { 'sessions.$': 1 }
            );
            if (activeSession) {
                activeSession.sessionId = null;
                activeSession.token = null;
                
                const filter = { _id: activeSession._id };
                const update = { $pull: { sessions: { token: token }}};
                
                try {
                    await User.updateOne(filter, update);
                    console.log(`Expired token removed from sessions for user ${activeSession._id}`);

                } catch(err) {
                    next(err);
                }
            }
            
            res.status(401).json({ message: 'Session expired' });
            return;
        }
        
        res.status(401).json(err);
    }
};

const isEmployee = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole !== 'EMPLOYEE' ) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isSysAdmin = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole !== 'SYSTEM_ADMIN') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isNotSysAdmin = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole === 'SYSTEM_ADMIN') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isSysMgr = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole !== 'SYSTEM_MANAGER') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isCustomer = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole !== 'CUSTOMER') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isMerchant = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole !== 'MERCHANT') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isExternal = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    if(req.userRole !== 'CUSTOMER' && req.userRole !== 'MERCHANT') {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isInternal = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    const allowedRoles = ['EMPLOYEE', 'SYSTEM_MANAGER', 'SYSTEM_ADMIN'];
    if(!allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isCustomerOrEmployee = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    const allowedRoles = ['CUSTOMER', 'EMPLOYEE'];
    if(!allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isMerchantOrEmployee = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    const allowedRoles = ['MERCHANT', 'EMPLOYEE'];
    if(!allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isExternalOrEmployee = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    const allowedRoles = ['CUSTOMER', 'MERCHANT', 'EMPLOYEE'];
    if(!allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isExternalOrSysMgr = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    const allowedRoles = ['CUSTOMER', 'MERCHANT', 'SYSTEM_MANAGER'];
    if(!allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isSysAdminOrSysMgr = async (req, res, next) => {
    const token = req.headers?.authorization;
    if(!token) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }

    const allowedRoles = ['SYSTEM_ADMIN', 'SYSTEM_MANAGER'];
    if(!allowedRoles.includes(req.userRole)) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    
    next();
};

const isReviewApproved = async (req, res, next) => {
    const reviewId = req.headers['x-review-id'];
    
    if(!reviewId) {
        res.status(400).json({ message: 'Active review required to access this resource' });
        return;
    }

    try {
        const review = await Review.findById(reviewId);
        if(!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        if(review.status !== 'APPROVED') {
            res.status(403).json({ message: 'Review not approved' });
            return;
        }

        if (review.type === 'HIGH VALUE TXN') {
            req.reviewee = review.reviewObject;
        }
        
        next();
    
    } catch(err) {
        console.log("isReviewApproved() @ middleware/auth.js");
        next(err);
    }
};

module.exports = {
    authenticate,
    isEmployee,
    isSysAdmin,
    isNotSysAdmin,
    isSysMgr,
    isCustomer,
    isMerchant,
    isExternal,
    isInternal,
    isCustomerOrEmployee,
    isMerchantOrEmployee,
    isExternalOrEmployee,
    isExternalOrSysMgr,
    isSysAdminOrSysMgr,
    isReviewApproved
};
