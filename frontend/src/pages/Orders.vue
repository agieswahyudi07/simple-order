<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">Orders</h2>
    </div>
    <div v-if="loading" class="text-sm text-gray-500">Loading...</div>
    <ul class="space-y-3">
      <li v-for="o in orders" :key="o._id" class="p-4 bg-white rounded shadow flex justify-between items-center">
        <div>
          <div class="font-medium">Product: {{ productName(o) }} (product id :{{ o.product_id }})</div>
          <div class="text-sm text-gray-500">qty: {{ o.quantity }} — total: Rp {{ o.total }}</div>
        </div>
        <div class="text-xs text-gray-400">{{ new Date(o.createdAt).toLocaleString() }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() { return { orders: [], loading: false, productsMap: {} } },
  methods: {
    productName(o) {
      const pid = o.product_id && (o.product_id.$oid || o.product_id.toString && o.product_id.toString() || o.product_id);
      return this.productsMap[pid] || pid || 'Unknown Product';
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Please login to view your orders.' } }))
      this.$router.push('/login')
      return
    }
    this.loading = true
    const [ordersRes, productsRes] = await Promise.all([
      fetch('/api/orders', { headers: { Authorization: 'Bearer ' + token } }),
      fetch('/api/products')
    ])
    const ordersData = await ordersRes.json()
    const productsData = await productsRes.json()
    this.orders = ordersData.orders || []
    const products = productsData.products || []
    const map = {}
    products.forEach(p => { map[p._id] = p.name })
    this.productsMap = map
    this.loading = false
  }
}
</script>
