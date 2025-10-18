<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogged = ref(!!localStorage.getItem('token'))
const notification = ref('')

function updateAuth() {
  isLogged.value = !!localStorage.getItem('token')
}

function setNotification(msg) {
  notification.value = msg
  if (msg) {
    setTimeout(() => { notification.value = '' }, 3500)
  }
}

// Listen for global notification events
function handleNotifyEvent(e) {
  if (e.detail && e.detail.message) setNotification(e.detail.message)
}

window.addEventListener('auth-changed', updateAuth)
window.addEventListener('notify', handleNotifyEvent)
onMounted(updateAuth)
onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', updateAuth)
  window.removeEventListener('notify', handleNotifyEvent)
})

async function logout() {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } })
    }
  } catch (err) {
    console.error('Logout error', err)
  }
  localStorage.removeItem('token')
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/login')
  setNotification('Logged out successfully')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <nav class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
        <router-link to="/" custom v-slot="{ navigate, href, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-lg font-semibold text-blue-600' : 'text-sm text-gray-800'">Products</a>
        </router-link>

        <router-link to="/order" custom v-slot="{ navigate, href, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-lg font-semibold text-blue-600' : 'text-sm text-gray-600'">Create Order</a>
        </router-link>

        <router-link to="/orders" custom v-slot="{ navigate, href, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-lg font-semibold text-blue-600' : 'text-sm text-gray-600'">Order History</a>
        </router-link>

        <div class="flex-1"></div>

        <div v-if="isLogged">
          <button @click="logout" class="text-sm text-red-600 cursor-pointer">Logout</button>
        </div>
        <div v-else>
          <router-link to="/login" custom v-slot="{ navigate, href, isActive }">
            <a :href="href" @click="navigate" :class="isActive ? 'text-sm text-blue-600 font-medium' : 'text-sm text-blue-600'">Login</a>
          </router-link>
        </div>
      </div>
    </nav>
    <div v-if="notification" class="max-w-4xl mx-auto mt-4 mb-2">
      <div class="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow text-center">
        {{ notification }}
      </div>
    </div>
    <main class="max-w-4xl mx-auto p-6">
      <router-view />
    </main>
  </div>
</template>

<style scoped></style>
