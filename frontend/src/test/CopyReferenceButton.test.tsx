import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopyReferenceButton } from '../components/shipments/CopyReferenceButton';

describe('CopyReferenceButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders copy button with accessible label', () => {
    render(<CopyReferenceButton referenceNumber="NF-2026-001" />);

    const button = screen.getByRole('button', { name: /copy reference number nf-2026-001/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Copy ref')).toBeInTheDocument();
  });

  it('copies reference to clipboard and updates label to Copied!', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CopyReferenceButton referenceNumber="NF-2026-001" />);

    const button = screen.getByRole('button', { name: /copy reference number nf-2026-001/i });
    await userEvent.click(button);

    expect(writeTextMock).toHaveBeenCalledWith('NF-2026-001');

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      expect(screen.getByText(/reference number nf-2026-001 copied to clipboard/i)).toBeInTheDocument();
    });
  });
});
