// bap-pool-backend/models/index.js

// .env 파일의 환경 변수는 app.js에서 로드하므로 여기서는 필요 없습니다.
const { Sequelize, DataTypes } = require('sequelize');

// Sequelize 초기화
// DB 연결 정보를 .env에서 가져옵니다.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql', // 환경 변수에 없으면 기본값 'mysql'
    logging: false, // 쿼리 로그를 보려면 true로 변경 (개발 시 유용)
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }, // DB 연결 풀 설정
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.DataTypes = DataTypes; // DataTypes를 db 객체에 추가하여 다른 모델에서 쉽게 접근

// 모든 모델 파일 불러오기 및 db 객체에 추가
db.User = require('./user')(sequelize, DataTypes);
db.Post = require('./post')(sequelize, DataTypes);
db.Participant = require('./participant')(sequelize, DataTypes);
db.Zone = require('./zone')(sequelize, DataTypes); // ⭐️ Zone 모델 추가 (주석 해제 확인) ⭐️
db.Comment = require('./comment')(sequelize, DataTypes); // ⭐️ Comment 모델 추가 ⭐️
db.ChatRoom = require('./chatRoom')(sequelize, DataTypes);
db.ChatMessage = require('./chatMessage')(sequelize, DataTypes);


// 모델 관계 설정 (associate 메서드 호출)
// ⭐️⭐️⭐️ 여기를 수정합니다! Sequelize.Model 인스턴스만 대상으로 루프를 돕니다. ⭐️⭐️⭐️
Object.keys(db).forEach((modelName) => {
  if (['sequelize', 'Sequelize', 'DataTypes'].includes(modelName)) return;
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// 기존에 명시적으로 정의했던 관계들은 각 모델의 associate 메서드 안으로 옮겨졌으므로 이 부분은 필요 없습니다.
// db.User.hasMany(db.Post, { foreignKey: 'writer_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// db.Post.belongsTo(db.User, { foreignKey: 'writer_id', as: 'Writer', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// db.User.hasMany(db.Participant, { foreignKey: 'user_id', as: 'Participations', onDelete: 'CASCADE' });
// db.Participant.belongsTo(db.User, { foreignKey: 'user_id', as: 'ParticipantUser', onDelete: 'CASCADE' });
// db.Post.hasMany(db.Participant, { foreignKey: 'post_id', as: 'Participants', onDelete: 'CASCADE' });
// db.Participant.belongsTo(db.Post, { foreignKey: 'post_id', as: 'ParticipatedPost', onDelete: 'CASCADE' });

// DB 연결 테스트
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ DB 연결 성공');
  })
  .catch((err) => {
    console.error('❌ DB 연결 실패:', err.stack);
  });

// sequelize.sync()는 app.js에서 관리합니다.

module.exports = db;
