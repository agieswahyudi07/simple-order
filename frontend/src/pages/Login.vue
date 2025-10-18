<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Login</h2>
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="block text-sm text-gray-600">Email</label>
        <input v-model="email" placeholder="email" class="mt-1 block w-full border rounded p-2" />
      </div>
      <div>
        <label class="block text-sm text-gray-600">Password</label>
        <input v-model="password" type="password" placeholder="password" class="mt-1 block w-full border rounded p-2" />
      </div>
      <div>
        <button class="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      </div>
    </form>
    <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
  </div>
</template>

<script>
export default {
  data() { return { email: '', password: '', error: null } },
  methods: {
    async submit() {
      this.error = null
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || data.message || 'Login failed')
  localStorage.setItem('token', data.token)
  window.dispatchEvent(new Event('auth-changed'))
  this.$router.push('/')
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
