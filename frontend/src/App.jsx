import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';

/**
 * Root application component.
 * Route guards (PrivateRoute / RoleRoute) are added to AppRoutes in M5
 * once auth session state exists — all routes are public for now.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
