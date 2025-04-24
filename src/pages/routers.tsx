import { Route, Routes } from 'react-router-dom';

import Swap from './swap/swap';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Swap />} />
    </Routes>
  );
}
