import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer Component — Rendering & Accessibility Standards', () => {
  const onNavigateMock = vi.fn();
  const onOpenIntakeModalMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand wordmark, location, and deterministic philosophy blockquote', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    // Brand wordmark link
    const brandLink = screen.getByRole('link', { name: /^EULOK/i });
    expect(brandLink).toBeInTheDocument();

    // Mission text
    expect(
      screen.getByText(/Independent software engineering for organizations/i)
    ).toBeInTheDocument();

    // Geography
    expect(screen.getByText(/Kampala, Uganda · Remote worldwide/i)).toBeInTheDocument();

    // Core rule blockquote
    expect(
      screen.getByText(/Models propose\. Deterministic systems decide\./i)
    ).toBeInTheDocument();
  });

  it('renders all four structured navigational column headings', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    expect(screen.getByRole('heading', { level: 4, name: /Explore/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: /Engineering & Tools/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: /Start a Project/i })
    ).toBeInTheDocument();
  });

  it('navigates when Explore links are clicked', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const rescueLink = screen.getByRole('link', { name: 'Software Rescue' });
    fireEvent.click(rescueLink);
    expect(onNavigateMock).toHaveBeenCalledWith('rescue');

    const workLink = screen.getByRole('link', { name: 'How We Work' });
    fireEvent.click(workLink);
    expect(onNavigateMock).toHaveBeenCalledWith('work');
  });

  it('calls onOpenIntakeModal when clicking "Start Project Intake →"', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const intakeBtn = screen.getByRole('button', { name: /Start Project Intake →/i });
    expect(intakeBtn).toBeInTheDocument();

    fireEvent.click(intakeBtn);
    expect(onOpenIntakeModalMock).toHaveBeenCalled();
  });

  it('renders secure external communications links with rel="noopener noreferrer"', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    // WhatsApp link
    const waLink = screen.getByRole('link', { name: /Continue on WhatsApp/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute('target', '_blank');
    expect(waLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(waLink.getAttribute('href')).toContain('wa.me/256760779160');

    // Mail link
    const emailLink = screen.getByRole('link', { name: /Send an Email/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.getAttribute('href')).toContain('mailto:hello@eulok.com');
  });

  it('renders institutional compliance and policy links in the footer bottom bar', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const privacy = screen.getByRole('link', { name: /Privacy Notice/i });
    const security = screen.getByRole('link', { name: /Security & RFC 9116/i });
    const accessibility = screen.getByRole('link', { name: /Accessibility \(WCAG 2\.2 AA\)/i });
    const standards = screen.getByRole('link', { name: /Delivery Commitments/i });
    const status = screen.getByRole('link', { name: /Live Status/i });

    expect(privacy).toBeInTheDocument();
    expect(security).toBeInTheDocument();
    expect(accessibility).toBeInTheDocument();
    expect(standards).toBeInTheDocument();
    expect(status).toBeInTheDocument();

    fireEvent.click(security);
    expect(onNavigateMock).toHaveBeenCalledWith('security');
  });

  it('renders ThemeToggle in the footer for accessible theme switching', () => {
    render(
      <Footer
        onNavigate={onNavigateMock}
        onOpenIntakeModal={onOpenIntakeModalMock}
      />
    );

    const themeToggle = screen.getByRole('button', { name: /Switch to (light|dark) mode/i });
    expect(themeToggle).toBeInTheDocument();
  });
});
