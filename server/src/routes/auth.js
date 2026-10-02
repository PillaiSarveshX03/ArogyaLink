import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

import { patientService } from '../services/patient-service.js';

// Demo fallback user
const DEMO_USER = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  role: 'patient',
  conditions: ['Type 2 Diabetes', 'Essential Hypertension'],
  medicalHistory: [
    'Type 2 Diabetes Mellitus (Diagnosed 2021)',
    'Essential Hypertension (Diagnosed 2019)'
  ],
  dateOfBirth: '1984-06-15',
  phone: '+91 98765 43210',
  abhaId: '91-4452-9812-4301',
  abhaAddress: 'rahul.sharma@abdm',
  doctorName: 'Dr. Alok Verma',
  doctorId: 'DMC-24981',
  doctorHospital: 'Apollo Health City, New Delhi',
  doctorEmail: 'dr.verma@apollohospitals.example',
  doctorPhone: '+91 98110 55432',
  adherenceRate: 92,
  avatarUrl: '',
  onboardingCompleted: true
};

// 1. Sign In (Existing User)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // A. Demo fallback for Rahul
    if (cleanEmail === 'rahul.sharma@example.com' || cleanEmail.includes('demo') || cleanEmail.includes('rahul')) {
      return res.json({
        success: true,
        user: DEMO_USER,
        message: 'Signed in as Demo Patient Rahul Sharma'
      });
    }

    let authUser = null;
    let authSession = null;

    // B. If Supabase is connected, attempt Supabase Auth
    if (supabase) {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      // If user exists but email is not confirmed, auto-confirm via admin API and retry
      if (error && (error.message?.includes('not confirmed') || error.code === 'email_not_confirmed' || error.message?.includes('Invalid login credentials'))) {
        try {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const found = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
          if (found) {
            await supabase.auth.admin.updateUserById(found.id, {
              email_confirm: true
            });
            const retry = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password
            });
            if (!retry.error && retry.data?.user) {
              data = retry.data;
              error = null;
            }
          }
        } catch (adminErr) {
          console.warn('Auto-confirm attempt notice:', adminErr.message);
        }
      }

      if (!error && data?.user) {
        authUser = data.user;
        authSession = data.session;
      }
    }

    if (authUser) {
      // Retrieve profile merged from patients table + Supabase raw_user_meta_data + local store
      const profile = await patientService.getPatientProfile(authUser.id);
      const meta = authUser.user_metadata || {};

      const finalUser = {
        id: authUser.id,
        email: authUser.email,
        name: profile.name || meta.name || meta.full_name || cleanEmail.split('@')[0],
        role: meta.role || profile.role || 'patient',
        conditions: profile.conditions?.length ? profile.conditions : (meta.conditions || []),
        dateOfBirth: profile.dateOfBirth || meta.dateOfBirth || '',
        phone: profile.phone || meta.phone || '',
        bloodGroup: profile.bloodGroup || meta.bloodGroup || 'O+',
        medicalHistory: profile.medicalHistory || meta.medicalHistory || [],
        abhaId: profile.abhaId || meta.abhaId || '',
        abhaAddress: profile.abhaAddress || meta.abhaAddress || '',
        doctorName: profile.doctorName || meta.doctorName || '',
        doctorId: profile.doctorId || meta.doctorId || '',
        doctorHospital: profile.doctorHospital || meta.doctorHospital || '',
        doctorEmail: profile.doctorEmail || meta.doctorEmail || '',
        doctorPhone: profile.doctorPhone || meta.doctorPhone || '',
        doctor: profile.doctor || meta.doctor,
        avatarUrl: profile.avatarUrl || meta.avatarUrl || meta.avatar_url || '',
        onboardingCompleted: meta.onboardingCompleted ?? profile.onboardingCompleted ?? false,
        adherenceRate: profile.adherenceRate || 92
      };

      // Keep user in memory cache
      patientService.saveUserAccount(finalUser);

      return res.json({
        success: true,
        user: finalUser,
        session: authSession
      });
    }

    // C. Check persistent local store (for accounts created locally or offline)
    const localUser = patientService.findUserByEmail(cleanEmail);
    if (localUser) {
      const profile = await patientService.getPatientProfile(localUser.id);
      const mergedUser = {
        ...localUser,
        ...profile,
        onboardingCompleted: profile.onboardingCompleted ?? localUser.onboardingCompleted ?? false
      };
      return res.json({
        success: true,
        user: mergedUser
      });
    }

    return res.status(401).json({
      error: 'Invalid credentials. Please verify your email and password.'
    });
  } catch (err) {
    console.error('[Auth Error - /login]:', err.message);
    res.status(500).json({ error: 'Login service encountered an unexpected error.' });
  }
});

// 2. Sign Up (Create New User)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient', conditions = [] } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let createdUser = null;
    let session = null;

    // A. If Supabase is connected, create verified auth user via admin API
    if (supabase) {
      try {
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            name,
            role,
            conditions,
            onboardingCompleted: false
          }
        });

        if (!createError && createData?.user) {
          createdUser = createData.user;
          const { data: sData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          session = sData?.session;
        } else if (createError && (createError.message?.includes('already been registered') || createError.status === 422)) {
          // If already registered in auth, update metadata and confirm
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
          if (existing) {
            await supabase.auth.admin.updateUserById(existing.id, {
              password,
              email_confirm: true,
              user_metadata: {
                ...existing.user_metadata,
                full_name: name,
                name,
                role,
                conditions
              }
            });
            createdUser = existing;
            const { data: sData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
            session = sData?.session;
          }
        }
      } catch (adminErr) {
        console.warn('Supabase admin registration warning:', adminErr.message);
      }

      // Upsert into patients table (supported columns)
      if (createdUser) {
        try {
          await supabase.from('patients').upsert({
            id: createdUser.id,
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' ') || '',
            email: cleanEmail,
            conditions,
            updated_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Could not upsert into patients table:', dbErr.message);
        }
      }
    }

    const userId = createdUser ? createdUser.id : `user-${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email: cleanEmail,
      role,
      conditions: conditions.length > 0 ? conditions : [],
      medicalHistory: [],
      adherenceRate: 100,
      avatarUrl: '',
      onboardingCompleted: false
    };

    // Save to persistent patient & user store
    patientService.saveUserAccount(newUser);

    return res.status(201).json({
      success: true,
      user: newUser,
      session
    });
  } catch (err) {
    console.error('[Auth Error - /register]:', err.message);
    res.status(500).json({ error: 'Registration service encountered an error.' });
  }
});

// 3. Current User verification
router.get('/me', (req, res) => {
  res.json({
    user: DEMO_USER
  });
});

export default router;
