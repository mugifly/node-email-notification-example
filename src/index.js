const express = require("express");
const bodyParser = require("body-parser");

// .env ファイルを読み込む
require("dotenv").config();

// データベース接続を初期化
const { UniqueConstraintError } = require("sequelize");
const { sequelize, Notification } = require("./database");

// サーバを初期化
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ルートを定義 - GET /
app.get("/", async (req, res) => {
  res.send("notification-test");
});

// ルートを定義 - GET /notifications
app.get("/notifications", async (req, res) => {
  if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
    return res.status(403);
  }

  const notifications = await Notification.findAll();
  res.send(notifications);
});

// ルートを定義 - PpubliOST /notifications
app.post("/notifications", async (req, res) => {
  if (!req.body || !req.body.email || !req.body.notifiedAt) {
    return res.status(400).send("入力内容が正しくありません");
  } else if (
    !req.body.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )
  ) {
    return res.status(400).send("メールアドレスの形式が正しくありません");
  }

  try {
    await Notification.create({
      email: req.body.email,
      notifiedAt: req.body.notifiedAt,
      message: req.body.message,
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      // 重複登録ならば、エラーを返すs
      return res.status(400).send("すでに登録済みです");
    }

    // その他のエラーならば、そのままエラーメッセージを返す
    return res.status(400).send(e.toString());
  }
  res.send("登録完了しました");
});

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
