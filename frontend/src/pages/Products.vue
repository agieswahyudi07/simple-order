<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">Products</h2>
    </div>
    <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
    <ul class="grid grid-cols-1 gap-3">
      <li v-for="p in products" :key="p._id" class="p-4 bg-white shadow rounded flex justify-between">
        <div>
          <div class="font-medium">{{ p.name }}</div>
          <div class="text-sm text-gray-500">Rp {{ p.price }}</div>
        </div>
        <div class="text-sm text-gray-600">Stock: {{ p.stock }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() { return { products: [], loading: false } },
  async mounted() {
    this.loading = true
    const res = await fetch('/api/products')
    const data = await res.json()
    this.products = data.products || []
    this.loading = false
  }
}
</script>
