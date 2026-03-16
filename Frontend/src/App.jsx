import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './booking-frontend/pages/Home';
import CreateBooking from './booking-frontend/pages/CreateBooking';
import BookingList from './booking-frontend/pages/BookingList';
import UserBookings from './booking-frontend/pages/UserBookings';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <NavLink to="/" className="nav-brand">MovieTickets</NavLink>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive && window.location.pathname === '/' ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/bookings/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Book Ticlets</NavLink>
          <NavLink to="/bookings/manage" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Manage Bookings</NavLink>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookings/new" element={<CreateBooking />} />
          <Route path="/bookings/manage" element={<BookingList />} />
          <Route path="/bookings/user/:userId" element={<UserBookings />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
