const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.js');
const Vehicle = require('./models/Vehicle.js');
const RentalRequest = require('./models/RentalRequest.js');

let usedIds = new Set();

const generateUniqueId = () => {
let id;
do {
id = Math.floor(Math.random() * (9999 - 4000 + 1)) + 4000;
} while (usedIds.has(id));

usedIds.add(id);
return id;
};

const seed = async () => {
try {
console.log("🚀 Iniciando Seed...");

```
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Conectado ao MongoDB");

console.log("🧹 Limpando collections...");
await User.deleteMany({});
await Vehicle.deleteMany({});
await RentalRequest.deleteMany({});

console.log("👤 Criando usuários (dados fictícios)...");

const usersSeed = [
  {
    name: "Administrador do Sistema",
    email: "admin@example.com",
    password: await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || "admin_temp_password", 12),
    role: "admin",
    department: "TI",
    registrationId: generateUniqueId()
  },
  {
    name: "Usuário Teste 1",
    email: "user1@example.com",
    password: await bcrypt.hash(process.env.USER_SEED_PASSWORD || "user_temp_password", 12),
    role: "user",
    department: "Vendas",
    registrationId: generateUniqueId()
  },
  {
    name: "Usuário Teste 2",
    email: "user2@example.com",
    password: await bcrypt.hash(process.env.USER_SEED_PASSWORD || "user_temp_password", 12),
    role: "user",
    department: "Marketing",
    registrationId: generateUniqueId()
  }
];

const createdUsers = await User.insertMany(usersSeed);
console.log(`✅ Usuários criados: ${createdUsers.length}`);

console.log("🚗 Criando veículos fictícios...");

const vehiclesSeed = [
  {
    brand: 'Jeep',
    model: 'Compass',
    year: 2024,
    licensePlate: 'TEST-001',
    color: 'Branco',
    mileage: 4500,
    status: 'available',
    lastMaintenanceMileage: 0,
    nextMaintenance: 30000
  },
  {
    brand: 'Volkswagen',
    model: 'Polo Highline',
    year: 2023,
    licensePlate: 'TEST-002',
    color: 'Prata',
    mileage: 12000,
    status: 'available',
    lastMaintenanceMileage: 0,
    nextMaintenance: 30000
  },
  {
    brand: 'Toyota',
    model: 'Yaris',
    year: 2023,
    licensePlate: 'TEST-003',
    color: 'Azul',
    mileage: 7800,
    status: 'available',
    lastMaintenanceMileage: 0,
    nextMaintenance: 30000
  }
];

const createdVehicles = await Vehicle.insertMany(vehiclesSeed);
console.log(`✅ Veículos criados: ${createdVehicles.length}`);

console.log("\n🎉 SEED FINALIZADO COM SUCESSO!");
console.log("====================================");
console.log(`👤 Usuários: ${await User.countDocuments()}`);
console.log(`🚗 Veículos: ${await Vehicle.countDocuments()}`);
console.log("====================================");
console.log("🔐 Credenciais de seed (defina no .env):");
console.log("ADMIN_SEED_PASSWORD=");
console.log("USER_SEED_PASSWORD=");

await mongoose.connection.close();
console.log("🔌 Conexão encerrada.");
```

} catch (err) {
console.error("❌ Erro na seed:", err.message);
process.exit(1);
}
};

seed();
