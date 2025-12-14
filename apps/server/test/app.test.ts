import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app';

describe('createApp', () => {
  it('creates an express app', () => {
    const app = createApp();
    expect(typeof app).toBe('function');
  });
});
