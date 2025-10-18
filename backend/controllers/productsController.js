const { getDB } = require('../database/database');
const { ObjectId } = require('mongodb');

exports.index = async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection('products').find().toArray();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
