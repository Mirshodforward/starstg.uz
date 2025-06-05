import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Home.jsx';

import Header from './Header.jsx';
import Payment from './Payment.jsx';
import Pending from './Pending.jsx';
import Starsuccess from './Starsuccess.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <Home />
          </>
        } />
        <Route path="/payment" element={<Payment />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/starsuccess" element={<Starsuccess />} />
      </Routes>
    </Router>
  );
}


export default App;


