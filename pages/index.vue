<template>
  <!-- Кнопка для установки приложения, видима только если есть событие установки -->
  <button v-if="installPrompt" @click="promptInstall" class="install-button">
    Установить как приложение
  </button>

  <section>
    <div class="video-container" :style="containerStyle">
      <img
        v-show="!videoLoaded"
        src="/coffee.png"
        alt="Placeholder"
        class="background-image"
      />
      <video
        autoplay
        muted
        loop
        playsinline
        class="background-video"
        @canplaythrough="handleVideoLoad"
        :style="videoStyle"
      >
        <source src="/live.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео тег.
      </video>
    </div>
    <div class="center-container">
      <div class="squares-container">
        <div class="square" v-for="n in 20" :key="n"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
useHead({
  title: "Booking",
  display: "standalone",

  meta: [
    {
      name: "mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
  ],
});
const { $pwa } = useNuxtApp();

const installPrompt = ref(null);

const setupEventListeners = () => {
  const beforeInstallPromptHandler = (e) => {
    // Предотвратить автоматическое отображение диалога
    e.preventDefault();
    // Сохранить событие, чтобы можно было запустить его позже
    installPrompt.value = e;
  };

  window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

  onUnmounted(() => {
    window.removeEventListener(
      "beforeinstallprompt",
      beforeInstallPromptHandler
    );
  });
};
onMounted(() => {
  if ($pwa.offlineReady) console.log("App ready to work offline", $pwa);
  setupEventListeners();
});

const promptInstall = () => {
  if (installPrompt.value) {
    // Показать диалог установки
    installPrompt.value.prompt();
    // Определить, принял ли пользователь предложение об установке
    installPrompt.value.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Пользователь принял предложение об установке");
      } else {
        console.log("Пользователь отклонил предложение об установке");
      }
      installPrompt.value = null; // Очистить сохранённое событие после выбора
    });
  }
};

const goFullScreen = () => {
  // Проверяем, поддерживает ли браузер API полноэкранного режима
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    // Для Safari
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    // Для IE11
    document.documentElement.msRequestFullscreen();
  }
};
const videoLoaded = ref(false);
const blurAmount = ref(0);
const darkenAmount = ref(0);

const containerStyle = computed(() => ({
  // Добавляем затемнение к стилю контейнера, чтобы использовать его в псевдоэлементе
  "--darken-amount": `${darkenAmount.value / 100}`, // Преобразуем в долю для использования в RGBA
}));

const videoStyle = computed(() => ({
  filter: `blur(${blurAmount.value}px)`,
}));

const handleVideoLoad = () => {
  videoLoaded.value = true;
};

const handleScroll = () => {
  requestAnimationFrame(() => {
    const scrolled = window.scrollY;
    const windowHeight = window.innerHeight; // Получаем высоту окна браузера
    const threshold = windowHeight * 0.5; // Устанавливаем порог в 50% высоты окна

    // Используем порог для расчёта процентов
    const scrollPercentage = Math.min(scrolled / threshold, 1); // Гарантируем, что значение не превысит 1

    const maxBlur = 20; // Максимальное значение блюра
    const maxDarken = 0.2; // Максимальное затемнение в долях (20%)

    // Применяем процент прокрутки для расчёта значений
    blurAmount.value = maxBlur * scrollPercentage;
    darkenAmount.value = maxDarken * scrollPercentage * 100; // Умножаем на 100, потому что --darken-amount ожидает проценты
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style>
.buttonn {
  position: relative;
  z-index: 7;
}
section {
  height: 100dvh; /* Высота на весь экран */
  transition: height 0.2s linear;
}

.video-container {
  display: flex; /* Используем Flexbox для центрирования содержимого */
  justify-content: center; /* Центрируем содержимое по горизонтали */
  align-items: center; /* Центрируем содержимое по вертикали */
  position: relative;
  width: 100%; /* Убедитесь, что контейнер занимает всю ширину */
  height: 100vh; /* Высота на весь экран */
  overflow: hidden;
}
.video-container::after {
  content: "";
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  background: rgba(
    255,
    255,
    255,
    calc(var(--darken-amount, 0))
  ); /* Изменено на белый с использованием переменной для альфа-канала */

  z-index: 1; /* Убедитесь, что z-index такой, чтобы он был поверх видео, но под контентом */
}

.background-image,
.background-video {
  position: fixed; /* Изменяем на absolute для корректного позиционирования */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Центрирование относительно точки */
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  background-size: cover;
  transition: 1s opacity;
  object-fit: cover; /* Заполняет контейнер, сохраняя пропорции */
  object-position: center; /* Центрирует содержимое в контейнере */
}
.center-container {
  display: flex;
  justify-content: center;
  align-items: center; /* Центрирует содержимое по вертикали */
}

.squares-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Две колонки */
  gap: 2.5rem; /* Отступы между квадратами */
  justify-content: center; /* Центрирует квадраты по горизонтали */
  align-content: center; /* Добавлено для центрирования квадратов внутри контейнера, если он выше, чем нужно для одного ряда */
  z-index: 5;
}

.square {
  padding: 8rem 5rem;
  border-radius: 1.7rem;
  background-color: #fafafa; /* Цвет фона квадрата */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Медиазапрос для экранов меньше 768px */
@media (max-width: 768px) {
  .squares-container {
    gap: 1.5rem; /* Уменьшаем отступ между квадратами */
  }
}

/* Медиазапрос для экранов меньше 480px */
@media (max-width: 428px) {
  .squares-container {
    gap: 2rem; /* Еще больше уменьшаем отступ между квадратами */
  }
}

@media (max-width: 378px) {
  .squares-container {
    gap: 1.3rem; /* Еще больше уменьшаем отступ между квадратами */
  }
  .square {
    padding: 7rem 5rem;
  }
}

/* Медиазапрос для экранов меньше  320px */
@media (max-width: 320px) {
  .squares-container {
    gap: 1rem; /* Еще больше уменьшаем отступ между квадратами */
  }
  .square {
    padding: 6rem 4rem;
  }
}
.install-button {
  position: fixed; /* Или любой другой способ позиционирования */
  z-index: 10; /* Убедитесь, что кнопка находится поверх других элементов */
  bottom: 20px; /* Расположение кнопки */
  right: 20px;
}
</style>
