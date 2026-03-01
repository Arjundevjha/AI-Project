import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DebateProvider } from './context/DebateContext';
import ModelPicker from './pages/ModelPicker';
import SenateChamber from './pages/SenateChamber';
import DeliberationRoom from './pages/DeliberationRoom';
import VerdictHall from './pages/VerdictHall';

function App() {
  return (
    <DebateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModelPicker />} />
          <Route path="/chamber" element={<SenateChamber />} />
          <Route path="/deliberation" element={<DeliberationRoom />} />
          <Route path="/verdict" element={<VerdictHall />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DebateProvider>
  );
}

export default App;
