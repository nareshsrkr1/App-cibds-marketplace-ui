import { setupServer } from 'msw/node';
import { landingHandlers } from './handlers';

export const server = setupServer(...landingHandlers);
