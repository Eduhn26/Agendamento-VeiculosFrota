const express = require('express');
const auth = require('../middleware/auth');
const RentalRequest = require('../models/rentalrequest.js');
const Vehicle = require('../models/Vehicle.js');
const { validate, rentalSchema } = require('../validators');

const router = express.Router();

router.post('/', auth, validate(rentalSchema), async (req, res) => {
  try {
    const requestedUserId =
      req.user.role === 'admin' && req.body.userId
        ? req.body.userId
        : req.user.userId;

    const { vehicleId, startDate, endDate } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ error: 'vehicleId é obrigatório.' });
    }

    // --- VALIDAÇÃO DE DURAÇÃO (5 DIAS) ---
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const maxDurationMs = 5 * 24 * 60 * 60 * 1000;
    
    if (endObj.getTime() - startObj.getTime() > maxDurationMs) {
        return res.status(400).json({ error: 'O período máximo de aluguel é de 5 dias.' });
    }

    // Verifica conflito de horário preciso na criação
    const existingRequest = await RentalRequest.findOne({
      vehicle: vehicleId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lt: endObj },
          endDate: { $gt: startObj }
        }
      ]
    });

    if (existingRequest) {
      return res.status(409).json({
        error: 'Veículo indisponível! Já existe uma reserva para este período.'
      });
    }

    const rentalRequest = new RentalRequest({
      user: requestedUserId,
      vehicle: vehicleId,
      startDate,
      endDate,
      purpose: req.body.purpose
    });

    await rentalRequest.save();
    await rentalRequest.populate('vehicle user');
    res.status(201).json(rentalRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await RentalRequest.find({
      user: req.user.userId
    })
    .populate('vehicle')
    .populate('user') 
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const requests = await RentalRequest.find()
      .populate('vehicle user')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const requests = await RentalRequest.find().populate('vehicle user');

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'pending').length,
      approvedRequests: requests.filter((r) => r.status === 'approved').length,
      rejectedRequests: requests.filter((r) => r.status === 'rejected').length,
      completedRequests: requests.filter((r) => r.status === 'completed').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reset-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await RentalRequest.deleteMany({});

    res.status(200).json({
      message: `Todas as ${result.deletedCount} solicitações foram excluídas com sucesso.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resetar reservas.' });
  }
});

router.patch('/:id/edit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const request = await RentalRequest.findById(req.params.id);

    if (!request || request.status !== 'approved') {
      return res
        .status(400)
        .json({ error: 'Só é possível editar reservas aprovadas.' });
    }

    const { startDate, endDate, purpose } = req.body;

    if (startDate || endDate) {
      // Validação de horário precisa no EDIT também
      const startObj = new Date(startDate || request.startDate);
      const endObj = new Date(endDate || request.endDate);

      const conflict = await RentalRequest.findOne({
        vehicle: request.vehicle,
        status: 'approved',
        _id: { $ne: request._id },
        $or: [
            {
              startDate: { $lt: endObj },
              endDate: { $gt: startObj }
            }
        ]
      });

      if (conflict) {
        return res
          .status(409)
          .json({ error: 'As novas datas conflitam com outra reserva aprovada.' });
      }
    }

    request.startDate = startDate || request.startDate;
    request.endDate = endDate || request.endDate;
    request.purpose = purpose || request.purpose;

    await request.save();
    await request.populate('vehicle user');
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const rentalId = req.params.id;
    const { newMileage, notes } = req.body;

    const request = await RentalRequest.findById(rentalId).populate('vehicle');

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' });
    }

    if (request.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para finalizar esta reserva.' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ error: `A solicitação não está APROVADA (Status atual: ${request.status}).` });
    }

    const currentVehicle = request.vehicle;
    
    const newMileageNumber = parseInt(newMileage, 10);
    if (isNaN(newMileageNumber) || newMileageNumber <= 0) {
        return res.status(400).json({ error: 'Quilometragem inválida.' });
    }
    if (newMileageNumber < currentVehicle.mileage) {
        return res.status(400).json({ error: `A nova KM (${newMileageNumber.toLocaleString()} km) deve ser maior que a KM anterior (${currentVehicle.mileage.toLocaleString()} km).` });
    }

    await Vehicle.findByIdAndUpdate(
      currentVehicle._id,
      { $set: { mileage: newMileageNumber, status: 'available' } } 
    );

    request.status = 'completed';
    request.adminNotes = notes || (req.user.role === 'admin' ? 'Finalizado pelo Admin.' : 'Devolução finalizada pelo usuário.');
    await request.save();

    await request.populate('user');
    res.json(request);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTA DE APROVAÇÃO (CORRIGIDA) ---
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const request = await RentalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const allowedStatuses = ['approved', 'rejected', 'completed'];
    const newStatus = req.body.status;

    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

   
    if (newStatus === 'approved') {
        const startObj = new Date(request.startDate);
        const endObj = new Date(request.endDate);

     
        const conflict = await RentalRequest.findOne({
            vehicle: request.vehicle,
            status: 'approved', 
            _id: { $ne: request._id },
            $or: [
                {
                    startDate: { $lt: endObj }, 
                    endDate: { $gt: startObj }  
                }
            ]
        }).populate('user');

        if (conflict) {
            const conflictStart = new Date(conflict.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
            const conflictEnd = new Date(conflict.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
            const userName = conflict.user ? conflict.user.name : 'Desconhecido';

            const errorMsg = `Conflito! O veículo já está reservado para ${userName} de ${conflictStart} até ${conflictEnd}.`;
            return res.status(409).json({ error: errorMsg });
        }
    }

    request.status = newStatus;
    request.adminNotes = req.body.notes || request.adminNotes;
    await request.save();

    await request.populate('vehicle user');
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;