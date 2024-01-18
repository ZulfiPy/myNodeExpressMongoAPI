const Customers = require('../model/Customer');

const getAllCustomers = async (req, res) => {
    const customers = await Customers.find();
    if (customers.length === 0) return res.status(200).json({ 'message': 'No customers found for further reading' });
    res.json(customers);
}

const createNewCustomer = async (req, res) => {
    const requiredFields = ['firstname', 'lastname', 'isikukood', 'driverLicenseNumber', 'address', 'email', 'phone'];
    
    for (let field of requiredFields) {
        if (!req?.body?.[field]) {
            return res.status(400).json({ 'message': `Missing required field ${field}` });
        }
    }

    const { firstname, lastname, driverLicenseNumber, address, email, phone } = req.body;

    try {
        const result  = await Customers.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            isikukood: req.body.isikukood,
            driverLicenseNumber: req.body.driverLicenseNumber,
            address: req.body.address,
            email: req.body.email,
            phone: req.body.phone
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
    }
}

const updateCustomer = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID required for further update' });

    const customer = await Customers.findOne({ _id: req.body.id }).exec();
    if (!customer) {
        return res.status(204).json({ 'message': `No customer found by id ${req.body.id} for further update` });
    }

    const fields = ['firstname', 'lastname', 'isikukood', 'driverLicenseNumber', 'address', 'email', 'phone'];
    for (let field of fields) {
        if (req.body?.[field]) {
            customer[field] = req.body[field]
        }
    }
    const result = await customer.save();
    
    res.json(result);
}

const deleteCustomer = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID required for further deletion' });

    const customer = await Customers.findOne({ _id: req.body.id }).exec();
    if (!customer) {
        return res.status(204).json({ 'message': `No customer bound by id ${req.body.id} for furthe deletion` });
    }

    const result = await Customers.deleteOne({ _id: req.body.id });

    res.json(result);
}

const getCustomer = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID required for further reading' });

    const customer = await Customers.findOne({ _id: req.body.id }).exec();
    if (!customer) {
        return res.status(204).json({ 'message': `No customer found by ID ${req.body.id} for furthe read` });
    }

    return res.json(customer);
}

module.exports = {
    getAllCustomers,
    createNewCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer
}