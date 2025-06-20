import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Home.jsx';
import Payment from './Payment.jsx';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            
            <Home />
          </>
        } />
        <Route path="/payment" element={<Payment />} />
        
      </Routes>
    </Router>
  );
}


export default App;


