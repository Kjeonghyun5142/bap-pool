// routes/zones.js

const express = require('express');
const router = express.Router();
const db = require('../models');

// ✅ 모든 Zone 조회: GET /api/zones
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/zones 요청 도착');
    const zones = await db.Zone.findAll({
      attributes: ['id', 'name', 'address', 'created_at'],
    });

    if (zones.length === 0) {
      return res.status(404).json({ message: 'No zones found' });
    }

    res.status(200).json(zones);
  } catch (error) {
    console.error('❌ Zone 조회 실패:', error.stack);
    res.status(500).json({ message: 'Failed to fetch zones', error: error.message });
  }
});

// ✅ 새로운 Zone 생성: POST /api/zones
router.post('/', async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Zone name is required' });
    }

    const newZone = await db.Zone.create({
      name,
      address,
      created_at: new Date(), // Sequelize에서 timestamps: false면 직접 넣어줘야 함
    });

    res.status(201).json({
      message: 'Zone created successfully',
      zone: newZone,
    });
  } catch (error) {
    console.error('❌ Zone 생성 실패:', error.stack);
    res.status(500).json({ message: 'Failed to create zone', error: error.message });
  }
});

module.exports = router;
