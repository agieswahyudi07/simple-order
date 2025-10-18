const { getDB } = require('../database/database');
const { ObjectId } = require('mongodb');

exports.index = async (req, res) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders').find().toArray();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.store = async (req, res) => {
  try {
    const db = getDB();
    const { product_id, quantity, total } = req.body;
    if (!product_id || !quantity || !total) return res.status(400).json({ message: 'product_id, quantity and total are required' });

    const product = await db.collection('products').findOne({ _id: new ObjectId(product_id) });
    if (!product) return res.status(400).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    // reduce stock
    await db.collection('products').updateOne({ _id: new ObjectId(product_id) }, { $inc: { stock: -Number(quantity) } });

    const order = {
      product_id: new ObjectId(product_id),
      quantity: Number(quantity),
      total: Number(total),
      createdAt: new Date()
    };
    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ message: 'Order created', orderId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
