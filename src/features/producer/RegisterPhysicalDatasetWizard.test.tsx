import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RegisterPhysicalDatasetWizard } from './RegisterPhysicalDatasetWizard';

vi.mock('./register/mintDatasetId', async () => {
  const actual = await vi.importActual<typeof import('./register/mintDatasetId')>(
    './register/mintDatasetId',
  );
  return {
    ...actual,
    mintDatasetId: () => 'DS-CIB-40400',
    resolveMintIds: (app: string, registry: Record<string, { offerId: string; appId: string }>) => {
      const entry = registry[app];
      if (!entry) return null;
      return { ...entry, dsId: 'DS-CIB-40400' };
    },
  };
});

function renderWizard() {
  return render(
    <MemoryRouter>
      <RegisterPhysicalDatasetWizard open onClose={() => undefined} />
    </MemoryRouter>,
  );
}

describe('RegisterPhysicalDatasetWizard', () => {
  it('blocks Continue until Application and name are set', async () => {
    const user = userEvent.setup();
    renderWizard();

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    expect(continueBtn).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/Application/i), 'Endur');
    await user.type(screen.getByLabelText(/Physical dataset name/i), 'Endur_FX_Forwards_Snap');

    expect(continueBtn).toBeEnabled();
    expect(screen.getByText(/PC-ENDUR-01/)).toBeInTheDocument();
  });

  it('walks to Review and mints a Dataset ID', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.selectOptions(screen.getByLabelText(/Application/i), 'Endur');
    await user.type(screen.getByLabelText(/Physical dataset name/i), 'Endur_FX_Forwards_Snap');

    for (let i = 0; i < 7; i += 1) {
      await user.click(screen.getByRole('button', { name: /Continue/i }));
    }

    expect(screen.getByText(/Confirm & register/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Register — mint Dataset ID/i }));

    expect(screen.getByText(/Dataset registered/i)).toBeInTheDocument();
    expect(screen.getByText('DS-CIB-40400')).toBeInTheDocument();
    expect(screen.getByText('APP-ENDUR')).toBeInTheDocument();
    expect(screen.getByText('PC-ENDUR-01')).toBeInTheDocument();
  });
});
