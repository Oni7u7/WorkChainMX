import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extiende Vitest con los matchers de jest-dom
expect.extend(matchers);

// Limpia después de cada prueba
afterEach(() => {
  cleanup();
}); 