const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  mileage: { type: Number, default: 0 },
  
  lastMaintenanceMileage: { type: Number, default: 0 },
  nextMaintenance: { type: Number, default: 30000 }, 
  
  status: { 
    type: String, 
    enum: ['available', 'rented', 'maintenance'], 
    default: 'available' 
  },
  
  transmissionType: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
  fuelType: { type: String, default: 'Flex' },
  passengers: { type: Number, default: 5 },
  imageUrl: { type: String }
}, { 
  timestamps: true 
});


vehicleSchema.pre('save', function(next) {
  
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;