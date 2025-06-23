const express = require('express');
const router = express.Router();

// GET /test - 간단한 테스트 API
router.get('/', (req, res) => {
  res.json({ message: '✅ Test API 작동 중' });
});

module.exports = router;
