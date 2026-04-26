import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Panel } from '../components/Panel';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { Modal } from '../components/Modal';
import { Tabs } from '../components/Tabs';
import { Progress } from '../components/Progress';
import { StatusDot } from '../components/StatusDot';
import { NeonBorder } from '../components/NeonBorder';
import { CircuitGrid } from '../components/CircuitGrid';
import { GlowingCard } from '../components/GlowingCard';
import { QuotePanel } from '../components/QuotePanel';
import { BOMTable } from '../components/BOMTable';
import { PreviewPanel } from '../components/PreviewPanel';
import { AgentAccordion } from '../components/AgentAccordion';

import { cn } from '../styles/cn';
import { theme } from '../styles/theme';
import { useTheme } from '../hooks/useTheme';

// ── Utility Tests ─────────────────────────────────────────────────────────────

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active'); // eslint-disable-line no-constant-binary-expression -- intentional falsy test
  });

  it('deduplicates tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('theme', () => {
  it('has required color sections', () => {
    expect(theme.colors.bg).toBeDefined();
    expect(theme.colors.fg).toBeDefined();
    expect(theme.colors.accent).toBeDefined();
    expect(theme.colors.border).toBeDefined();
  });

  it('has liquid glass accent colors', () => {
    expect(theme.colors.accent.blue).toBe('#1565C0');
    expect(theme.colors.accent.lightBlue).toBe('#6191D3');
    expect(theme.colors.accent.success).toBe('#4CAF50');
    expect(theme.colors.accent.warning).toBe('#FF9800');
    expect(theme.colors.accent.error).toBe('#EF5350');
  });

  it('has serif fonts defined', () => {
    expect(theme.fonts.heading).toContain('Noto Serif');
    expect(theme.fonts.body).toContain('Noto Serif');
  });

  it('has rounded radius design', () => {
    expect(theme.radii.none).toBe('0px');
    expect(theme.radii.sm).toBe('8px');
    expect(theme.radii.md).toBe('12px');
    expect(theme.radii.lg).toBe('16px');
  });

  it('has glass and smooth transition effects', () => {
    expect(theme.effects.glassBackground).toBeDefined();
    expect(theme.effects.glassShadow).toBeDefined();
    expect(theme.effects.smoothTransition).toBeDefined();
  });
});

describe('useTheme hook', () => {
  it('returns theme and isDark flag', () => {
    function TestComponent() {
      const { theme: t, isDark } = useTheme();
      return React.createElement('div', {
        'data-testid': 'theme-output',
        'data-is-dark': isDark,
        'data-has-accent': !!t.colors.accent.blue,
      });
    }

    render(React.createElement(TestComponent));
    const el = screen.getByTestId('theme-output');
    expect(el.dataset.isDark).toBe('true');
    expect(el.dataset.hasAccent).toBe('true');
  });
});

// ── Component Rendering Tests ─────────────────────────────────────────────────

