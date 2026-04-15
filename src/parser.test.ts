import { describe, it, expect } from 'vitest';
import { parseFragment, mergeFragmentWithOptions } from './parser.js';

describe('parseFragment', () => {
  it('should parse simple body', () => {
    const text = 'Just a simple body';
    const result = parseFragment(text);
    expect(result).toEqual({ version: undefined, section: undefined, kind: undefined, body: 'Just a simple body' });
  });

  it('should parse kind: body', () => {
    const text = 'feat: New feature description';
    const result = parseFragment(text);
    expect(result).toEqual({ version: undefined, section: undefined, kind: 'feat', body: 'New feature description' });
  });

  it('should parse section and kind', () => {
    const text = '### Frontend\n- feat: New feature description';
    const result = parseFragment(text);
    expect(result).toEqual({ version: undefined, section: 'Frontend', kind: 'feat', body: 'New feature description' });
  });

  it('should parse full fragment with version', () => {
    const text = '## 1.2.0\n### Frontend\n- feat: New feature description';
    const result = parseFragment(text);
    expect(result).toEqual({ version: '1.2.0', section: 'Frontend', kind: 'feat', body: 'New feature description' });
  });

  it('should handle markdown list markers', () => {
    const text = '- My item';
    const result = parseFragment(text);
    expect(result.body).toBe('My item');
  });
});

describe('mergeFragmentWithOptions', () => {
  it('should override fragment with options', () => {
    const fragment = { version: '1.0.0', section: 'Old', body: 'Old Body' };
    const options = { versionNum: '2.0.0', section: 'New' };
    const result = mergeFragmentWithOptions(fragment, options);
    expect(result).toEqual({ version: '2.0.0', section: 'New', kind: undefined, body: 'Old Body' });
  });
});
