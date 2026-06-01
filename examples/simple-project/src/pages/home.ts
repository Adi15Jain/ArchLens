import { renderButton } from '../components/button';
import { add } from '../utils/math';
import type { User } from '../types/user';

export function renderHome(user: User): string {
  const btn = renderButton(user);
  const total = add(5, 5);
  return `<div><h1>Home</h1>${btn}<p>Total: ${total}</p></div>`;
}
