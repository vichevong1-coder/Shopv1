import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShippingForm from '../../components/checkout/ShippingForm'
import type { ShippingAddress } from '../../types/order'

const emptyAddress: ShippingAddress = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
}

const validAddress: ShippingAddress = {
  street: '123 Main St',
  city: 'Phnom Penh',
  state: 'Phnom Penh',
  postalCode: '12000',
  country: 'Cambodia',
  phone: '',
}

describe('ShippingForm', () => {
  it('renders all address fields', () => {
    render(<ShippingForm value={emptyAddress} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
  })

  it('Continue button is disabled when all fields are empty', () => {
    render(<ShippingForm value={emptyAddress} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('Continue button is disabled when any required field is missing', () => {
    const partialAddress = { ...validAddress, city: '' }
    render(<ShippingForm value={partialAddress} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('Continue button is enabled when all required fields are filled', () => {
    render(<ShippingForm value={validAddress} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
  })

  it('phone-only filled does not enable the button', () => {
    const phoneOnly = { ...emptyAddress, phone: '+855 12 345 678' }
    render(<ShippingForm value={phoneOnly} onChange={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('calls onChange when a field changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ShippingForm value={emptyAddress} onChange={onChange} onNext={vi.fn()} />)
    await user.type(screen.getByLabelText(/street address/i), 'A')
    expect(onChange).toHaveBeenCalledWith({ ...emptyAddress, street: 'A' })
  })

  it('calls onNext when Continue is clicked with a valid address', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<ShippingForm value={validAddress} onChange={vi.fn()} onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('does not call onNext when form is invalid', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<ShippingForm value={emptyAddress} onChange={vi.fn()} onNext={onNext} />)
    // button is disabled so click has no effect
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).not.toHaveBeenCalled()
  })
})
