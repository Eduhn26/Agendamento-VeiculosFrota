const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/vehicle_rental');
  const exists = await User.findOne({ email: 'admin@local' });
  if (exists) { console.log('Admin já existe'); process.exit(0); }
  const user = new User({ name: 'Admin', email:'admin@local', password:'123456', role:'admin' });
  await user.save();
  console.log('Admin criado com sucesso'); process.exit(0);
})().catch(e=>{console.error(e); process.exit(1);});