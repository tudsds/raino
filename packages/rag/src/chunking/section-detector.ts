// ── Section Detector ──────────────────────────────────────────────────────────
// Identifies semantic section boundaries in engineering documents (datasheets,
// errata, application notes) and maps them to ChunkType values.

import type { ChunkType } from '../storage/types';

/** A detected section boundary within a document. */
export interface SectionBoundary {
  /** Character offset where this section begins (inclusive). */
  start: number;
  /** Character offset where this section ends (exclusive). */
  end: number;
  /** The semantic category for this section. */
  type: ChunkType;
  /** The raw header text that was matched. */
  title: string;
}

// ── Section Pattern Definitions ───────────────────────────────────────────────
// Each entry is [regex_pattern, chunk_type].
// Patterns are matched case-insensitively against line text.

type PatternEntry = readonly [string, ChunkType];

const SECTION_PATTERNS: readonly PatternEntry[] = [
  // Absolute maximum ratings
  ['absolute\\s+maximum\\s+ratings?', 'absolute_max_ratings'],
  ['maximum\\s+ratings?', 'absolute_max_ratings'],
  ['absolute\\s+maximum', 'absolute_max_ratings'],
  ['thermal\\s+characteristics', 'absolute_max_ratings'],
  ['thermal\\s+resistance', 'absolute_max_ratings'],

  // Recommended operating conditions
  ['recommended\\s+operating\\s+conditions?', 'recommended_operating_conditions'],
  ['operating\\s+conditions?', 'recommended_operating_conditions'],
  ['dc\\s+characteristics?', 'recommended_operating_conditions'],
  ['electrical\\s+characteristics?', 'recommended_operating_conditions'],
  ['supply\\s+voltage', 'recommended_operating_conditions'],
  ['voltage\\s+range', 'recommended_operating_conditions'],

  // Power requirements
  ['power\\s+(requirements?|consumption|dissipation|budget)', 'power_requirements'],
  ['power\\s+supply', 'power_requirements'],
  ['current\\s+consumption', 'power_requirements'],
  ['supply\\s+current', 'power_requirements'],
  ['power\\s+management', 'power_requirements'],
  ['vdd\\s+and\\s+vssa', 'power_requirements'],

  // Pin description
  ['pin\\s+(description|assignment|out|definition|configuration)', 'pin_description'],
  ['pinout', 'pin_description'],
  ['pin\\s+diagram', 'pin_description'],
  ['signal\\s+description', 'pin_description'],
  ['terminal\\s+(description|assignment)', 'pin_description'],
  ['ball\\s+map', 'pin_description'],
  ['lead\\s+description', 'pin_description'],

  // Boot configuration
  ['boot\\s+(configuration|mode|options?|pins?)', 'boot_configuration'],
  ['startup\\s+(configuration|mode)', 'boot_configuration'],
  ['boot\\s+loader', 'boot_configuration'],
  ['boot0', 'boot_configuration'],
  ['system\\s+memory\\s+boot', 'boot_configuration'],

  // Clock tree
  ['clock\\s+(tree|configuration|setup|distribution|source)', 'clock_tree'],
  ['clock\\s+generation', 'clock_tree'],
  ['pll\\s+configuration', 'clock_tree'],
  ['clock\\s+and\\s+reset', 'clock_tree'],
  ['hse\\s+and\\s+hsi', 'clock_tree'],
  ['internal\\s+rc', 'clock_tree'],
  ['oscillator\\s+(configuration|setup)', 'clock_tree'],

  // Reset guidelines
  ['reset\\s+(guidelines?|procedure|configuration|sources?|sequence)', 'reset_guidelines'],
  ['system\\s+reset', 'reset_guidelines'],
  ['power-on\\s+reset', 'reset_guidelines'],
  ['brown-out\\s+reset', 'reset_guidelines'],
  ['watchdog\\s+reset', 'reset_guidelines'],

  // USB guidelines
  ['usb\\s+(guidelines?|interface|configuration|setup|hardware)', 'usb_guidelines'],
  ['usb\\s+(otg|device|host)', 'usb_guidelines'],
  ['usb\\s+dp', 'usb_guidelines'],
  ['full-speed\\s+usb', 'usb_guidelines'],

  // ADC considerations
  ['adc\\s+(considerations?|characteristics?|configuration|setup|input)', 'adc_considerations'],
  ['analog\\s+(to\\s+)?digital\\s+convert', 'adc_considerations'],
  ['dac\\s+(characteristics?|configuration|setup|output)', 'adc_considerations'],
  ['sample\\s+and\\s+hold', 'adc_considerations'],
  ['analog\\s+input', 'adc_considerations'],

  // PCB layout
  ['(recommended\\s+)?pcb\\s+layout', 'recommended_pcb_layout'],
  ['layout\\s+(guidelines?|recommendations?|considerations?)', 'recommended_pcb_layout'],
  ['board\\s+layout', 'recommended_pcb_layout'],
  ['land\\s+pattern', 'recommended_pcb_layout'],
  ['soldering\\s+(recommendations?|guidelines?|information)', 'recommended_pcb_layout'],
  ['thermal\\s+(pad|via|layout)', 'recommended_pcb_layout'],
  ['decoupling\\s+capacitor', 'recommended_pcb_layout'],

  // Package outline
  ['package\\s+(outline|information|dimensions?|mechanicals?)', 'package_outline'],
  ['mechanical\\s+(data|dimensions?|drawing)', 'package_outline'],
  ['package\\s+type', 'package_outline'],
  ['encapsulation', 'package_outline'],
  ['marking\\s+(information|diagram)', 'package_outline'],
  ['tape\\s+and\\s+reel', 'package_outline'],

  // Errata items
  ['errata', 'errata_item'],
  ['known\\s+(bugs?|issues?|limitations?|errors?)', 'errata_item'],
  ['silicon\\s+(errata|bug|revision)', 'errata_item'],
  ['device\\s+revision', 'errata_item'],
  ['workaround', 'errata_item'],

  // Reference circuit
  ['reference\\s+(circuit|design|schematic)', 'reference_circuit'],
  ['application\\s+(circuit|example|schematic)', 'reference_circuit'],
  ['typical\\s+application', 'reference_circuit'],
  ['example\\s+circuit', 'reference_circuit'],
  ['evaluation\\s+(circuit|board)', 'reference_circuit'],
  ['external\\s+component', 'reference_circuit'],
] as const;

