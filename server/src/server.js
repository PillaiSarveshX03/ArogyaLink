import app from './app.js';
import { config } from './config/env.js';
import { reminderScheduler } from './services/reminder-scheduler.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Medication Management Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`📡 Supabase: ${config.supabase.url || 'Running in local fallback mode'}`);
  console.log(`=======================================================`);

  // Start background deterministic reminder scheduler (runs every 60s)
  reminderScheduler.start(60000);
});
