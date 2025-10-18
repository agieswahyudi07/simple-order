<template>
  <div class="bg-white p-6 rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Create Order</h2>
    <div v-if="error" class="text-red-600 mb-2">{{ error }}</div>
    <div v-if="success" class="text-green-600 mb-2">{{ success }}</div>

    <div class="mb-4">
      <label class="block text-sm text-gray-700">Product</label>
      <select v-model="product_id" class="mt-1 block w-full border rounded p-2">
        <option v-for="p in products" :value="p._id">{{ p.name }} — Rp {{ p.price }} — stock: {{ p.stock }}</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-sm text-gray-700">Quantity</label>
      <input type="number" v-model.number="quantity" min="1" class="mt-1 block w-32 border rounded p-2" />
    </div>

    <div>
      <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Save Order</button>
    </div>
  </div>
</template>

<script>
export default {
  data() { return { products: [], product_id: '', quantity: 1, error: null, success: null } },
  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Please login to create an order.' } }))
      this.$router.push('/login')
      return
    }
    const res = await fetch('/api/products')
    const data = await res.json()
    this.products = data.products || []
    if (this.products.length) this.product_id = this.products[0]._id
  },
  methods: {
    async submit() {
      this.error = null; this.success = null
      const product = this.products.find(p => p._id === this.product_id)
      if (!product) return this.error = 'Select product'
      if (this.quantity < 1) return this.error = 'Quantity must be at least 1'
      if (this.quantity > product.stock) return this.error = 'Insufficient stock'

      const total = product.price * this.quantity
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
          body: JSON.stringify({ product_id: this.product_id, quantity: this.quantity, total })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || data.message || 'Failed')
        this.success = 'Order created'
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
