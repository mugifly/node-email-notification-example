import * as express from "express";
import * as bodyParser from "body-parser";
import { AddressInfo } from "node:net";

// .env ファイルを読み込む
import "dotenv/config";

// データベース接続を初期化
import { AppDataSource } from "./database";

// サーバを初期化
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ルートを定義
import notificationsRouter from "./routes/notifications";
app.use("/notifications", notificationsRouter);
import recaptchaRouter from "./routes/recaptcha";
app.use("/recaptcha", recaptchaRouter);

// 非同期処理を実行
(async () => {
  // データベースの接続完了まで待機
  await AppDataSource.initialize();

  // サーバを開始
  const server = app.listen(process.env["PORT"] || 3000, () => {
    const addressInfo = server.address() as AddressInfo;
    const host = addressInfo.address;
    const port = addressInfo.port;
    console.log("App listening on port %s:%s", host, port);
    //console.log(`Database: ${process.env.DATABASE_URL}`);
  });
})();
