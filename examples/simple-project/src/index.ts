import { renderHome } from './pages/home';
import type { User } from './types/user';

const activeUser: User = {
  id: 'usr-1',
  name: 'Alice',
  role: 'admin'
};

console.log(renderHome(activeUser));