describe('Button', () => {
  it('renders with children text', () => {
    render(React.createElement(Button, null, 'Click me'));
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('renders with primary variant by default', () => {
    const { container } = render(React.createElement(Button, null, 'Test'));
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.className).toContain('border-[#1565C0]');
  });

  it('renders with danger variant', () => {
    const { container } = render(React.createElement(Button, { variant: 'danger' }, 'Delete'));
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-[#EF5350]');
  });

  it('renders with secondary variant', () => {
    const { container } = render(
      React.createElement(Button, { variant: 'secondary' }, 'Secondary'),
    );
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-white/[0.12]');
  });

  it('renders with ghost variant', () => {
    const { container } = render(React.createElement(Button, { variant: 'ghost' }, 'Ghost'));
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-transparent');
  });

  it('renders different sizes', () => {
    const { container: smContainer } = render(React.createElement(Button, { size: 'sm' }, 'Small'));
    expect(smContainer.querySelector('button')?.className).toContain('px-3 py-1.5');

    const { container: lgContainer } = render(React.createElement(Button, { size: 'lg' }, 'Large'));
    expect(lgContainer.querySelector('button')?.className).toContain('px-6 py-3');
  });

  it('renders as disabled', () => {
    const { container } = render(React.createElement(Button, { disabled: true }, 'Disabled'));
    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(React.createElement(Card, null, 'Card content'));
    expect(screen.getByText('Card content')).toBeDefined();
  });

  it('renders with default variant', () => {
    const { container } = render(React.createElement(Card, null, 'Test'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('bg-white/[0.06]');
  });

  it('renders with neon variant', () => {
    const { container } = render(React.createElement(Card, { variant: 'neon' }, 'Neon'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('border-[#1565C0]');
  });

  it('renders with elevated variant', () => {
    const { container } = render(React.createElement(Card, { variant: 'elevated' }, 'Elevated'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('bg-white/[0.08]');
  });

  it('renders with outlined variant', () => {
    const { container } = render(React.createElement(Card, { variant: 'outlined' }, 'Outlined'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('bg-transparent');
  });

  it('applies glow when enabled', () => {
    const { container } = render(React.createElement(Card, { glow: true }, 'Glowing'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('hover:shadow');
  });
});

describe('Badge', () => {
  it('renders text content', () => {
    render(React.createElement(Badge, null, 'Active'));
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders with success variant', () => {
    const { container } = render(React.createElement(Badge, { variant: 'success' }, 'OK'));
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-[#4CAF50]');
  });

  it('renders with error variant', () => {
    const { container } = render(React.createElement(Badge, { variant: 'error' }, 'Error'));
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-[#EF5350]');
  });

  it('renders with neon variant', () => {
    const { container } = render(React.createElement(Badge, { variant: 'neon' }, 'Neon'));
    const span = container.querySelector('span');
    expect(span?.className).toContain('shadow-');
  });

  it('renders small and medium sizes', () => {
    const { container: sm } = render(React.createElement(Badge, { size: 'sm' }, 'S'));
    expect(sm.querySelector('span')?.className).toContain('px-2 py-0.5');

    const { container: md } = render(React.createElement(Badge, { size: 'md' }, 'M'));
    expect(md.querySelector('span')?.className).toContain('px-3 py-1');
  });
});

describe('Input', () => {
  it('renders an input element', () => {
    const { container } = render(React.createElement(Input));
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('renders with a label', () => {
    render(React.createElement(Input, { label: 'Email' }));
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('displays error message', () => {
    render(React.createElement(Input, { error: 'Required field' }));
    expect(screen.getByText('Required field')).toBeDefined();
  });

  it('renders with neon variant', () => {
    const { container } = render(React.createElement(Input, { variant: 'neon' }));
    const input = container.querySelector('input');
    expect(input?.className).toContain('border-[#1565C0]');
  });
});

describe('Panel', () => {
  it('renders with title', () => {
    render(React.createElement(Panel, { title: 'Test Panel' }, 'Content'));
    expect(screen.getByText('Test Panel')).toBeDefined();
  });

  it('renders with subtitle', () => {
    render(React.createElement(Panel, { title: 'Main', subtitle: 'Sub text' }, 'Content'));
    expect(screen.getByText('Sub text')).toBeDefined();
  });

  it('renders children', () => {
    render(React.createElement(Panel, { title: 'T' }, 'Panel body'));
    expect(screen.getByText('Panel body')).toBeDefined();
  });

  it('renders actions', () => {
    render(
      React.createElement(
        Panel,
        { title: 'T', actions: React.createElement('button', null, 'Action') },
        'Content',
      ),
    );
    expect(screen.getByText('Action')).toBeDefined();
  });

  it('renders neon variant', () => {
    const { container } = render(React.createElement(Panel, { title: 'T', variant: 'neon' }, 'X'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('border-[#1565C0]');
  });
});

describe('Select', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  it('renders select element with options', () => {
    const { container } = render(React.createElement(Select, { options }));
    const select = container.querySelector('select');
    expect(select).not.toBeNull();
    expect(select?.querySelectorAll('option').length).toBe(2);
  });

  it('renders with a label', () => {
    render(React.createElement(Select, { options, label: 'Choose' }));
    expect(screen.getByText('Choose')).toBeDefined();
  });

  it('displays error message', () => {
    render(React.createElement(Select, { options, error: 'Invalid' }));
    expect(screen.getByText('Invalid')).toBeDefined();
  });
});

describe('Textarea', () => {
  it('renders a textarea element', () => {
    const { container } = render(React.createElement(Textarea));
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('renders with a label', () => {
    render(React.createElement(Textarea, { label: 'Description' }));
    expect(screen.getByText('Description')).toBeDefined();
  });

  it('displays error message', () => {
    render(React.createElement(Textarea, { error: 'Too short' }));
    expect(screen.getByText('Too short')).toBeDefined();
  });
});

describe('Modal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      React.createElement(Modal, {
        open: false,
        onClose: () => {},
        title: 'Test',
        children: 'Modal body',
      }),
    );
    expect(container.querySelector('.fixed')).toBeNull();
  });

  it('renders when open', () => {
    render(
      React.createElement(Modal, {
        open: true,
        onClose: () => {},
        title: 'Test Modal',
        children: 'Modal content',
      }),
    );
    expect(screen.getByText('Test Modal')).toBeDefined();
    expect(screen.getByText('Modal content')).toBeDefined();
  });
});

describe('Tabs', () => {
  const tabs = [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
  ];

  it('renders all tab labels', () => {
    render(React.createElement(Tabs, { tabs }));
    expect(screen.getByText('Tab 1')).toBeDefined();
    expect(screen.getByText('Tab 2')).toBeDefined();
  });

  it('renders first tab content by default', () => {
    render(React.createElement(Tabs, { tabs }));
    expect(screen.getByText('Content 1')).toBeDefined();
  });

  it('renders with a specified default tab', () => {
    render(React.createElement(Tabs, { tabs, defaultTab: 'tab2' }));
    expect(screen.getByText('Content 2')).toBeDefined();
  });

  it('renders neon variant with neon border', () => {
    const { container } = render(React.createElement(Tabs, { tabs, variant: 'neon' }));
    const tabBar = container.querySelector('div.border-b');
    expect(tabBar?.className).toContain('border-[#1565C0]/30');
  });
});

describe('Progress', () => {
  it('renders a progress bar', () => {
    const { container } = render(React.createElement(Progress, { value: 50 }));
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);
  });

  it('shows label when enabled', () => {
    render(React.createElement(Progress, { value: 75, showLabel: true }));
    expect(screen.getByText('75%')).toBeDefined();
    expect(screen.getByText('75 / 100')).toBeDefined();
  });

  it('clamps values to 0-100', () => {
    const { container: over } = render(React.createElement(Progress, { value: 200 }));
    const fill = over.querySelector('.h-full');
    expect(fill?.getAttribute('style')).toContain('width: 100%');
  });
});

describe('StatusDot', () => {
  it('renders active status', () => {
    const { container } = render(React.createElement(StatusDot, { status: 'active' }));
    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-[#4CAF50]');
  });

  it('renders error status', () => {
    const { container } = render(React.createElement(StatusDot, { status: 'error' }));
    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-[#EF5350]');
  });

  it('renders label text', () => {
    render(React.createElement(StatusDot, { status: 'active', label: 'Online' }));
    expect(screen.getByText('Online')).toBeDefined();
  });
});

describe('NeonBorder', () => {
  it('renders children', () => {
    render(React.createElement(NeonBorder, null, 'Bordered content'));
    expect(screen.getByText('Bordered content')).toBeDefined();
  });

  it('applies glass border by default', () => {
    const { container } = render(React.createElement(NeonBorder, null, 'X'));
    const div = container.querySelector('div');
    expect(div?.style.border).toBeDefined();
  });

  it('applies purple accent color', () => {
    const { container } = render(React.createElement(NeonBorder, { color: 'purple' }, 'X'));
    const div = container.querySelector('div');
    expect(div?.className).toContain('backdrop-blur');
  });

  it('applies custom thickness', () => {
    const { container } = render(React.createElement(NeonBorder, { thickness: 4 }, 'X'));
    const div = container.querySelector('div');
    expect(div?.style.border).toContain('4px');
  });

  it('applies custom thickness', () => {
    const { container } = render(React.createElement(NeonBorder, { thickness: 4 }, 'X'));
    const div = container.querySelector('div');
    expect(div?.style.border).toContain('4px');
  });
});

describe('CircuitGrid', () => {
  it('renders a gradient background', () => {
    const { container } = render(React.createElement(CircuitGrid));
    const div = container.querySelector('div');
    expect(div).not.toBeNull();
  });

  it('applies custom opacity', () => {
    const { container } = render(React.createElement(CircuitGrid, { opacity: 0.1 }));
    const wrapper = container.querySelector('div');
    expect(wrapper?.style.opacity).toBe('0.1');
  });
});



describe('GlowingCard', () => {
  it('renders children', () => {
    render(React.createElement(GlowingCard, null, 'Glowing'));
    expect(screen.getByText('Glowing')).toBeDefined();
  });

  it('applies blue glow by default', () => {
    const { container } = render(React.createElement(GlowingCard, null, 'X'));
    const div = container.querySelector('div');
    expect(div?.style.border).toBeDefined();
  });

  it('applies high intensity', () => {
    const { container } = render(React.createElement(GlowingCard, { intensity: 'high' }, 'X'));
    const div = container.querySelector('div');
    expect(div?.style.boxShadow).toBeDefined();
  });
});

describe('QuotePanel', () => {
  it('renders quote values', () => {
    render(
      React.createElement(QuotePanel, {
        lowQuote: 800,
        midQuote: 1000,
        highQuote: 1250,
        confidence: 'high',
        assumptions: ['Test assumption'],
        isEstimate: true,
      }),
    );
    expect(screen.getByText('Low')).toBeDefined();
    expect(screen.getByText('Expected')).toBeDefined();
    expect(screen.getByText('High')).toBeDefined();
  });

  it('shows rough estimate badge when estimate', () => {
    render(
      React.createElement(QuotePanel, {
        lowQuote: 100,
        midQuote: 200,
        highQuote: 300,
        confidence: 'low',
        assumptions: [],
        isEstimate: true,
      }),
    );
    expect(screen.getByText('Rough Estimate')).toBeDefined();
  });

  it('renders assumptions', () => {
    render(
      React.createElement(QuotePanel, {
        lowQuote: 100,
        midQuote: 200,
        highQuote: 300,
        confidence: 'medium',
        assumptions: ['Price is estimated', 'Based on 100 units'],
        isEstimate: false,
      }),
    );
    expect(screen.getByText('Price is estimated')).toBeDefined();
    expect(screen.getByText('Based on 100 units')).toBeDefined();
  });

  it('renders request quote button when handler provided', () => {
    render(
      React.createElement(QuotePanel, {
        lowQuote: 100,
        midQuote: 200,
        highQuote: 300,
        confidence: 'high',
        assumptions: [],
        isEstimate: false,
        onRequestQuote: () => {},
      }),
    );
    expect(screen.getByText('Request Detailed Quote')).toBeDefined();
  });
});

describe('BOMTable', () => {
  const rows = [
    {
      reference: 'R1',
      value: '10k',
      mpn: 'RC0402JR-0710KL',
      manufacturer: 'Yageo',
      quantity: 4,
      unitPrice: 0.01,
      riskLevel: 'low' as const,
      lifecycle: 'active',
    },
    {
      reference: 'U1',
      value: 'STM32F103',
      mpn: 'STM32F103C8T6',
      manufacturer: 'STMicroelectronics',
      quantity: 1,
      unitPrice: null,
      riskLevel: 'high' as const,
      lifecycle: 'active',
    },
  ];

  it('renders table headers', () => {
    render(React.createElement(BOMTable, { rows, isEstimate: false }));
    expect(screen.getByText('Ref')).toBeDefined();
    expect(screen.getByText('Value')).toBeDefined();
    expect(screen.getByText('MPN')).toBeDefined();
    expect(screen.getByText('Manufacturer')).toBeDefined();
    expect(screen.getByText('Qty')).toBeDefined();
    expect(screen.getByText('Unit Price')).toBeDefined();
    expect(screen.getByText('Risk')).toBeDefined();
    expect(screen.getByText('Lifecycle')).toBeDefined();
  });

  it('renders BOM row data', () => {
    render(React.createElement(BOMTable, { rows, isEstimate: false }));
    expect(screen.getByText('R1')).toBeDefined();
    expect(screen.getByText('10k')).toBeDefined();
    expect(screen.getByText('STM32F103C8T6')).toBeDefined();
  });

  it('shows TBD for null prices in estimate mode', () => {
    render(React.createElement(BOMTable, { rows, isEstimate: true }));
    expect(screen.getByText('TBD')).toBeDefined();
  });

  it('shows N/A for null prices in non-estimate mode', () => {
    render(React.createElement(BOMTable, { rows, isEstimate: false }));
    expect(screen.getByText('N/A')).toBeDefined();
  });

  it('renders risk badges', () => {
    render(React.createElement(BOMTable, { rows, isEstimate: false }));
    expect(screen.getByText('Low')).toBeDefined();
    expect(screen.getByText('High')).toBeDefined();
  });
});

describe('PreviewPanel', () => {
  it('renders schematic type label', () => {
    render(React.createElement(PreviewPanel, { type: 'schematic' }));
    expect(screen.getByText('Schematic')).toBeDefined();
  });

  it('renders pcb2d type label', () => {
    render(React.createElement(PreviewPanel, { type: 'pcb2d' }));
    expect(screen.getByText('PCB Layout (2D)')).toBeDefined();
  });

  it('renders pcb3d type label', () => {
    render(React.createElement(PreviewPanel, { type: 'pcb3d' }));
    expect(screen.getByText('PCB Preview (3D)')).toBeDefined();
  });

  it('shows loading state', () => {
    render(React.createElement(PreviewPanel, { type: 'schematic', loading: true }));
    expect(screen.getByText('Loading preview...')).toBeDefined();
  });

  it('shows error state', () => {
    render(React.createElement(PreviewPanel, { type: 'schematic', error: 'Failed to render' }));
    expect(screen.getByText('Failed to render')).toBeDefined();
  });

  it('shows empty state when no preview available', () => {
    render(React.createElement(PreviewPanel, { type: 'schematic' }));
    expect(screen.getByText('No preview available')).toBeDefined();
  });

  it('renders image when imageUrl provided', () => {
    const { container } = render(
      React.createElement(PreviewPanel, { type: 'schematic', imageUrl: '/test.svg' }),
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/test.svg');
  });
});

describe('AgentAccordion', () => {
  const steps = [
    { label: 'Step 1', status: 'complete' as const },
    { label: 'Step 2', status: 'running' as const, thinking: 'Analyzing...' },
    { label: 'Step 3', status: 'pending' as const, result: '# Result\nSome **bold** text' },
    { label: 'Step 4', status: 'error' as const, thinking: 'Failed', result: 'Error message' },
  ];

  it('renders all step labels', () => {
    render(React.createElement(AgentAccordion, { steps }));
    expect(screen.getByText('Step 1')).toBeDefined();
    expect(screen.getByText('Step 2')).toBeDefined();
    expect(screen.getByText('Step 3')).toBeDefined();
    expect(screen.getByText('Step 4')).toBeDefined();
  });

  it('renders with correct status data attributes', () => {
    render(React.createElement(AgentAccordion, { steps }));
    expect(screen.getByTestId('agent-step-0').getAttribute('data-status')).toBe('complete');
    expect(screen.getByTestId('agent-step-1').getAttribute('data-status')).toBe('running');
    expect(screen.getByTestId('agent-step-2').getAttribute('data-status')).toBe('pending');
    expect(screen.getByTestId('agent-step-3').getAttribute('data-status')).toBe('error');
  });

  it('steps are collapsed by default', () => {
    render(React.createElement(AgentAccordion, { steps }));
    expect(screen.getByTestId('agent-step-0').getAttribute('data-expanded')).toBe('false');
    expect(screen.getByTestId('agent-step-1').getAttribute('data-expanded')).toBe('false');
  });

  it('expands step on header click', () => {
    render(React.createElement(AgentAccordion, { steps }));
    const header = screen.getByTestId('agent-step-header-1');
    header.click();
    expect(screen.getByTestId('agent-step-1').getAttribute('data-expanded')).toBe('true');
  });

  it('collapses expanded step on second click', () => {
    render(React.createElement(AgentAccordion, { steps }));
    const header = screen.getByTestId('agent-step-header-1');
    header.click();
    header.click();
    expect(screen.getByTestId('agent-step-1').getAttribute('data-expanded')).toBe('false');
  });

  it('shows thinking text when expanded', () => {
    render(React.createElement(AgentAccordion, { steps }));
    screen.getByTestId('agent-step-header-1').click();
    expect(screen.getByText('Analyzing...')).toBeDefined();
  });

  it('shows result markdown when expanded', () => {
    render(React.createElement(AgentAccordion, { steps }));
    screen.getByTestId('agent-step-header-2').click();
    expect(screen.getByText('Result')).toBeDefined();
  });

  it('calls onStepClick when header is clicked', () => {
    const onStepClick = vi.fn();
    render(React.createElement(AgentAccordion, { steps, onStepClick }));
    screen.getByTestId('agent-step-header-0').click();
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('applies activeStep highlighting', () => {
    const { container } = render(
      React.createElement(AgentAccordion, { steps, activeStep: 1 }),
    );
    const activeHeader = container.querySelector('[data-testid="agent-step-header-1"]');
    expect(activeHeader?.className).toContain('bg-white/[0.02]');
  });

  it('applies pulse-glass animation to running step', () => {
    const { container } = render(React.createElement(AgentAccordion, { steps }));
    const runningStep = container.querySelector('[data-testid="agent-step-1"]');
    expect(runningStep?.className).toContain('animate-pulse-glass');
  });

  it('uses glass-elevated when expanded', () => {
    render(React.createElement(AgentAccordion, { steps }));
    screen.getByTestId('agent-step-header-0').click();
    const step = screen.getByTestId('agent-step-0');
    expect(step.className).toContain('glass-elevated');
  });

  it('uses glass-surface when collapsed', () => {
    render(React.createElement(AgentAccordion, { steps }));
    const step = screen.getByTestId('agent-step-0');
    expect(step.className).toContain('glass-surface');
  });
});
