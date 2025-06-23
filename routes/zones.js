const express = require('express');
const router = express.Router();
const db = require('../models');

// 모든 Zone 조회
router.get('/', async (req, res) => {
  try {
    console.log('Fetching zones...');
    const zones = await db.Zone.findAll({
      attributes: ['id', 'name', 'address', 'created_at'],
    });
    console.log('Zones fetched:', zones); // 데이터 확인
    if (zones.length === 0) {
      return res.status(404).json({ message: 'No zones found' });
    }
    res.status(200).json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error.stack); // 상세 에러
    res.status(500).json({ message: 'Failed to fetch zones', error: error.message });
  }
});

// 새로운 Zone 생성
router.post('/', async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Zone name is required' });
    }

    const newZone = await db.Zone.create({
      name,
      address,
      created_at: new Date(),
    });

    res.status(201).json({
      message: 'Zone created successfully',
      zone: newZone,
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ message: 'Failed to create zone' });
  }
});

module.exports = router;