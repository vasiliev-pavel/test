<template>
  <div>
    <button
      @click="requestNotificationPermission"
      class="w-full bg-green-500 text-white p-3 rounded-lg font-semibold text-lg block text-center"
    >
      Enable Notifications
    </button>
    <button
      @click="sendUserNotification"
      class="w-full bg-blue-200 text-white p-3 rounded-lg font-semibold text-lg block text-center"
    >
      send notification
    </button>
  </div>
</template>

<script setup>
import { urlB64ToUint8Array } from "~/composables/urlB64ToUint8Array";

const VAPID_PUBLIC_KEY =
  "BCGjvnQfPvGlT3-0GD_-VG7nANjo71PanCieb7HjztBhhMM2d8P7GCjSmaoHJTSEAdH1NCEvIvB1zt_C4OxuFEA";
const notificationPermission = ref("default"); // Инициализируем с 'default' или другим подходящим значением
const deviceInfo = ref({});
let subscription;
watchEffect(async () => {
  //   if (user.value) {
  //     if (data.value) {
  //       businessStore.setBusiness(data.value);
  //     }
  //   }
  if (notificationPermission.value === "granted") {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const serviceWorkerRegistration =
          await navigator.serviceWorker.register("./sw.js");
        console.info(
          "Service worker was registered.",
          serviceWorkerRegistration
        );
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          console.error("Service Worker registration not found.");
          return;
        }
        const subscribed = await registration.pushManager.getSubscription();
        if (subscribed) {
          console.info("User is already subscribed.");
        } else {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          console.log("Subscription:", subscription);
        }
      } catch (error) {
        console.error("Error during service worker registration:", error);
      }
    } else {
      console.error(
        "Browser does not support service workers or push messages."
      );
    }
  }
});

const sendUserNotification = async () => {
  try {
    const serviceWorkerRegistration =
      await navigator.serviceWorker.getRegistration();
    if (!serviceWorkerRegistration)
      throw new Error("Service Worker registration not found");

    const activeSubscription =
      await serviceWorkerRegistration.pushManager.getSubscription();
    if (!activeSubscription) throw new Error("No active subscription found");

    const p256dh = arrayBufferToBase64(activeSubscription.getKey("p256dh"));
    const auth = arrayBufferToBase64(activeSubscription.getKey("auth"));
    const notificationPayload = JSON.stringify({
      endpoint: activeSubscription.endpoint,
      keys: {
        p256dh: p256dh,
        auth: auth,
      },
    });

    const response = await $fetch("/api/notification/sendNotification", {
      method: "POST",
      body: notificationPayload,
    });

    if (!response.success) {
      // Обработка случая, когда сервер вернул ошибку
      console.error("Error sending notification:", response.error);
      alert("Error sending notification. Please try again.");
    } else {
      // Уведомление успешно отправлено
      console.log("Notification sent successfully.");
      alert("Notification sent successfully!");
    }
  } catch (error) {
    // Обработка ошибок, например, ошибок сети или JSON-парсинга
    console.error("Error sending notification:", error);
    alert(
      "Failed to send notification. Please check your connection and try again."
    );
  }
};

const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
    return;
  }
  try {
    const result = await Notification.requestPermission();
    notificationPermission.value = result;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
};

function arrayBufferToBase64(buffer) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
</script>

<style></style>
