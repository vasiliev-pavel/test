<template>
  <div>
    <!-- Кнопка для установки приложения, видима только если есть событие установки -->
    <button v-if="installPrompt" @click="promptInstall" class="install-button">
      Установить как приложение
    </button>
  </div>
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
    const maxBlur = 10; // Максимальное значение блюра
    blurAmount.value = Math.min(scrolled / 100, maxBlur);

    // Рассчитываем уровень затемнения
    const maxDarken = 30; // Максимальное затемнение в процентах
    darkenAmount.value = Math.min(scrolled / 10, maxDarken);
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
  position: relative;
  width: 100%;
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
    0,
    0,
    0,
    calc(var(--darken-amount, 0))
  ); /* Используем переменную для затемнения */

  z-index: 1; /* Убедитесь, что z-index такой, чтобы он был поверх видео, но под контентом */
}

.background-image,
.background-video {
  position: fixed;
  top: 0;
  left: 0;

  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  background-size: cover;
  transition: 1s opacity;
  object-fit: cover; /* Обеспечивает заполнение всей доступной области */
}

.center-container {
  display: flex;
  justify-content: center;
  align-items: center; /* Центрирует содержимое по вертикали */
}

.squares-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Две колонки */
  gap: 5rem; /* Отступы между квадратами */
  justify-content: center; /* Центрирует квадраты по горизонтали */
  align-content: center; /* Добавлено для центрирования квадратов внутри контейнера, если он выше, чем нужно для одного ряда */
  z-index: 5;
}

.square {
  width: 100px; /* Ширина квадрата */
  height: 100px; /* Высота квадрата */
  background-color: #ddd; /* Цвет фона квадрата */
  display: flex;
  justify-content: center;
  align-items: center;
}
.install-button {
  position: fixed; /* Или любой другой способ позиционирования */
  z-index: 10; /* Убедитесь, что кнопка находится поверх других элементов */
  bottom: 20px; /* Расположение кнопки */
  right: 20px;
}
</style>
