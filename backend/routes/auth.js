const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});


router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

module.exports = router;