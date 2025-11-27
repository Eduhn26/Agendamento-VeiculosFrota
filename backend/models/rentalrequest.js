

const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { 
    type: Date, 
    required: true,
  validate: {
  validator: function(endDate) {
    const diffTime = Math.abs(endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
   
    return diffDays >= 1 && diffDays <= 5;
  },
  message: 'O período permitido para aluguel é de 1 a 5 dias'
}

  },
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  adminNotes: String,
  actualMileage: Number
}, { timestamps: true });




rentalRequestSchema.statics.checkVehicleAvailability = async function(vehicleId, startDate, endDate, currentRequestId = null) {
  
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0); 
  
  const query = {
    vehicle: vehicleId,
    status: 'approved', 
    $or: [
      
      
      { 
        startDate: { $lte: end }, 
        endDate: { $gte: start }  
      }
    ]
  };

  
  if (currentRequestId) {
    query._id = { $ne: currentRequestId };
  }
  
  const conflictingRequest = await this.findOne(query);
  return !conflictingRequest; 
};

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);