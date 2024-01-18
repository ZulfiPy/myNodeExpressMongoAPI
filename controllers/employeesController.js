const Employees = require('../model/Employee');

const getAllEmployees = async (req, res) => {
    const employees = await Employees.find();
    if (employees.length === 0) return res.status(204).json({ 'message': 'No employees found for further reading' });
    return res.json(employees);
};

const deleteEmployee = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Employee id required for further deletion' });
    const employee = await Employees.findOne({ _id: req.body.id }).exec();
    if (!employee) {
        return res.status(204).json({ 'message': 'No empoloyee found for further delition' })
    }
    const result = await Employees.deleteOne({ _id: req.body.id });
    res.json(result);
};

const getEmployee = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'Employee id required for read' });
    const employee = await Employees.findOne({ _id: req.body.id });
    if (!employee) {
        return res.status(204).json({ 'message': 'No employee found for further reading' });
    }
    return res.json(employee);
};

module.exports = {
    getAllEmployees,
    deleteEmployee,
    getEmployee
}