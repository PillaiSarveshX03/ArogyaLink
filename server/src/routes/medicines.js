import { Router } from 'express';
import { MedicineService } from '../services/medicine-service.js';

const router = Router();
const medicineService = new MedicineService();

router.get('/', async (req, res) => {
  try {
    const medicines = await medicineService.getAllMedicines();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
