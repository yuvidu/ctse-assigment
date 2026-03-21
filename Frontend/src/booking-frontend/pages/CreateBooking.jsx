import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { bookingApi } from '../services/bookingApi';
import './CreateBooking.css';

export default function CreateBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SEAT_API_BASE_URL = 'http://localhost:8084';

  const [schedule, setSchedule] = useState(location.state?.schedule || null);
  const [movieTitle, setMovieTitle] = useState(location.state?.movieTitle || '');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatError, setSeatError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const scheduleId = query.get('scheduleId') || '';
  const movieId = query.get('movieId') || '';
  
  const [formData, setFormData] = useState({
    userId: localStorage.getItem('userId') || '',
    showId: schedule?.id || scheduleId || '',
    seats: '',
    ticketPrice: schedule?.price || 0,
    status: 'PENDING'
  });

  useEffect(() => {
    const nextShowId = schedule?.id || scheduleId || '';
    setFormData(prev => ({
      ...prev,
      userId: prev.userId || localStorage.getItem('userId') || '',
      showId: nextShowId
    }));
  }, [schedule?.id, scheduleId]);

  useEffect(() => {
    const fetchMissingData = async () => {
      try {
        if (!schedule && scheduleId) {
          const scheduleRes = await axios.get(`http://localhost:8087/schedules/${scheduleId}`);
          setSchedule(scheduleRes.data);
        }

        if (!movieTitle && movieId) {
          const movieRes = await axios.get(`http://localhost:8087/movies/${movieId}`);
          setMovieTitle(movieRes.data?.title || '');
        }
      } catch (err) {
        setError('Failed to load booking details. Please go back and try again.');
        console.error(err);
      }
    };

    fetchMissingData();
  }, [schedule, scheduleId, movieId, movieTitle]);

  useEffect(() => {
    const fetchAvailableSeats = async () => {
      const sid = schedule?.id || scheduleId;
      if (!sid) return;

      setSeatLoading(true);
      setSeatError('');

      try {
        const res = await axios.get(`${SEAT_API_BASE_URL}/seats/schedule/${sid}`);
        const seats = Array.isArray(res.data) ? res.data : [];
        setAvailableSeats(seats.filter(s => s?.available === true));
      } catch (err) {
        setSeatError('Failed to load available seats.');
        console.error(err);
      } finally {
        setSeatLoading(false);
      }
    };

    fetchAvailableSeats();
  }, [schedule?.id, scheduleId]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      seats: selectedSeats.join(', ')
    }));
  }, [selectedSeats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Transform seats to an array
      const bookingPayload = {
        ...formData,
        seats: formData.seats.split(',').map(s => s.trim())
      };

      await bookingApi.createBooking(bookingPayload);

      const sid = schedule?.id || scheduleId || formData.showId;
      if (sid && bookingPayload.seats?.length) {
        try {
          await axios.post(`${SEAT_API_BASE_URL}/seats/unavailable`, {
            scheduleId: sid,
            seatNumbers: bookingPayload.seats
          });
        } catch (seatErr) {
          console.error(seatErr);
        }
      }
      navigate('/bookings/manage');
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelectChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedSeats(values);
  };

  return (
    <div className="animate-fade-in create-booking-container">
      <div className="page-header">
        <h1 className="page-title">Create New Booking</h1>
        <p className="page-description">Fill in the details below to complete your reservation.</p>
      </div>

      <div className="card">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Movie</label>
            <input
              type="text"
              value={movieTitle || (movieId ? movieId : '')}
              readOnly
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hall</label>
            <input
              type="text"
              value={schedule?.hallId || ''}
              readOnly
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="text"
              value={schedule?.date || ''}
              readOnly
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              type="text"
              value={schedule?.time || ''}
              readOnly
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ticket Price</label>
            <input
              type="text"
              value={formData.ticketPrice}
              readOnly
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available Seats</label>
            <input
              type="text"
              value={seatLoading ? 'Loading...' : (availableSeats.length ? availableSeats.length : (schedule?.availableSeats ?? ''))}
              readOnly
              className="form-input"
            />
          </div>
        </div>

        {seatError && (
          <div className="error-message">
            {seatError}
          </div>
        )}

        {availableSeats.length > 0 && (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Select Seats</label>
            <select
              multiple
              className="form-input"
              value={selectedSeats}
              onChange={handleSeatSelectChange}
              style={{ minHeight: '140px' }}
            >
              {availableSeats.map((seat) => (
                <option key={seat.id || seat.seatNumber} value={seat.seatNumber}>
                  {seat.seatNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2">
          <div className="form-group">
            <label className="form-label">User ID</label>
            <input 
              required type="text" name="userId" value={formData.userId} onChange={handleChange}
              className="form-input" placeholder="e.g. U123" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Show ID</label>
            <input 
              required type="text" name="showId" value={formData.showId} onChange={handleChange}
              className="form-input" placeholder="e.g. S456" 
            />
          </div>

          <div className="form-group form-grid-full">
            <label className="form-label">Selected Seats (comma separated)</label>
            <input 
              required type="text" name="seats" value={formData.seats} onChange={handleChange}
              className="form-input" placeholder="A1, A2, B3" 
            />
          </div>

          <div className="form-group form-actions">
            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
