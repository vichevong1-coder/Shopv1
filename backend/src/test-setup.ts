// Provide dummy Supabase credentials so createClient() doesn't throw at
// module load time in tests (no real Supabase calls are made in cart/order tests)
process.env.SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.SUPABASE_KEY = 'placeholder-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'placeholder-service-key';

// Provide a dummy Stripe key so the Stripe singleton doesn't throw at module
// load time in tests — no real Stripe calls are made in existing test suites
process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
