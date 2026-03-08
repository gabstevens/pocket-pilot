import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TransactionProvider } from './context';
import BottomNavigation from './components/BottomNavigation';
import AddTransaction from './components/AddTransaction';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import ToastContainer from './components/ToastContainer';
import Dialog from './components/Dialog';

function App() {
  return (
    <TransactionProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="app">
          <Routes>
            <Route path="/" element={<Navigate to="/add" replace />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/stats" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <BottomNavigation />
          <ToastContainer />
          <Dialog />
        </div>
      </BrowserRouter>
    </TransactionProvider>
  );
}

export default App;
