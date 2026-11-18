import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SupportPage } from '../pages/SupportPage';

// Basic Vitest test
describe('Vitest setup test', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });
});

// Test for SupportPage renders correctly
describe('SupportPage', () => {
  it('renders without crashing', () => {
    const { unmount } = render(<SupportPage />);
    expect(screen.getAllByText(/Contact Support/)).toHaveLength(1);
    unmount();
  });

  it('contains the support page title', () => {
    render(<SupportPage />);
    const title = screen.getByText(/Contact Support/);
    expect(title).toBeInTheDocument();
  });

  it('contains the support description', () => {
    render(<SupportPage />);
    const description = screen.getByText(/Have questions/);
    expect(description).toBeInTheDocument();
  });

  it('contains the phone number', () => {
    render(<SupportPage />);
    const phone = screen.getByText(/1300 555 012/);
    expect(phone).toBeInTheDocument();
  });

  it('contains the email address', () => {
    render(<SupportPage />);
    const email = screen.getByText(/support@moonmobilerepair.com/);
    expect(email).toBeInTheDocument();
  });

  it('contains the support hours', () => {
    render(<SupportPage />);
    const hours = screen.getByText(/Monday - Friday/);
    expect(hours).toBeInTheDocument();
  });

  it('contains the submit button', () => {
    render(<SupportPage />);
    const button = screen.getByRole('button', { name: /Send Message/i });
    expect(button).toBeInTheDocument();
  });

  it('contains the social media links', () => {
    render(<SupportPage />);
    const twitterLink = screen.getByRole('link', { name: /X/ });
    expect(twitterLink).toBeInTheDocument();
  });
});