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
  const serviceWorkerRegistration =
    await navigator.serviceWorker.getRegistration();
  if (!serviceWorkerRegistration)
    throw new Error("Service Worker registration not found");
  const activeSubscription =
    await serviceWorkerRegistration.pushManager.getSubscription();

  if (!activeSubscription) throw new Error("No active subscription found");

  console.log(activeSubscription);
  console.log(activeSubscription.getKey("p256dh"));
  console.log(activeSubscription.getKey("auth"));

  await $fetch("/api/notification/sendNotification", {
    method: "POST",
    body: {
      endpoint: activeSubscription.endpoint,
      expirationTime: activeSubscription.expirationTime,
      keys: {
        p256dh: activeSubscription.getKey("p256dh"),
        auth: activeSubscription.getKey("auth"),
      },
    },
  });
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
</script>

<style></style>
