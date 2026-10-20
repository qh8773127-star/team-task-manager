import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

const Dashboard = () => <div className="p-10 text-2xl">Dashboard (Coming Soon)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;