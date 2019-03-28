const jwt = require('jsonwebtoken');

module.exports.verifyJwtToken = (req, res, next) => {
    var token;
    var newToken;
    console.log("token :" + JSON.stringify(req.headers));
    if (req.headers)
        // token = req.headers['authorization'].split(' ')[1];
        token = req.headers;
        console.log("token authorization :" + JSON.stringify(token));
        newToken = token.authtoken;
        console.log("token AuthToken :" + JSON.stringify(newToken));

    if (!newToken)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
        jwt.verify(newToken, process.env.JWT_SECRET,
            (err, decoded) => {
                console.log("newToken err :" + JSON.stringify(err));
                console.log("newToken decoded :" + JSON.stringify(decoded));

                if (err)
                    return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
                else {
                    req._id = decoded._id;
                    next();
                }
            }
        )
    }
}