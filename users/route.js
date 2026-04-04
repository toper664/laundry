const router = require('express').Router();
const UserController = require('./controller');
const { check } = require('../etc/middleware/IsAuth');
const { has } = require('../etc/middleware/CheckPerm');

router.get('/', check, UserController.getUser);
router.get('/all', check, has('admin'), UserController.getAllUsers);

module.exports = router;