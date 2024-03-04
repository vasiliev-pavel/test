import webpush from "web-push";

const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: "mailto:vasilievpavel795@gmail.com",
};

webpush.setVapidDetails(
  vapidDetails.subject,
  vapidDetails.publicKey,
  vapidDetails.privateKey
);

export default defineEventHandler(async (event) => {
  try {
    const pushSubscription = JSON.parse(YOUR_PUSH_SUBSCRIPTION_STRING);
    console.log(pushSubscription);
    const tempData = await readBody(event);
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
    await webpush.sendNotification(tempData, notification, options);
    // console.log(subscription);
    console.log("success");
    return { success: true };
  } catch (error) {
    console.error(error.error);
    return { success: false, error: error };
  }
});
