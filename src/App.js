import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css'; 
// ==================== КОМПОНЕНТЫ ====================

// Навигация
function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">🎬 Movie Library</Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/add-movie" className="nav-link">Добавить фильм</Link>
          <Link to="/about" className="nav-link">О проекте</Link>
        </div>
      </div>
    </nav>
  );
}

// Главная страница
function HomePage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedMovies = localStorage.getItem('movies');
    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    } else {
      // Начальные данные для тестирования
      const initialMovies = [
        {
          id: '1',
          title: 'Интерстеллар',
          director: 'Кристофер Нолан',
          year: 2014,
          genre: 'Фантастика, Драма',
          rating: 8.6,
          description: 'Фантастический эпос о путешествии группы исследователей.'
        },
        {
          id: '2',
          title: 'Крестный отец',
          director: 'Фрэнсис Форд Коппола',
          year: 1972,
          genre: 'Криминал, Драма',
          rating: 9.2,
          description: 'Стареющий патриарх организованной преступной династии.'
        },
        {
          id: '3',
          title: 'Побег из Шоушенка',
          director: 'Фрэнк Дарабонт',
          year: 1994,
          genre: 'Драма',
          rating: 9.3,
          description: 'Два заключенных завязывают дружбу на протяжении нескольких лет.'
        }
      ];
      setMovies(initialMovies);
      localStorage.setItem('movies', JSON.stringify(initialMovies));
    }
  }, []);

  const deleteMovie = (id) => {
    if (window.confirm('Удалить фильм из библиотеки?')) {
      const updatedMovies = movies.filter(movie => movie.id !== id);
      setMovies(updatedMovies);
      localStorage.setItem('movies', JSON.stringify(updatedMovies));
    }
  };

  const filteredMovies = search.trim() === '' 
    ? movies 
    : movies.filter(movie =>
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.director.toLowerCase().includes(search.toLowerCase()) ||
        movie.genre.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="container home-container">
      <h1 className="page-title">Моя библиотека фильмов</h1>
      <p className="page-subtitle">Управляйте вашей коллекцией фильмов</p>
      
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию, режиссеру или жанру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {filteredMovies.length === 0 ? (
        <div className="empty-state">
          <p>Фильмы не найдены</p>
          <Link to="/add-movie" className="btn btn-primary">
            Добавить первый фильм
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map(movie => (
            <div key={movie.id} className="movie-card">
              <div className="movie-header">
                <h3 className="movie-title">{movie.title}</h3>
                <div className="movie-meta">
                  <span>🎬 {movie.director}</span>
                  <span>📅 {movie.year}</span>
                  <span className="movie-rating">⭐ {movie.rating}/10</span>
                </div>
              </div>
              <div className="movie-content">
                <p className="movie-description">
                  {movie.description || 'Описание отсутствует'}
                </p>
                <div className="movie-actions">
                  <Link to={`/movie/${movie.id}`} className="btn btn-info">
                    Подробнее
                  </Link>
                  <div>
                    <Link to={`/edit-movie/${movie.id}`} className="btn btn-sm btn-edit">
                      ✏️
                    </Link>
                    <button 
                      onClick={() => deleteMovie(movie.id)}
                      className="btn btn-sm btn-delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Форма добавления/редактирования фильма
function MovieForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    year: new Date().getFullYear(),
    genre: '',
    rating: 5,
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedMovies = localStorage.getItem('movies');
    if (savedMovies) {
      const moviesArray = JSON.parse(savedMovies);
      setMovies(moviesArray);
      
      if (isEdit && id) {
        const movieToEdit = moviesArray.find(movie => movie.id === id);
        if (movieToEdit) {
          setFormData(movieToEdit);
        }
      }
    }
  }, [id, isEdit]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.director.trim()) newErrors.director = 'Режиссер обязателен';
    if (!formData.genre.trim()) newErrors.genre = 'Жанр обязателен';
    if (!formData.year || formData.year < 1888 || formData.year > new Date().getFullYear() + 5) {
      newErrors.year = 'Неверный год';
    }
    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Рейтинг должен быть от 0 до 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'rating' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const movieData = {
      ...formData,
      id: isEdit ? id : Date.now().toString()
    };

    let updatedMovies;
    if (isEdit) {
      updatedMovies = movies.map(movie => 
        movie.id === id ? movieData : movie
      );
    } else {
      updatedMovies = [...movies, movieData];
    }

    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    navigate(isEdit ? `/movie/${id}` : '/');
  };

  return (
    <div className="container">
      <h1 className="page-title">{isEdit ? 'Редактировать фильм' : 'Добавить новый фильм'}</h1>
      <p className="page-subtitle">{isEdit ? 'Обновите информацию о фильме' : 'Заполните все поля формы'}</p>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Название фильма *</label>
            <input
              type="text"
              name="title"
              className={`form-control ${errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: Интерстеллар"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Режиссер *</label>
              <input
                type="text"
                name="director"
                className={`form-control ${errors.director ? 'error' : ''}`}
                value={formData.director}
                onChange={handleChange}
                placeholder="Например: Кристофер Нолан"
              />
              {errors.director && <span className="error-message">{errors.director}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Год выпуска *</label>
              <input
                type="number"
                name="year"
                className={`form-control ${errors.year ? 'error' : ''}`}
                value={formData.year}
                onChange={handleChange}
                min="1888"
                max={new Date().getFullYear() + 5}
              />
              {errors.year && <span className="error-message">{errors.year}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Рейтинг (0-10) *</label>
              <input
                type="number"
                name="rating"
                className={`form-control ${errors.rating ? 'error' : ''}`}
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
              />
              {errors.rating && <span className="error-message">{errors.rating}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Жанр *</label>
            <input
              type="text"
              name="genre"
              className={`form-control ${errors.genre ? 'error' : ''}`}
              value={formData.genre}
              onChange={handleChange}
              placeholder="Например: Фантастика, Драма"
            />
            {errors.genre && <span className="error-message">{errors.genre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Описание фильма</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Опишите сюжет фильма..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Сохранить изменения' : 'Добавить фильм'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Страница деталей фильма
function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMovies = localStorage.getItem('movies');
    if (savedMovies) {
      const movies = JSON.parse(savedMovies);
      const foundMovie = movies.find(m => m.id === id);
      setMovie(foundMovie);
    }
    setLoading(false);
  }, [id]);

  const deleteMovie = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот фильм?')) {
      const savedMovies = localStorage.getItem('movies');
      if (savedMovies) {
        const movies = JSON.parse(savedMovies);
        const updatedMovies = movies.filter(m => m.id !== id);
        localStorage.setItem('movies', JSON.stringify(updatedMovies));
        navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>Фильм не найден</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="btn btn-back">
        ← Назад
      </button>
      
      <div className="movie-detail-container">
        <div className="detail-header">
          <h1 className="detail-title">{movie.title}</h1>
          <div className="detail-rating">⭐ {movie.rating}/10</div>
        </div>
        
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Режиссер:</span>
            {movie.director}
          </div>
          <div className="detail-item">
            <span className="detail-label">Год выпуска:</span>
            {movie.year}
          </div>
          <div className="detail-item">
            <span className="detail-label">Жанр:</span>
            {movie.genre}
          </div>
          <div className="detail-item">
            <span className="detail-label">ID фильма:</span>
            {movie.id}
          </div>
        </div>
        
        <div className="description-box">
          <h3>Описание</h3>
          <p>{movie.description || 'Описание отсутствует'}</p>
        </div>
        
        <div className="detail-actions">
          <Link to={`/edit-movie/${movie.id}`} className="btn btn-primary">
            Редактировать
          </Link>
          <button onClick={deleteMovie} className="btn btn-delete">
            Удалить фильм
          </button>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Назад к списку
          </button>
        </div>
      </div>
    </div>
  );
}

// Страница "О проекте"
function AboutPage() {
  return (
    <div className="container">
      <div className="about-container">
        <h1 className="page-title">О проекте Movie Library</h1>
        
        <div className="about-section">
          <h2>🎬 О приложении</h2>
          <p>
            Movie Library - это простое и удобное веб-приложение для управления 
            вашей личной коллекцией фильмов. Вы можете добавлять, редактировать, 
            просматривать и удалять фильмы из вашей библиотеки.
          </p>
        </div>
        
        <div className="about-section">
          <h2>✨ Основные функции</h2>
          <ul className="features-list">
            <li>Добавление новых фильмов с валидацией полей</li>
            <li>Редактирование существующих записей</li>
            <li>Просмотр детальной информации о фильме</li>
            <li>Удаление фильмов из коллекции</li>
            <li>Поиск по названию, режиссеру и жанру</li>
            <li>Локальное хранение данных в браузере</li>
            <li>Адаптивный дизайн для мобильных устройств</li>
          </ul>
        </div>
        
        <div className="about-section">
          <h2>🛠️ Технологии</h2>
          <div className="tech-stack">
            <span className="tech-tag">React</span>
            <span className="tech-tag">React Router v6</span>
            <span className="tech-tag">LocalStorage</span>
            <span className="tech-tag">CSS3</span>
            <span className="tech-tag">JavaScript ES6+</span>
          </div>
        </div>
        
        <div className="about-section">
          <h2>🚀 Начало работы</h2>
          <p>
            Чтобы начать использовать приложение, перейдите на главную страницу и 
            добавьте свои первые фильмы. Все данные сохраняются локально в вашем 
            браузере, поэтому они будут доступны при следующем посещении.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/" className="btn btn-primary">
              Перейти к фильмам
            </Link>
            <Link to="/add-movie" className="btn btn-secondary" style={{ marginLeft: '10px' }}>
              Добавить фильм
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Главный компонент App
function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-movie" element={<MovieForm />} />
          <Route path="/edit-movie/:id" element={<MovieForm isEdit={true} />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;