import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

describe('CheckoutSteps', () => {
  it('renders all three step labels', () => {
    render(<CheckoutSteps currentStep={1} />)
    expect(screen.getByText('Shipping')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
  })

  describe('currentStep=1', () => {
    it('shows step numbers for all steps (none complete)', () => {
      render(<CheckoutSteps currentStep={1} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows no checkmarks', () => {
      render(<CheckoutSteps currentStep={1} />)
      expect(screen.queryByText('✓')).not.toBeInTheDocument()
    })
  })

  describe('currentStep=2', () => {
    it('shows checkmark for step 1 (done)', () => {
      render(<CheckoutSteps currentStep={2} />)
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('shows step numbers for steps 2 and 3', () => {
      render(<CheckoutSteps currentStep={2} />)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('currentStep=3', () => {
    it('shows checkmarks for steps 1 and 2 (both done)', () => {
      render(<CheckoutSteps currentStep={3} />)
      expect(screen.getAllByText('✓')).toHaveLength(2)
    })

    it('shows step number for step 3 (active, not done)', () => {
      render(<CheckoutSteps currentStep={3} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })
})
