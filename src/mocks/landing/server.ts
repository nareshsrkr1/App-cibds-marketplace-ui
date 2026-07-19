import { setupServer } from 'msw/node';
import { landingHandlers } from './handlers';
import { workspaceHandlers } from '../workspace/handlers';

export const server = setupServer(...landingHandlers, ...workspaceHandlers);
