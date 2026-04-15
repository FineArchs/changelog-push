import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { ChangelogManager } from './manager.js';

describe('ChangelogManager', () => {
  const testFile = 'TEST_CHANGELOG.md';

  beforeEach(() => {
    fs.writeFileSync(testFile, '# Changelog\n\n## Unreleased\n', 'utf8');
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.removeSync(testFile);
    }
  });

  it('should push into Unreleased by default', async () => {
    const manager = new ChangelogManager(testFile);
    const fragment = { body: 'New feature' };
    const content = await manager.push(fragment, {});
    expect(content).toContain('## Unreleased\n\n- New feature');
  });

  it('should create new version if requested', async () => {
    const manager = new ChangelogManager(testFile);
    const fragment = { version: '1.2.3', body: 'First 1.2.3 feature' };
    const content = await manager.push(fragment, {});
    expect(content).toContain('## [1.2.3]');
    expect(content).toContain('- First 1.2.3 feature');
  });

  it('should throw VERSION_ALREADY_EXISTS when --new-version used with existing', async () => {
    fs.appendFileSync(testFile, '## [1.0.0]\n');
    const manager = new ChangelogManager(testFile);
    const fragment = { version: '1.0.0', body: 'Duplicate' };
    await expect(manager.push(fragment, { newVersion: true })).rejects.toThrow('VERSION_ALREADY_EXISTS: 1.0.0');
  });

  it('should throw VERSION_NOT_FOUND when --existing-version used with missing', async () => {
    const manager = new ChangelogManager(testFile);
    const fragment = { version: '2.0.0', body: 'Missing' };
    await expect(manager.push(fragment, { existingVersion: true })).rejects.toThrow('VERSION_NOT_FOUND: 2.0.0');
  });

  it('should add to specific section if specified', async () => {
    const manager = new ChangelogManager(testFile);
    const fragment = { section: 'Features', body: 'Added cool thing' };
    const content = await manager.push(fragment, {});
    expect(content).toContain('### Features\n- Added cool thing');
  });

  it('should handle kind prefix correctly', async () => {
    const manager = new ChangelogManager(testFile);
    const fragment = { kind: 'feat', body: 'Add kind' };
    const content = await manager.push(fragment, {});
    expect(content).toContain('- feat: Add kind');
  });

  it('should throw KIND_ALREADY_EXISTS when --new-kind used with existing', async () => {
    fs.appendFileSync(testFile, '### Features\n- feat: Existing\n');
    const manager = new ChangelogManager(testFile);
    const fragment = { section: 'Features', kind: 'feat', body: 'Should fail' };
    await expect(manager.push(fragment, { newKind: true })).rejects.toThrow('KIND_ALREADY_EXISTS: feat');
  });
});
