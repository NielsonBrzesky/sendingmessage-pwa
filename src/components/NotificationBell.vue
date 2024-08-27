<script setup lang="ts">
import { ref, onMounted } from 'vue';

const notifications = ref<Array<{ id: string; message: string }>>([]);
const showNotifications = ref(false);
const unreadCount = ref(0);

onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {


      console.log("Recebendo evento SW de dentro do NOtificationBell.vue ===>", event.data)
      if (event.data.type === 'PUSH_NOTIFICATION') {
        notifications.value.push(event.data.data);
        unreadCount.value++;
      }
    });
  }
});

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};
</script>

<template>
  <div class="notification-bell">
    <button @click="toggleNotifications">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path
          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.5-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.5 6 8.07 6 11.5v5l-2 2v1h16v-1l-2-2zM12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
      <span v-if="unreadCount > 0" class="notification-count">{{ unreadCount }}</span>
    </button>
    <div v-if="showNotifications" class="notifications">
      <ul>
        <li v-for="notification in notifications" :key="notification.id">
          {{ notification.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {

  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