// ── Detection ─────────────────────────────────────────────────────────────────

/**
 * Detect section boundaries in a document's text content.
 *
 * Scans line-by-line for known engineering section headers and returns
 * the boundaries with their mapped ChunkType. Unrecognized content
 * between detected sections is classified as 'general'.
 *
 * @param text - The full normalized text of the document.
 * @param sectionPatterns - Optional override patterns for testing.
 * @returns Array of SectionBoundary objects sorted by start offset.
 */
export function detectSections(
  text: string,
  sectionPatterns: readonly PatternEntry[] = SECTION_PATTERNS,
): SectionBoundary[] {
  const lines = text.split('\n');
  const matches: Array<{ lineIndex: number; charOffset: number; type: ChunkType; title: string }> =
    [];

  let charOffset = 0;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]!;
    const trimmed = line.trim();

    if (trimmed.length > 0) {
      for (const [pattern, type] of sectionPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(trimmed)) {
          matches.push({
            lineIndex,
            charOffset,
            type,
            title: trimmed,
          });
          break; // first matching pattern wins per line
        }
      }
    }

    charOffset += line.length + 1; // +1 for the '\n'
  }

  // If no sections detected at all, the entire document is 'general'
  if (matches.length === 0) {
    return [
      {
        start: 0,
        end: text.length,
        type: 'general',
        title: 'Document',
      },
    ];
  }

  // Build boundaries: each section runs from its start to the next section's start
  const boundaries: SectionBoundary[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]!;
    const nextOffset = i + 1 < matches.length ? matches[i + 1]!.charOffset : text.length;

    boundaries.push({
      start: current.charOffset,
      end: nextOffset,
      type: current.type,
      title: current.title,
    });
  }

  // If there's content before the first detected section, add it as 'general'
  if (matches[0]!.charOffset > 0) {
    boundaries.unshift({
      start: 0,
      end: matches[0]!.charOffset,
      type: 'general',
      title: 'Preamble',
    });
  }

  return boundaries;
}
