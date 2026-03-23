import Input from '../common/Input';
import Button from '../common/Button';
import type { ShippingAddress } from '../../types/order';

interface Props {
  value: ShippingAddress;
  onChange: (addr: ShippingAddress) => void;
  onNext: () => void;
}

const ShippingForm = ({ value, onChange, onNext }: Props) => {
  const set = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value });

  const valid =
    value.street.trim() &&
    value.city.trim() &&
    value.state.trim() &&
    value.postalCode.trim() &&
    value.country.trim();

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.5rem', color: '#0f0f0f' }}>
        Shipping Address
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Street address"
          value={value.street}
          onChange={set('street')}
          placeholder="123 Main St"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="City"
            value={value.city}
            onChange={set('city')}
            placeholder="Phnom Penh"
          />
          <Input
            label="State / Province"
            value={value.state}
            onChange={set('state')}
            placeholder="Phnom Penh"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Postal code"
            value={value.postalCode}
            onChange={set('postalCode')}
            placeholder="12000"
          />
          <Input
            label="Country"
            value={value.country}
            onChange={set('country')}
            placeholder="Cambodia"
          />
        </div>
        <Input
          label="Phone number (optional)"
          value={value.phone ?? ''}
          onChange={set('phone')}
          placeholder="+855 12 345 678"
          type="tel"
        />
      </div>

      <Button
        fullWidth
        disabled={!valid}
        onClick={onNext}
        style={{ marginTop: '2rem', background: '#0f0f0f', color: '#fff', padding: '0.875rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}
      >
        Continue to Review
      </Button>
    </div>
  );
};

export default ShippingForm;
