const express = require('express');
const router = express.Router();
const customersController = require('../../controllers/customersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), customersController.getAllCustomers)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), customersController.createNewCustomer)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), customersController.updateCustomer)
    .delete(verifyRoles(ROLES_LIST.Admin), customersController.deleteCustomer)

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), customersController.getCustomer)

module.exports = router;