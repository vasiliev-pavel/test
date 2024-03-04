import webpush from "web-push";

const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT,
};

webpush.setVapidDetails(
  "mailto:vasilievpavel795@gmail.com",
  vapidDetails.publicKey,
  vapidDetails.privateKey
);

export default defineEventHandler(async (event) => {
  try {
    const tempData = await readBody(event);
    const pushSubscription = JSON.parse(tempData);

    const notification = JSON.stringify({
      title: "Hello, Notifications123!",
      options: {
        body: `ID: ${Math.floor(Math.random() * 100)}`,
      },
    });
    const options = {
      TTL: 10000,
      vapidDetails: vapidDetails,
    };
    // Отправка уведомления
    await webpush.sendNotification(pushSubscription, notification, options);
    // console.log(subscription);
    console.log("success");
    return { success: true };
  } catch (error) {
    console.error(error.error);
    return { success: false, error: error };
  }
});
