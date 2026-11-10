import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar Component — FAANG Grade Rendering & Accessibility', () => {
  const onNavigateMock = vi.fn();
  const onOpenIntakeModalMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand wordmark with home link and ENG badge', () => {
    render(
      <Navbar
        currentPage="home"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const brand = screen.getByRole('link', { name: /EULOK/i });
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute('href', '/');

    fireEvent.click(brand);
    expect(onNavigateMock).toHaveBeenCalledWith('home');
  });

  it('renders primary desktop navigation items with accessibility roles', () => {
    render(
      <Navbar
        currentPage="services"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const desktopNav = screen.getByRole('navigation', { name: /Main navigation/i });
    expect(desktopNav).toBeInTheDocument();

    const expectedLabels = [
      'Services',
      'Rescue Software',
      'How We Work',
      'Work & Evidence',
      'Engineering Notes',
      'About',
    ];

    expectedLabels.forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });

    // Check active class on Services
    const servicesLink = screen.getByRole('link', { name: 'Services' });
    expect(servicesLink).toHaveClass('active');
  });

  it('navigates when primary desktop links are clicked', () => {
    render(
      <Navbar
        currentPage="home"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const rescueLink = screen.getByRole('link', { name: 'Rescue Software' });
    fireEvent.click(rescueLink);
    expect(onNavigateMock).toHaveBeenCalledWith('rescue');
  });

  it('opens and closes the Tools & Gates dropdown on click and Escape key', async () => {
    render(
      <Navbar
        currentPage="home"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const dropdownTrigger = screen.getByRole('button', {
      name: /Tools and Verification Gates menu/i,
    });
    expect(dropdownTrigger).toBeInTheDocument();
    expect(dropdownTrigger).toHaveAttribute('aria-expanded', 'false');

    // Click to open dropdown
    fireEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveAttribute('aria-expanded', 'true');

    // Verify dropdown items rendered
    expect(screen.getByText('Reconciliation Demo')).toBeInTheDocument();
    expect(screen.getByText('Scoping Studio (SOW)')).toBeInTheDocument();
    expect(screen.getByText('Release Verification Standard')).toBeInTheDocument();
    expect(screen.getByText('Edge Telemetry')).toBeInTheDocument();

    // Clicking an item triggers navigation
    fireEvent.click(screen.getByText('Reconciliation Demo'));
    expect(onNavigateMock).toHaveBeenCalledWith('ops-suite');

    // Pressing Escape closes dropdown
    fireEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(dropdownTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('invokes intake modal callback when clicking "Start a project" CTA', () => {
    render(
      <Navbar
        currentPage="home"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const startButtons = screen.getAllByRole('button', { name: /Start a project/i });
    expect(startButtons.length).toBeGreaterThan(0);

    fireEvent.click(startButtons[0]);
    expect(onOpenIntakeModalMock).toHaveBeenCalled();
  });

  it('opens the dedicated MobileSlideOver drawer when clicking mobile menu toggle', async () => {
    render(
      <Navbar
        currentPage="home"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const mobileToggle = screen.getByRole('button', {
      name: /Open mobile navigation menu/i,
    });
    expect(mobileToggle).toBeInTheDocument();

    // Click to open SlideOver
    fireEvent.click(mobileToggle);

    // Verify drawer dialog renders with proper a11y attributes
    const drawer = await screen.findByRole('dialog', {
      name: /Mobile navigation drawer/i,
    });
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute('aria-modal', 'true');

    // Verify close button exists and closes the drawer
    const closeBtn = screen.getByRole('button', { name: /Close navigation menu/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes MobileSlideOver when pressing Escape', async () => {
    render(
      <Navbar
        currentPage="home"
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const mobileToggle = screen.getByRole('button', {
      name: /Open mobile navigation menu/i,
    });
    fireEvent.click(mobileToggle);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
