const Employee = require('../model/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const cookies = req.cookies;
    console.log(`cookies available at login: ${JSON.stringify(cookies)}`);
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required' });

    const foundEmployee = await Employee.findOne({ username: user }).exec();

    if (!foundEmployee) return res.sendStatus(401); // Unauthorized

    const match = await bcrypt.compare(pwd, foundEmployee.password);
    if (match) {
        const roles = Object.values(foundEmployee.roles).filter(Boolean);
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundEmployee.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1m' }
        );

        let newRefreshToken = jwt.sign(
            { "username": foundEmployee.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '5m' }
        );
        
        // if cookies.jwt doesn't exists (first login, cookies clear out) -> just assign foundEmployee.refreshToken to the array
        // if cookies.jwt exists, filter out old refreshToken what we gathered on auth of previous refresh request
        const newRefreshTokenArray =
            !cookies?.jwt
                ? foundEmployee.refreshToken
                : foundEmployee.refreshToken.filter(rt => rt !== cookies.jwt);
        
        // if cookies.jwt exists, find user by the cookie
        if (cookies?.jwt) {
            const refreshToken = cookies.jwt;
            const foundToken = await Employee.findOne({ refreshToken }).exec();

            // If token not found, refresh token reuse detected!
            if (!foundToken) {
                console.log('attempted refresh token reuse at login!');
                // clear out ALL previos refresh tokens
                newRefreshTokenArray = [];
            }

            // clear the existing jwt cookie
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        }

        // Saving refreshToken with current employee
        foundEmployee.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundEmployee.save();
        console.log('auth', result);

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', newRefreshToken, { httpsOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });

        // Send access token to user
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin }