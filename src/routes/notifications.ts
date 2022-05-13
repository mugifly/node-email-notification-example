import { Router } from "express";
import fetch from "node-fetch";
import { NotificationRepository } from "../database";

const notificationsRouter = Router();

/**
 * GET /notifications
 */
notificationsRouter.get("/", async (req, res): Promise<any> => {
  if (process.env["NODE_ENV"] && process.env["NODE_ENV"] === "production") {
    // 本番環境では空配列を返す
    return res.status(403).send([]);
  }

  // 全ての通知を返す
  const notifications = await NotificationRepository.find();
  res.send(notifications);
});

/**
 * POST /notifications
 */
notificationsRouter.post("/", async (req, res): Promise<any> => {
  // 送信された内容を検証
  if (!req.body || !req.body.email || !req.body.notifiedAt) {
    return res.status(400).send("入力内容が正しくありません");
  } else if (
    !req.body.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )
  ) {
    return res.status(400).send("メールアドレスの形式が正しくありません");
  }

  // reCAPTCHA v2 認証の正当性を検証
  if (process.env["NODE_ENV"] && process.env["NODE_ENV"] === "production") {
    if (!req.body.reCaptchaResponseToken) {
      return res.status(400).send("reCAPTCHA v2 認証が行われていません");
    } else if (
      !process.env["RECAPTCHA_SITE_KEY"] ||
      !process.env["RECAPTCHA_SECRET_KEY"]
    ) {
      return res
        .status(500)
        .send(
          "環境変数に RECAPTCHA_SITE_KEY または RECAPTCHA_SECRET_KEY が登録されていません"
        );
    }

    const verifyResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env["RECAPTCHA_SECRET_KEY"]}&response=${req.body.reCaptchaResponseToken}`
    );

    const verifyResult: any = await verifyResponse.json();
    if (!verifyResult.success) {
      // 認証失敗ならば、エラーを返す
      console.log("reCaptcha Failed", verifyResult);
      return res
        .status(400)
        .send("reCAPTCHA v2 認証に失敗しました。もう一度お試しください。");
    }
  }

  // 通知をデータベースへ登録
  try {
    await NotificationRepository.save({
      email: req.body.email,
      notifiedAt: new Date(req.body.notifiedAt),
      message: req.body.message,
      ipAddress:
        req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress,
    });
  } catch (e: any) {
    /*if (e instanceof UniqueConstraintError) {
      // 重複登録ならば、エラーを返す
      return res.status(400).send("すでに登録済みです");
    }*/

    // その他のエラーならば、そのままエラーメッセージを返す
    return res.status(400).send(e.toString());
  }
  res.send("登録完了しました");
});

export default notificationsRouter;
