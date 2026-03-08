import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  process.env.SUPERBASE_URL!,
  process.env.SUPERBASE_SERVICE_KEY ?? process.env.SUPERBASE_KEY!
);

export default supabase;
