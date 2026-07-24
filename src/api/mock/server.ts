import { setupServer } from 'msw/node';
import { catalogueHandlers } from './handlers/catalogue.handlers';
import { landingHandlers } from './handlers/landing.handlers';
import { workspaceHandlers } from './handlers/workspace.handlers';

export const server = setupServer(...landingHandlers, ...workspaceHandlers, ...catalogueHandlers);
