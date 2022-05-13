import { Request, Response, Router } from "express";

const recaptchaRouter = Router();

/**
 * GET /recaptcha/siteKey
 */
recaptchaRouter.get(
  "/siteKey",
  async (req: Request, res: Response): Promise<any> => {
    res.send({
      reCaptchaSiteKey: process.env["RECAPTCHA_SITE_KEY"],
    });
  }
);

export default recaptchaRouter;
