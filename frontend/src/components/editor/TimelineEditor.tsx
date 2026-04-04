'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import type { MemorialPage, User, TimelineEvent } from '@/types';

interface TimelineEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

interface TimelineFormData {
  year: string;
  month: string;
  day: string;
  description: string;
  location: string;
  precision: 'year' | 'month' | 'day';
}

export default function TimelineEditor({ memorialPage, user, onUpdate, onError }: TimelineEditorProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TimelineFormData>({
    year: '',
    month: '',
    day: '',
    description: '',
    location: '',
    precision: 'year'
  });

  useEffect(() => {
    loadEvents();
  }, [memorialPage.id]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<TimelineEvent[]>('GET', `/memorial-pages/${memorialPage.id}/timeline`);
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (err) {
      console.error('Error loading timeline events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year || !formData.description.trim()) {
      onError('Заполните все поля');
      return;
    }

    const year = parseInt(formData.year);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 10) {
      onError('Укажите корректный год');
      return;
    }

    // Валидация месяца и дня в зависимости от точности
    let month: number | null = null;
    let day: number | null = null;

    if (formData.precision !== 'year') {
      if (!formData.month) {
        onError('Укажите месяц');
        return;
      }
      month = parseInt(formData.month);
      if (isNaN(month) || month < 1 || month > 12) {
        onError('Укажите корректный месяц (1-12)');
        return;
      }
    }

    if (formData.precision === 'day') {
      if (!formData.day) {
        onError('Укажите день');
        return;
      }
      day = parseInt(formData.day);
      if (isNaN(day) || day < 1 || day > 31) {
        onError('Укажите корректный день (1-31)');
        return;
      }
      
      // Проверка корректности дня для выбранного месяца
      const daysInMonth = new Date(year, month!, 0).getDate();
      if (day > daysInMonth) {
        onError(`В выбранном месяце только ${daysInMonth} дней`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const eventData = {
        year,
        month,
        day,
        description: formData.description,
        location: formData.location.trim() || null,
      };

      if (editingEvent) {
        const response = await apiRequest('PUT', `/memorial-pages/${memorialPage.id}/timeline/${editingEvent.id}`, eventData);
        if (response.success) {
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? response.data : e));
          resetForm();
        } else {
          onError(response.error || 'Ошибка обновления события');
        }
      } else {
        const response = await apiRequest('POST', `/memorial-pages/${memorialPage.id}/timeline`, eventData);
        if (response.success) {
          setEvents(prev => [...prev, response.data]);
          resetForm();
        } else {
          onError(response.error || 'Ошибка создания события');
        }
      }
    } catch (err) {
      onError('Ошибка сохранения события');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    
    // Определяем точность на основе наличия данных
    let precision: 'year' | 'month' | 'day' = 'year';
    if (event.day && event.month) {
      precision = 'day';
    } else if (event.month) {
      precision = 'month';
    }
    
    setFormData({
      year: event.year.toString(),
      month: event.month ? event.month.toString() : '',
      day: event.day ? event.day.toString() : '',
      description: event.description,
      location: event.location || '',
      precision
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Удалить это событие?')) return;

    try {
      setLoading(true);
      const response = await apiRequest('DELETE', `/memorial-pages/${memorialPage.id}/timeline/${eventId}`);
      if (response.success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } else {
        onError(response.error || 'Ошибка удаления события');
      }
    } catch (err) {
      onError('Ошибка удаления события');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ year: '', month: '', day: '', description: '', location: '', precision: 'year' });
    setEditingEvent(null);
    setShowForm(false);
  };

  // Сортируем события по дате (год, месяц, день)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if ((a.month || 0) !== (b.month || 0)) return (a.month || 0) - (b.month || 0);
    return (a.day || 0) - (b.day || 0);
  });

  // Форматирование даты для отображения
  const formatEventDate = (event: TimelineEvent) => {
    if (event.day && event.month) {
      const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                         'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      return `${event.day} ${monthNames[event.month - 1]} ${event.year}`;
    } else if (event.month) {
      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      return `${monthNames[event.month - 1]} ${event.year}`;
    }
    return event.year.toString();
  };

  return (
    <div className="timeline-editor">
      <div className="editor-header">
        <h3>Хронология жизни</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-add"
          disabled={loading}
        >
          {showForm ? 'Отмена' : '+ Добавить событие'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="timeline-form">
          <div className="form-group">
            <label>Точность даты *</label>
            <div className="precision-selector">
              <label className="precision-option">
                <input
                  type="radio"
                  name="precision"
                  value="year"
                  checked={formData.precision === 'year'}
                  onChange={(e) => setFormData({ ...formData, precision: 'year', month: '', day: '' })}
                />
                <span>Только год</span>
              </label>
              <label className="precision-option">
                <input
                  type="radio"
                  name="precision"
                  value="month"
                  checked={formData.precision === 'month'}
                  onChange={(e) => setFormData({ ...formData, precision: 'month', day: '' })}
                />
                <span>Месяц и год</span>
              </label>
              <label className="precision-option">
                <input
                  type="radio"
                  name="precision"
                  value="day"
                  checked={formData.precision === 'day'}
                  onChange={(e) => setFormData({ ...formData, precision: 'day' })}
                />
                <span>Точная дата</span>
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Год *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="1990"
                min="1800"
                max={new Date().getFullYear() + 10}
                required
              />
            </div>

            {(formData.precision === 'month' || formData.precision === 'day') && (
              <div className="form-group">
                <label>Месяц *</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                >
                  <option value="">Выберите месяц</option>
                  <option value="1">Январь</option>
                  <option value="2">Февраль</option>
                  <option value="3">Март</option>
                  <option value="4">Апрель</option>
                  <option value="5">Май</option>
                  <option value="6">Июнь</option>
                  <option value="7">Июль</option>
                  <option value="8">Август</option>
                  <option value="9">Сентябрь</option>
                  <option value="10">Октябрь</option>
                  <option value="11">Ноябрь</option>
                  <option value="12">Декабрь</option>
                </select>
              </div>
            )}

            {formData.precision === 'day' && (
              <div className="form-group">
                <label>День *</label>
                <input
                  type="number"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  placeholder="15"
                  min="1"
                  max="31"
                  required
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Описание события *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Родился в Москве..."
              rows={3}
              maxLength={500}
              required
            />
            <small>{formData.description.length}/500</small>
          </div>

          <div className="form-group">
            <label>Место</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Чебоксары"
              maxLength={200}
            />
            <small>Необязательное поле</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {editingEvent ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="events-list">
        {loading && events.length === 0 ? (
          <p className="loading">Загрузка...</p>
        ) : sortedEvents.length === 0 ? (
          <p className="empty">Событий пока нет. Добавьте первое событие.</p>
        ) : (
          sortedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-date">
                <div className="event-date-text">{formatEventDate(event)}</div>
              </div>
              <div className="event-content">
                <p>{event.description}</p>
                {event.location && (
                  <div className="event-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              <div className="event-actions">
                <button onClick={() => handleEdit(event)} className="btn-edit">
                  Изменить
                </button>
                <button onClick={() => handleDelete(event.id)} className="btn-delete">
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .timeline-editor {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .editor-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #2c2c2c;
        }

        .btn-add {
          background: #4a90e2;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-add:hover:not(:disabled) {
          background: #357abd;
        }

        .btn-add:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .timeline-form {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #2c2c2c;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .precision-selector {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .precision-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .precision-option:hover {
          border-color: #4a90e2;
          background: #f0f7ff;
        }

        .precision-option input[type="radio"] {
          cursor: pointer;
        }

        .precision-option input[type="radio"]:checked + span {
          font-weight: 600;
          color: #4a90e2;
        }

        .precision-option:has(input:checked) {
          border-color: #4a90e2;
          background: #f0f7ff;
        }

        .form-group small {
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.85rem;
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .btn-primary {
          background: #4a90e2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-primary:hover:not(:disabled) {
          background: #357abd;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #2c2c2c;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .loading,
        .empty {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        .event-card {
          display: grid;
          grid-template-columns: 180px 1fr auto;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          align-items: center;
        }

        .event-date {
          display: flex;
          flex-direction: column;
        }

        .event-date-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #8b7355;
          text-align: left;
          line-height: 1.3;
        }

        .event-content p {
          margin: 0;
          color: #4a4a4a;
          line-height: 1.5;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .event-location svg {
          flex-shrink: 0;
          color: #8b7355;
        }

        .event-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .btn-edit {
          background: #4a90e2;
          color: white;
        }

        .btn-edit:hover {
          background: #357abd;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
        }

        .btn-delete:hover {
          background: #c0392b;
        }

        @media (max-width: 768px) {
          .event-card {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .event-date-text {
            text-align: left;
          }

          .event-actions {
            justify-content: flex-start;
          }

          .precision-selector {
            flex-direction: column;
          }

          .precision-option {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
