import { MENU } from '../config/menu';
import { UiMode } from '../config/menu';

export const routePolicyMap = new Map<string, UiMode[]>(
  MENU
    .filter(item => item.type === 'item') // 👈 IMPORTANTÍSIMO (evita divider)
    .map(item => [item.route, item.modes ?? []])
);