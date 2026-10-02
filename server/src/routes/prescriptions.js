import { Router } from 'express';
import multer from 'multer';
import { PrescriptionService } from '../services/prescription-service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const prescriptionService = new PrescriptionService();

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const buffer = req.file ? req.file.buffer : Buffer.from('');
    const mimeType = req.file ? req.file.mimetype : 'image/jpeg';
    const patientId = req.body.patientId;

    const result = await prescriptionService.processUpload(buffer, mimeType, patientId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
