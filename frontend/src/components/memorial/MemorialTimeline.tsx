'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import { TimelineEvent } from '@/types';

interface MemorialTimelineProps {
  memorialPageId: string;
}

export default function MemorialTimeline({ memorialPageId }: MemorialTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [memorialPageId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('Loading timeline events for page:', memorialPageId);
      const response = await apiRequest<TimelineEvent[]>('GET', `/memorial-pages/${memorialPageId}/timeline`);
      console.log('Timeline response:', response);
      if (response.success) {
        setEvents(response.data || []);
        console.log('Timeline events loaded:', response.data?.length || 0);
      } else {
        console.error('Timeline API error:', response.error);
      }
    } catch (err) {
      console.error('Error loading timeline events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование даты события
  const formatEventDate = (event: TimelineEvent) => {
    if (event.month && event.day) {
      // Месяцы в родительном падеже для конструкции "день месяца"
      const monthNamesGenitive = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return {
        year: event.year,
        dateStr: `${event.day} ${monthNamesGenitive[event.month - 1]}`
      };
    }
    if (event.month) {
      // Месяцы в именительном падеже для конструкции "месяц год"
      const monthNamesNominative = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      return {
        year: event.year,
        dateStr: monthNamesNominative[event.month - 1]
      };
    }
    return {
      year: event.year,
      dateStr: null
    };
  };

  // Сортируем события по дате (год, месяц, день)
  const sortedEvents = events.length > 0 ? [...events].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if ((a.month || 0) !== (b.month || 0)) return (a.month || 0) - (b.month || 0);
    return (a.day || 0) - (b.day || 0);
  }) : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Хронология жизни</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Загрузка хронологии...</p>
        </div>
      ) : !events || events.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">События не добавлены</h3>
          <p className="text-muted-foreground">События хронологии пока не добавлены</p>
        </div>
      ) : (
        <div className="timeline-container">
          {sortedEvents.map((event, index) => {
            const { year, dateStr } = formatEventDate(event);
            return (
              <div key={event.id} className="timeline-item">
                <div className="timeline-date">
                  <div className="year">{year}</div>
                  {dateStr && <div className="date">{dateStr}</div>}
                </div>
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  {index < sortedEvents.length - 1 && <div className="timeline-line"></div>}
                </div>
                <div className="timeline-content">
                  <p>{event.description}</p>
                  {event.location && (
                    <div className="timeline-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .timeline-container {
          max-width: 100%;
        }

        .timeline-item {
          display: grid;
          grid-template-columns: 100px 60px 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .timeline-date {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          padding-top: 0.5rem;
        }

        .timeline-date .year {
          font-size: 1.5rem;
          font-weight: 600;
          color: hsl(var(--primary));
          line-height: 1.2;
        }

        .timeline-date .date {
          font-size: 0.875rem;
          font-weight: 400;
          color: hsl(var(--muted-foreground));
          margin-top: 0.25rem;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: hsl(var(--background));
          border: 3px solid hsl(var(--primary));
          flex-shrink: 0;
          z-index: 2;
          margin-top: 0.75rem;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: hsl(var(--border));
          margin-top: 0.5rem;
          min-height: 60px;
        }

        .timeline-content {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .timeline-content p {
          margin: 0;
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
          font-size: 1rem;
        }

        .timeline-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          color: hsl(var(--muted-foreground));
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .timeline-location svg {
          flex-shrink: 0;
          color: hsl(var(--primary));
        }

        @media (max-width: 768px) {
          .timeline-item {
            grid-template-columns: 70px 40px 1fr;
            gap: 0.75rem;
          }

          .timeline-date .year {
            font-size: 1.25rem;
          }

          .timeline-date .date {
            font-size: 0.75rem;
          }

          .timeline-dot {
            width: 12px;
            height: 12px;
            border-width: 2px;
          }

          .timeline-content {
            padding: 1rem;
          }

          .timeline-content p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .timeline-item {
            grid-template-columns: 60px 30px 1fr;
            gap: 0.5rem;
          }

          .timeline-date .year {
            font-size: 1.1rem;
          }

          .timeline-date .date {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}
