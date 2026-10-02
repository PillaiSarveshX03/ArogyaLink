import { Router } from 'express';
import { patientService } from '../services/patient-service.js';

const router = Router();

router.get('/:id/profile', async (req, res) => {
  try {
    const profile = await patientService.getPatientProfile(req.params.id);
    res.json(profile);
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
