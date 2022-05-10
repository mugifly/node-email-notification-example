async function registerNotification(email, notifiedAt) {
  const notifiedAtUTC = new Date(notifiedAt).toUTCString();

  const postBody = JSON.stringify({
    email: email,
    notifiedAt: notifiedAtUTC,
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
