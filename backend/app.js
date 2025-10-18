const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require('bcrypt');
const { connectDB, getDB } = require('./database/database');
const cors = require('cors');

(async () => {
  try {
    await connectDB(process.env.DATABASE_URL, process.env.DATABASE_NAME);
    console.log("MongoDB connected");

    const db = getDB();
    const superadmin = await db.collection('users').findOne({ role: 'superadmin' });
    
    // Seed superadmin only if not exists or fields changed
    const newName  = process.env.INITIALIZE_SUPERADMIN_NAME;
    const newEmail = process.env.INITIALIZE_SUPERADMIN_EMAIL;
    const newPass  = process.env.INITIALIZE_SUPERADMIN_PASSWORD;

    if (superadmin) {
      const isNameChanged  = superadmin.name  !== newName;
      const isEmailChanged = superadmin.email !== newEmail;

      const isPasswordSame = await bcrypt.compare(newPass, superadmin.password);
      const isPasswordChanged = !isPasswordSame;

      if (isNameChanged || isEmailChanged || isPasswordChanged) {
        const updateFields = {};
        if (isNameChanged)  updateFields.name  = newName;
        if (isEmailChanged) updateFields.email = newEmail;
        if (isPasswordChanged) {
          updateFields.password = await bcrypt.hash(newPass, 10);
        }

        await db.collection('users').updateOne(
          { _id: new ObjectId(superadmin._id) },
          { $set: updateFields }
        );
        console.log("Superadmin updated:", updateFields);
      } else {
        console.log("No changes detected. Update skipped.");
      }

    } else {
      const hashed = await bcrypt.hash(newPass, 10);
      await db.collection('users').insertOne({
        name: newName,
        email: newEmail,
        password: hashed,
        role: 'superadmin',
      });
      console.log("Superadmin created");
    }

    // seed products collection if empty
    const productsCount = await db.collection('products').countDocuments();
    if (productsCount === 0) {
      await db.collection('products').insertMany([
        { name: 'Coffee', price: 3000, stock: 100 },
        { name: 'Tea', price: 2500, stock: 80 },
        { name: 'Sandwich', price: 15000, stock: 40 }
      ]);
      console.log('Seeded products collection');
    }

  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
})();

const indexRouter   = require('./routes/index');
const authRouter    = require('./routes/authRoutes');
const productsRouter = require('./routes/productsRoutes');
const ordersRouter = require('./routes/ordersRoutes');
const { ObjectId } = require('mongodb');

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

module.exports = app;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
