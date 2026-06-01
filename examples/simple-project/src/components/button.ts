import type { User } from '../types/user';
import { add } from '../utils/math';

export function renderButton(user: User): string {
  const score = add(10, 20);
  return `<button>Hello ${user.name} (Score: ${score})</button>`;
}
