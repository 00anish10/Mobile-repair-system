import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

describe('ForgotPasswordPage', () => {
  it('renders the reset request form', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Reset your password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send reset link/i })).toBeInTheDocument();
  });
});

describe('ResetPasswordPage', () => {
  it('rejects mismatched passwords before calling the API', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[`/reset-password?token=${'a'.repeat(32)}`]}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('New Password'), 'StrongPass1');
    await user.type(screen.getByLabelText('Confirm New Password'), 'StrongPass2');
    await user.click(screen.getByRole('button', { name: /Update password/i }));

    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
  });

  it('warns when the token is missing', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('New Password'), 'StrongPass1');
    await user.type(screen.getByLabelText('Confirm New Password'), 'StrongPass1');
    await user.click(screen.getByRole('button', { name: /Update password/i }));

    expect(screen.getByText(/missing its token/i)).toBeInTheDocument();
  });
});
