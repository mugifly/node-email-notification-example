const { Sequelize, DataTypes } = require("sequelize");

// データベース接続の初期化
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: !process.env.NODE_ENV || process.env.NODE_ENV != "production",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

// Notification テーブルの定義
const Notification = sequelize.define(
  "Notification",
  {
    // メールアドレス
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 通知済みか否かのフラグ
    hasNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // 通知日時
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // メッセージ (任意)
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // IPアドレス
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    indexes: [
      // 同じメールアドレスと通知日時で重複登録できないようにするためのインデックス
      {
        unique: true,
        fields: ["email", "notifiedAt"],
      },
    ],
  }
);

// データベース接続とモデルを返す
module.exports = {
  sequelize,
  Notification,
};
