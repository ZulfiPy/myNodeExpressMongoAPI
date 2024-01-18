const Employee = require('../model/Employee');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log('cookies', cookies);
    // if no jwt cookie found in cookies
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    // clear cookies for further cookie storage
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const foundEmployee = await Employee.findOne({ refreshToken }).exec();

    // user not found + token verification
    // if user not found with refreshToken what we got from cookies
    // it indicates potential miuse or an expired token
    if (!foundEmployee) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); // Forbidden
                // security measure!
                // find hacked employee
                // clear out his tokens array and save
                // force logout on all devices
                const hackedEmployee = await Employee.findOne({ username: decoded.username }).exec();
                hackedEmployee.refreshToken = [];
                const result = await hackedEmployee.save();
                console.log(result);
            }
        )
        return res.sendStatus(403); // Forbidden
    };

    // deleting from array old refresh token what was received at auth or previos refresh request
    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

    // user found + token verification
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            // check if token expired or invalid and update record without old refresh token
            if (err) {
                console.log('expired refresh token');
                foundEmployee.refreshToken = [...newRefreshTokenArray];
                const result = await foundEmployee.save();
                console.log(result);
            }
            // check if token belongs to the correct user
            if (err || foundEmployee.username !== decoded.username) return res.sendStatus(403);

            // Refresh token is still valid and belongs to the correct user
            const roles = Object.values(foundEmployee.roles);

            // generate new access token
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1m' }
            );

            // generate new refresh token
            const newRefreshToken = jwt.sign(
                { "username": decoded.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '5m' }
            );
                
            // storing and saving new refresh token
            foundEmployee.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundEmployee.save();
            console.log('refresh', result);

            // setting the new refresh token in a cookie
            res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24*60*60*1000 });
            
            // sending a new access token as request
            res.json({ accessToken });
        }
    )
}

module.exports = { handleRefreshToken }