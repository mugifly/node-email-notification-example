import "dotenv/config";

import { LessThan } from "typeorm";
import { AppDataSource, NotificationRepository } from "./database";
import { createTransport } from "nodemailer";

class Cron {
  static async execute(): Promise<any> {
    if (!Cron.validateParameters()) {
      return process.exit(1);
    }

    // データベースの接続完了まで待機
    await AppDataSource.initialize();

    // メールを送信するためのインスタンスを初期化
    const mailTransporter = Cron.getMailTransporter();

    // 送信されるべき通知を取得
    const notifications = await NotificationRepository.find({
      where: {
        // 未通知であること
        hasNotified: false,
        // 通知予定日時であるか、または既に過ぎていること
        notifiedAt: LessThan(new Date()),
      },
    });
    console.log(`Found ${notifications.length} notification items`);

    // 通知を反復
    for (let notification of notifications) {
      console.log(
        `Sending notification to ID ${notification.id} (${notification.email})...`
      );

      // 通知メールを送信
      let sendMessageResult;
      try {
        sendMessageResult = await mailTransporter.sendMail({
          from: process.env["EMAIL_FROM"],
          to: notification.email,
          subject: "Notification",
          text: "メール通知のテストです。" + (notification.message || ""),
        });
        console.log(sendMessageResult);
      } catch (e: any) {
        console.error(
          "Could not send notification",
          e.toString(),
          sendMessageResult
        );
        continue;
      }

      if (
        sendMessageResult.rejected &&
        1 <= sendMessageResult.rejected.length
      ) {
        console.warn(`This address is rejected... ${notification.email}`);
      }

      // 通知済みとしてデータベースを上書き
      notification.hasNotified = true;
      await notification.save();

      break;
    }

    // 完了
    console.log("Done");
  }

  static getMailTransporter() {
    return createTransport({
      host: process.env["EMAIL_SMTP_HOST"],
      port: parseInt(process.env["EMAIL_SMTP_PORT"] || "587", 10),
      secure:
        process.env["EMAIL_SMTP_SECURE"] &&
        process.env["EMAIL_SMTP_SECURE"].match(/true/i)
          ? true
          : false,
      auth: {
        user: process.env["EMAIL_SMTP_USERNAME"],
        pass: process.env["EMAIL_SMTP_PASSWORD"],
      },
    });
  }

  static validateParameters() {
    const REQUIRED_VARIABLES = [
      "EMAIL_SMTP_HOST",
      "EMAIL_SMTP_PORT",
      "EMAIL_SMTP_USERNAME",
      "EMAIL_SMTP_PASSWORD",
      "EMAIL_FROM",
    ];

    let isValid = true;
    for (const varName of REQUIRED_VARIABLES) {
      if (
        process.env[varName] &&
        process.env[varName] != "(PLEASE FILL AFTER DEPLOYED)"
      ) {
        continue;
      }
      console.error(`環境変数 ${varName} が未設定です`);
      isValid = false;
    }

    return isValid;
  }
}

// 非同期処理を開始
(async () => {
  await Cron.execute();
})();
