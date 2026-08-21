import Stripe from 'stripe';

let client: Stripe | null = null;

// Built lazily. Constructing Stripe at import time throws when
// STRIPE_SECRET_KEY is absent, which crashed the whole server on boot and took
// down every unrelated route with it. Now only payment calls fail.
const getStripe = (): Stripe => {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set — payment features are unavailable.');
    }
    client = new Stripe(key);
  }
  return client;
};

export default new Proxy({} as Stripe, {
  get: (_target, prop) => {
    const instance = getStripe() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
