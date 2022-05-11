const express = require("express");
const bodyParser = require("body-parser");

// .env ファイルを読み込む
require("dotenv").config();

// データベース接続を初期化
const { sequelize } = require("./database");

// サーバを初期化
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ルートを定義
app.get("/notifications", require("./routes/notifications").getNotifications);
app.post("/notifications", require("./routes/notifications").postNotifications);
app.get("/recaptcha/siteKey", require("./routes/recaptcha").getSiteKey);

// 非同期処理を実行
(async () => {
  // データベースの接続完了まで待機
  await sequelize.authenticate();

  // テーブルを生成
  await sequelize.sync({
    alter: true,
  });

  // サーバを開始
  const server = app.listen(process.env.PORT || 3000, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("App listening on port %s:%s", host, port);
    console.log(`Database: ${process.env.DATABASE_URL}`);
  });
})();
