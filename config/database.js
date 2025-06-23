const { Sequelize } = require('sequelize');
require('dotenv').config();  // .env 파일을 불러옵니다

// DB 연결
const sequelize = new Sequelize(
  process.env.DB_NAME,  // DB 이름
  process.env.DB_USER,  // DB 사용자명
  process.env.DB_PASSWORD,  // DB 비밀번호
  {
    host: process.env.DB_HOST,  // DB 호스트 (보통 localhost)
    dialect: 'mysql',  // MySQL 사용
    logging: false,  // 콘솔에 SQL 로그를 출력하지 않도록 설정
  }
);

module.exports = sequelize;
