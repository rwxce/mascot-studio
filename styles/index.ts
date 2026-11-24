// Every style, by id. A mascot picks one with "style"; the gallery shows them all.
import type { Style } from '../kit/style.js';
import { ink } from './ink/index.js';
import { softGradient } from './soft-gradient/index.js';

export const styles: Style[] = [softGradient, ink];
export const styleById: Record<string, Style> = Object.fromEntries(styles.map((s) => [s.id, s]));
