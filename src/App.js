import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import Dashboard from './component/dashboard';

function App() {
  return (
    <Router>
      <div className='bg-dark'>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />}/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
