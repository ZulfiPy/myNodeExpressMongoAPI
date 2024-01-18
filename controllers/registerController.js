const Employee = require('../model/Employee');
const bcrypt = require('bcrypt');

const handleNewEmployeeRegistration = async (req, res) => {
    const { username, password, firstname, lastname, roles  } = req.body;
    if ([username, password, firstname, lastname].some(item => !item)) {
        return res.status(400).json({ "message": "Some of data is missing!" });
    }
    // check for duplicate username in the db
    const duplicate = await Employee.findOne({ username }).exec();
    if (duplicate) return res.sendStatus(409); // Conflict

    try {
        // encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);
        // create and store the new user
        const result = await Employee.create({
            username,
            "password": hashedPwd,
            firstname,
            lastname,
            roles
        });
        res.status(201).json({ 'success': `User is created for employee ${firstname} ${lastname}` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewEmployeeRegistration }