const jwt = require('jsonwebtoken');

const User = require('../mongo/model/User');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization;
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

        req.userId = decodedToken.userId;
        req.userRole = decodedToken.role;
        next();
        
    } catch(err) {
        console.log(`${typeof(err)} - ${err.stack}`);
        
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

const isSysAdmin = async (req, res, next) => {
    const token = req.headers.authorization;
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

const isSysMgr = async (req, res, next) => {
    const token = req.headers.authorization;
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

const isExternal = async (req, res, next) => {
    const token = req.headers.authorization;
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

const isExternalOrSysMgr = async (req, res, next) => {
    const token = req.headers.authorization;
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

module.exports = { authenticate, isSysAdmin, isSysMgr, isExternal, isExternalOrSysMgr };
