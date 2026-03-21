import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './MovieDetails.css';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieRes, schedulesRes] = await Promise.all([
          axios.get(`http://localhost:8087/movies/${id}`),
          axios.get(`http://localhost:8087/schedules/movie/${id}`)
        ]);
        
        setMovie(movieRes.data);
        setSchedules(schedulesRes.data);
      } catch (err) {
        console.error('Failed to fetch movie details', err);
        setError('Movie not found or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const filteredSchedules = useMemo(() => {
    if (!dateFilter) return schedules;
    return schedules.filter(s => s.date === dateFilter);
  }, [schedules, dateFilter]);

  if (loading) return <div className="container">Loading movie details...</div>;
  if (error) return (
    <div className="container text-center">
      <h2 className="text-danger">{error}</h2>
      <Link to="/movies" className="btn btn-primary mt-4">Back to Movies</Link>
    </div>
  );

  return (
    <div className="movie-details-page">
      {/* Cinematic Hero Backdrop */}
      <div className="movie-hero-backdrop" style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 15, 0.4), var(--bg-color)), url(${movie.backdropUrl || movie.posterUrl})` 
      }}>
        <div className="container hero-container">
          <Link to="/movies" className="back-btn">← Back</Link>
          
          <div className="movie-hero-content-wrapper">
            <div className="movie-hero-poster-box">
              <img src={movie.posterUrl} alt={movie.title} className="hero-poster-img" />
              <div className="hero-rating">⭐ {movie.rating}</div>
            </div>
            
            <div className="hero-text-details">
              <div className="hero-tags">
                <span className="badge badge-primary">{movie.genre}</span>
                <span className="badge badge-outline">{movie.status.replace('_', ' ')}</span>
              </div>
              <h1 className="hero-title">{movie.title}</h1>
              <div className="hero-meta-row">
                <span>⏱️ {movie.duration} min</span>
                <span>•</span>
                <span>🌐 {movie.language}</span>
                <span>•</span>
                <span>📅 {new Date(movie.releaseDate).getFullYear()}</span>
              </div>
              <p className="hero-description">{movie.description}</p>
              
              <div className="hero-credits">
                <div className="credit-item">
                  <span className="credit-label">Director</span>
                  <span className="credit-value">{movie.director}</span>
                </div>
                {movie.tmdbId && (
                  <div className="credit-item">
                    <span className="credit-label">TMDB ID</span>
                    <span className="credit-value">{movie.tmdbId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container main-content-grid">
        <div className="content-left">
          {/* Cast Section */}
          {movie.castDetails && movie.castDetails.length > 0 && (
            <section className="details-section">
              <h3 className="section-title">Top Cast</h3>
              <div className="cast-row-scroll">
                {movie.castDetails.map((person, index) => (
                  <div key={index} className="cast-card">
                    <img src={person.profilePath || 'https://via.placeholder.com/150x225?text=No+Photo'} alt={person.name} />
                    <div className="cast-card-info">
                      <div className="cast-name">{person.name}</div>
                      <div className="cast-char">{person.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Media Gallery */}
          {movie.additionalImages && movie.additionalImages.length > 0 && (
            <section className="details-section">
              <h3 className="section-title">Media Gallery</h3>
              <div className="media-gallery">
                {movie.additionalImages.map((img, index) => (
                  <img key={index} src={img} className="gallery-img" alt="Gallery" onClick={() => window.open(img, '_blank')} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Schedules Section */}
        <div className="schedules-view" id="schedules">
          <div className="schedules-section-header">
            <div>
              <h2 className="section-title" style={{ border: 'none', padding: 0 }}>Available Showings</h2>
              <p className="text-muted">Pick a time to book your seats</p>
            </div>
            <div className="schedule-filter">
              <label className="credit-label">Filter by Date</label>
              <input 
                type="date" 
                className="form-input" 
                style={{ width: '200px' }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="card text-center p-8" style={{ background: 'var(--surface-hover)' }}>
              <p className="text-muted">No showings scheduled {dateFilter ? `for ${new Date(dateFilter).toLocaleDateString()}` : 'yet'}.</p>
            </div>
          ) : (
            <div className="schedule-grid">
              {filteredSchedules.map(schedule => (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-card-header">
                    <span className="hall-name">{schedule.hallId}</span>
                    <span className="badge badge-outline">{new Date(schedule.date).toLocaleDateString()}</span>
                  </div>
                  <div className="schedule-time">{schedule.time}</div>
                  <div className="schedule-card-footer">
                    <div className="price-tag">
                      <span className="text-muted text-xs block">Tickets from</span>
                      <span className="text-main font-bold">${schedule.price.toFixed(2)}</span>
                    </div>
                    <Link 
                      to={`/bookings/new?scheduleId=${schedule.id}&movieId=${movie.id}`} 
                      state={{
                        schedule,
                        movieTitle: movie.title
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
