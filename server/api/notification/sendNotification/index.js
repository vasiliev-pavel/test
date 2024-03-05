export default defineEventHandler(async (event) => {
  try {
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
    console.log("success");
    return { success: true };
  } catch (error) {
    console.error("Ошибка отправки уведомления", error);
    // Отправляем ошибку обратно на клиентскую часть
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500, // Используйте соответствующий HTTP статус код
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
