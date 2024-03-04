const jwt = require('jsonwebtoken');

const User = require('../mongo/model/User');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userInDb = await User.findById({
            _id: decodedToken.userId
        }, {
            password: 0,
            sessions: 0
        });

        if (!userInDb) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.token = token;
        req.user = userInDb;
        next();
        
    } catch (err) {
        res.status(401).json(err);
    }
};

const isSysAdmin = async (req, res, next) => {
    if(!req.token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    if(req.user.role !== 'system_admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
};

const isSysMgr = async (req, res, next) => {
    if(!req.token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    if(req.user.role !== 'system_manager') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
};

const isExternal = async (req, res, next) => {
    if(!req.token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    if(req.user.role !== 'customer' || req.user.role !== 'merchant') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
};

const isExternalOrSysMgr = async (req, res, next) => {
    if(!req.token) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const allowedRoles = ['customer', 'merchant', 'system_manager'];
    if(!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
};

module.exports = { authenticate, isSysAdmin, isSysMgr, isExternal, isExternalOrSysMgr };
