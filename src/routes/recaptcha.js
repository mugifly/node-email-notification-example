/**
 * GET /recaptcha/siteKey
 */
exports.getSiteKey = async (req, res) => {
  res.send({
    reCaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  });
};
