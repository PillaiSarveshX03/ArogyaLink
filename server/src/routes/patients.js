import { Router } from 'express';
import multer from 'multer';
import { patientService } from '../services/patient-service.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/:id/profile', async (req, res) => {
  try {
    const profile = await patientService.getPatientProfile(req.params.id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/profile', async (req, res) => {
  try {
    const updated = await patientService.updatePatientProfile(req.params.id, req.body);
    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload profile picture/avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const patientId = req.params.id;
    let fileBuffer;
    let mimeType = 'image/png';
    let originalName = 'avatar.png';

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      originalName = req.file.originalname;
    } else if (req.body.avatarBase64) {
      const match = req.body.avatarBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        fileBuffer = Buffer.from(match[2], 'base64');
      } else {
        fileBuffer = Buffer.from(req.body.avatarBase64, 'base64');
      }
      originalName = req.body.fileName || 'avatar.png';
    } else {
      return res.status(400).json({ error: 'No avatar image provided' });
    }

    const result = await patientService.uploadAvatar(patientId, fileBuffer, mimeType, originalName);
    res.json(result);
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ABHA Sandbox Demonstration Route
router.post('/abha/simulate-fetch', async (req, res) => {
  try {
    const { abhaId, abhaAddress } = req.body;
    const result = await patientService.simulateAbhaFetch(abhaId, abhaAddress);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Caregiver Management Routes
router.get('/:id/caregivers', async (req, res) => {
  try {
    const caregivers = await patientService.getCaregivers(req.params.id);
    res.json(caregivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/caregivers', async (req, res) => {
  try {
    const newCaregiver = await patientService.addCaregiver(req.params.id, req.body);
    res.status(201).json(newCaregiver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/caregivers/:caregiverId', async (req, res) => {
  try {
    const updated = await patientService.updateCaregiver(req.params.id, req.params.caregiverId, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/caregivers/:caregiverId', async (req, res) => {
  try {
    const result = await patientService.deleteCaregiver(req.params.id, req.params.caregiverId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/courses', async (req, res) => {
  try {
    const courses = await patientService.getCourses(req.params.id);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/courses', async (req, res) => {
  try {
    const newCourse = await patientService.createCourse(req.params.id, req.body);
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/courses/:courseId', async (req, res) => {
  try {
    const result = await patientService.deleteCourse(req.params.id, req.params.courseId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/doses/:doseId', async (req, res) => {
  try {
    const { action } = req.body;
    const result = await patientService.logDoseAction(req.params.doseId, action);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
