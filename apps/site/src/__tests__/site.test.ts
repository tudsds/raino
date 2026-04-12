import { describe, it, expect } from 'vitest';
import { siteConfig, generateMetadata } from '../lib/metadata';

describe('siteConfig', () => {
  it('has name set to Raino', () => {
    expect(siteConfig.name).toBe('Raino');
  });

  it('has description', () => {
    expect(siteConfig.description).toBeTruthy();
  });

  it('has a URL', () => {
    expect(siteConfig.url).toBe('https://raino.dev');
  });

  it('has a GitHub link', () => {
    expect(siteConfig.links.github).toContain('github.com');
  });

  it('has an OG image path', () => {
    expect(siteConfig.ogImage).toBe('/og-image.png');
  });
});

describe('generateMetadata', () => {
  it('returns default metadata with no arguments', () => {
    const meta = generateMetadata();
    expect(meta.title).toContain('Raino');
    expect(meta.description).toBeTruthy();
  });

  it('includes custom title in metadata', () => {
    const meta = generateMetadata({ title: 'Features' });
    expect(meta.title).toContain('Features');
    expect(meta.title).toContain('Raino');
  });

  it('includes custom description', () => {
    const meta = generateMetadata({ description: 'Custom description' });
    expect(meta.description).toBe('Custom description');
  });

  it('constructs correct URL from path', () => {
    const meta = generateMetadata({ path: '/features' });
    if (meta.openGraph && typeof meta.openGraph === 'object' && 'url' in meta.openGraph) {
      expect(meta.openGraph.url).toBe('https://raino.dev/features');
    }
  });

  it('includes OpenGraph metadata', () => {
    const meta = generateMetadata({ title: 'Test' });
    if (meta.openGraph && typeof meta.openGraph === 'object') {
      expect(meta.openGraph).toHaveProperty('title');
      expect(meta.openGraph).toHaveProperty('description');
    }
  });

  it('includes Twitter card metadata', () => {
    const meta = generateMetadata({ title: 'Test' });
    if (meta.twitter && typeof meta.twitter === 'object') {
      expect(meta.twitter).toHaveProperty('card');
    }
  });

  it('includes relevant keywords', () => {
    const meta = generateMetadata();
    expect(meta.keywords).toBeDefined();
    const keywords = meta.keywords as string[];
    expect(keywords).toContain('PCB');
    expect(keywords).toContain('KiCad');
  });
});
