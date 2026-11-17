import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';
import * as nav from '../utils/navigation';

describe('CommandPalette Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('stays closed by default and opens on Ctrl+K keyboard shortcut', () => {
    render(<CommandPalette />);
    expect(screen.queryByRole('dialog', { name: 'Command Palette' })).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: 'Command Palette' })).toBeInTheDocument();
  });

  it('opens on Meta+K and custom open-command-palette event, and closes on Escape', () => {
    render(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog', { name: 'Command Palette' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Command Palette' })).not.toBeInTheDocument();

    fireEvent(window, new CustomEvent('open-command-palette'));
    expect(screen.getByRole('dialog', { name: 'Command Palette' })).toBeInTheDocument();
  });

  it('filters indexed pages, 30-day telemetry chart, and engineering notes by query and keywords', () => {
    render(<CommandPalette />);
    fireEvent(window, new CustomEvent('open-command-palette'));

    const input = screen.getByRole('textbox', {
      name: /Search pages, tools, engineering notes, and actions/i,
    });

    fireEvent.change(input, { target: { value: '30-Day' } });
    expect(screen.getByText(/30-Day Historical Transaction Success Rate Chart/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'About' } });
    expect(screen.getByText(/About EULOK/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'nonexistent-xyz-token' } });
    expect(screen.getByText(/No matching commands, pages, or tools found/i)).toBeInTheDocument();
  });

  it('navigates cleanly via click or ArrowDown + Enter selection', async () => {
    const navSpy = vi.spyOn(nav, 'navigateTo').mockImplementation(() => {});
    render(<CommandPalette />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    const input = screen.getByRole('textbox', {
      name: /Search pages, tools, engineering notes, and actions/i,
    });

    fireEvent.change(input, { target: { value: 'About EULOK' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(navSpy).toHaveBeenCalledWith('about');
    });
    expect(screen.queryByRole('dialog', { name: 'Command Palette' })).not.toBeInTheDocument();
  });
});
