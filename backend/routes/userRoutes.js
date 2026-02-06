const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/search', searchUsers);

module.exports = router;