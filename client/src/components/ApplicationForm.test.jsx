import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../api/client.js';
import { toFormValues, validateApplication } from '../utils/applicationForm.js';
import { ApplicationForm } from './ApplicationForm.jsx';

function renderForm(onSubmit = vi.fn()) {
  render(<ApplicationForm initialValues={toFormValues()} onSubmit={onSubmit} onCancel={vi.fn()} />);
  return { onSubmit, user: userEvent.setup() };
}

describe('validateApplication', () => {
  it('requires company and role', () => {
    expect(validateApplication(toFormValues())).toEqual({
      company: 'Company is required',
      role: 'Role is required',
    });
  });

  it('rejects an inverted salary range and a non-URL link', () => {
    const errors = validateApplication(
      toFormValues({ company: 'A', role: 'B', salaryMin: 900000, salaryMax: 500000, jobUrl: 'careers page' }),
    );
    expect(Object.keys(errors)).toEqual(['jobUrl', 'salaryMax']);
  });
});

describe('<ApplicationForm />', () => {
  it('shows inline errors and does not submit an empty form', async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Company is required')).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/)).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values', async () => {
    const { onSubmit, user } = renderForm(vi.fn().mockResolvedValue());

    await user.type(screen.getByLabelText(/Company/), '  Northwind Labs ');
    await user.type(screen.getByLabelText(/Role/), 'Frontend Engineer');
    await user.selectOptions(screen.getByLabelText('Status'), 'interview');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ company: 'Northwind Labs', role: 'Frontend Engineer', status: 'interview' }),
    );
  });

  it('shows server-side field errors returned by the API', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError('Validation failed', 400, { role: ['Role is too long'] }));
    const { user } = renderForm(onSubmit);

    await user.type(screen.getByLabelText(/Company/), 'Acme');
    await user.type(screen.getByLabelText(/Role/), 'Engineer');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Role is too long')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Validation failed');
  });
});
