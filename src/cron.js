const { Op } = require("sequelize");

// .env ファイルを読み込む
require("dotenv").config();

// データベース接続を初期化
const { sequelize, Notification } = require("./database");

// 非同期処理を実行
(async () => {
  // データベースの接続完了まで待機
  await sequelize.authenticate();

  // 送信されるべき通知を取得
  const notifications = await Notification.findAll({
    where: {
      // 未通知であること
      hasNotified: false,
      // 通知予定日時であるか、または既に過ぎていること
      notifiedAt: {
        [Op.lte]: Date.now(),
      },
    },
  });
  console.log(`Found ${notifications.length} notification items`);

  // 通知を反復
  for (let notification of notifications) {
    console.log(`Send notification to ID ${notification.id}`);

    // 通知済みとしてデータベースを上書き
    notification.hasNotified = true;
    await notification.save();
  }

  // 完了
  console.log("Done");
})();
