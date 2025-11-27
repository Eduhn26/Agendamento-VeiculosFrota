const express = require('express');
const auth = require('../middleware/auth');
const Vehicle = require('../models/Vehicle.js');
const RentalRequest = require('../models/rentalrequest.js');

const router = express.Router();

/** FUNÇÃO DE VALIDAÇÃO DE URL */
function isValidUrl(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    res.json({ totalVehicles, availableVehicles, maintenanceVehicles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:vehicleId/approved-rentals', auth, async (req, res) => {
  try {
    const approvedBookings = await RentalRequest.find({
      vehicle: req.params.vehicleId,
      status: 'approved'
    }).select('startDate endDate');
    res.json(approvedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/all-for-user', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** --------------------------
 *  POST /  → VALIDAR IMAGEURL
 * -------------------------- */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const vehicleData = req.body;

    // 🔥 VALIDAÇÃO APLICADA AQUI
    if (!isValidUrl(vehicleData.imageUrl)) {
      vehicleData.imageUrl = ""; // força frontend a usar default-car.png
    }

    if (!vehicleData.nextMaintenance) {
        vehicleData.nextMaintenance = 20000;
    }

    const newVehicle = new Vehicle(vehicleData);
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/mileage', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const { mileage } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });
    
    vehicle.mileage = mileage;
    await vehicle.save();
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/complete-maintenance', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }

        const INTERVAL = 20000;
        const currentMileage = vehicle.mileage;

        let nextTarget = Math.ceil((currentMileage + 1) / INTERVAL) * INTERVAL;

        if (nextTarget <= currentMileage) {
            nextTarget = currentMileage + INTERVAL;
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status: 'available',
                    lastMaintenanceMileage: vehicle.mileage,
                    nextMaintenance: nextTarget
                }
            },
            { new: true }
        );

        res.json(updatedVehicle);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const updateData = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem excluir veículos.' });
    }
    
    const activeRentals = await RentalRequest.countDocuments({
        vehicle: req.params.id,
        status: { $in: ['pending', 'approved'] }
    });

    if (activeRentals > 0) {
        return res.status(400).json({ 
            error: 'Não é possível excluir o veículo: existem solicitações pendentes ou reservas ativas.' 
        });
    }

    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});

module.exports = router;
