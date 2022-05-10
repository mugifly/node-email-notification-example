let reCaptchaResponseToken = "";

async function registerNotification(event, email, notifiedAt) {
  if (!reCaptchaResponseToken) {
    window.alert("reCAPTCHA 認証を行なってください");
    return;
  }

  const notifiedAtUTC = new Date(notifiedAt).toUTCString();

  const postBody = JSON.stringify({
    email: email,
    notifiedAt: notifiedAtUTC,
    reCaptchaResponseToken: reCaptchaResponseToken,
  });

  const request = await fetch("/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: postBody,
  });

  if (!request.ok) {
    window.alert(`Error: ${await request.text()}`);
    return;
  }

  window.alert(await request.text());
}

window.addEventListener("load", async () => {
  const recaptchaSiteKeyResponse = await fetch("/recaptchaSiteKey");
  if (!recaptchaSiteKeyResponse.ok) {
    return;
  }

  const recaptchaSiteKeyResult = await recaptchaSiteKeyResponse.json();

  GoogleReCaptcha.init({
    siteKey: recaptchaSiteKeyResult.reCaptchaSiteKey,
    callback: (responseToken) => {
      console.log("reCAPTCHA 認証が実行されました: ", responseToken);
      reCaptchaResponseToken = responseToken;
      document.querySelector("#recaptchaCheckbox").checked = true;
    },
  });
});
