'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import type { MemorialPage, User, BurialLocation } from '@/types';

interface BurialLocationEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

export default function BurialLocationEditor({ memorialPage, user, onUpdate, onError }: BurialLocationEditorProps) {
  const [burialLocation, setBurialLocation] = useState<BurialLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    description: '',
    instructions: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  useEffect(() => {
    loadBurialLocation();
  }, [memorialPage.id]);

  const loadBurialLocation = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<BurialLocation>('GET', `/memorial-pages/${memorialPage.id}/burial-location`);
      if (response.success && response.data) {
        setBurialLocation(response.data);
        setFormData({
          address: response.data.address || '',
          description: response.data.description || '',
          instructions: response.data.instructions || '',
          latitude: response.data.latitude || null,
          longitude: response.data.longitude || null
        });
      }
    } catch (err) {
      console.error('Error loading burial location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.address.trim()) {
      onError('Адрес является обязательным полем');
      return;
    }

    try {
      setSaving(true);
      
      const locationData = {
        address: formData.address.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        ...(formData.latitude && formData.longitude && {
          latitude: formData.latitude,
          longitude: formData.longitude
        })
      };

      // Use the correct endpoint for memorial page burial location
      const method = burialLocation ? 'PUT' : 'POST';
      const response = await apiRequest(method, `/memorial-pages/${memorialPage.id}/burial-location`, locationData);

      if (response.success) {
        setBurialLocation(response.data);
      } else {
        console.error('Burial location save error:', response);
        onError(response.error || response.message || 'Ошибка сохранения места захоронения');
      }
    } catch (err) {
      console.error('Save burial location error:', err);
      onError('Ошибка сохранения места захоронения');
    } finally {
      setSaving(false);
    }
  };



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (showMapPicker && !mapLoaded) {
      // Load Yandex Maps API
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=45bc2843-bef5-4486-bd3d-773576d96f1b&lang=ru_RU';
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
        initMap();
      };
      document.head.appendChild(script);
    } else if (showMapPicker && mapLoaded) {
      initMap();
    }
  }, [showMapPicker]);

  const initMap = () => {
    if (typeof window === 'undefined' || !(window as any).ymaps) return;

    (window as any).ymaps.ready(() => {
      const mapElement = document.getElementById('yandex-map-picker');
      if (!mapElement) return;

      // Default center (Moscow)
      const defaultCenter = [55.755819, 37.617644];
      const center = formData.latitude && formData.longitude 
        ? [formData.latitude, formData.longitude]
        : defaultCenter;

      const map = new (window as any).ymaps.Map('yandex-map-picker', {
        center: center,
        zoom: 12,
        controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl']
      });

      // Add placemark if coordinates exist
      let placemark: any = null;
      if (formData.latitude && formData.longitude) {
        placemark = new (window as any).ymaps.Placemark(center, {
          balloonContent: 'Выбранное место'
        }, {
          preset: 'islands#redDotIcon',
          draggable: true
        });
        map.geoObjects.add(placemark);

        // Handle placemark drag
        placemark.events.add('dragend', () => {
          const coords = placemark.geometry.getCoordinates();
          setFormData(prev => ({
            ...prev,
            latitude: coords[0],
            longitude: coords[1]
          }));
        });
      }

      // Handle map click
      map.events.add('click', (e: any) => {
        const coords = e.get('coords');
        
        // Remove old placemark
        if (placemark) {
          map.geoObjects.remove(placemark);
        }

        // Add new placemark
        placemark = new (window as any).ymaps.Placemark(coords, {
          balloonContent: 'Выбранное место'
        }, {
          preset: 'islands#redDotIcon',
          draggable: true
        });
        map.geoObjects.add(placemark);

        // Update coordinates
        setFormData(prev => ({
          ...prev,
          latitude: coords[0],
          longitude: coords[1]
        }));

        // Handle placemark drag
        placemark.events.add('dragend', () => {
          const newCoords = placemark.geometry.getCoordinates();
          setFormData(prev => ({
            ...prev,
            latitude: newCoords[0],
            longitude: newCoords[1]
          }));
        });
      });
    });
  };

  const clearCoordinates = () => {
    setFormData(prev => ({
      ...prev,
      latitude: null,
      longitude: null
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Место захоронения</h2>
        <p className="text-sm text-gray-600">
          Укажите информацию о месте захоронения, чтобы помочь людям найти могилу и отдать дань памяти.
        </p>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Адрес кладбища *
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Например: Новодевичье кладбище, Москва"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Укажите полный адрес кладбища для отображения на карте
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Описание места
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Например: Участок 15, ряд 3, место 12"
          />
          <p className="text-xs text-gray-500 mt-1">
            Дополнительная информация о расположении могилы на кладбище
          </p>
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Инструкции по поиску
          </label>
          <textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Подробные инструкции, как найти могилу: от какого входа идти, ориентиры, особенности расположения..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Подробные указания помогут посетителям легче найти место захоронения
          </p>
        </div>

        {/* Coordinates Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Координаты места
          </label>
          
          {formData.latitude && formData.longitude ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-900">Координаты установлены</p>
                    <p className="text-xs text-green-700">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearCoordinates}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Очистить
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Выбрать точку на карте</span>
                </div>
              </button>
              <p className="text-xs text-gray-500">
                Если адрес не найден автоматически, вы можете указать точное место на карте
              </p>
            </div>
          )}
        </div>

        {/* Map Picker Modal */}
        {showMapPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Указать координаты вручную</h3>
                <button
                  onClick={() => setShowMapPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Как выбрать место</h4>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                          <li>Кликните на карте в нужном месте</li>
                          <li>Появится красная метка с координатами</li>
                          <li>Метку можно перетащить для точной настройки</li>
                          <li>Или введите координаты вручную в поля ниже</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Интерактивная карта
                    </label>
                    <div 
                      id="yandex-map-picker" 
                      className="w-full rounded-lg border border-gray-300 overflow-hidden"
                      style={{ height: '400px' }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Используйте поиск на карте для быстрого нахождения нужного места
                    </p>
                  </div>

                  {/* Current Coordinates Display */}
                  {formData.latitude && formData.longitude && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-green-900">Координаты выбраны</p>
                          <p className="text-sm text-green-700">
                            {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coordinate Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Широта (Latitude)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Например: 55.755819"
                        value={formData.latitude || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                            setFormData(prev => ({ ...prev, latitude: lat }));
                          } else if (e.target.value === '') {
                            setFormData(prev => ({ ...prev, latitude: null }));
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Значение от -90 до 90</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Долгота (Longitude)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Например: 37.617644"
                        value={formData.longitude || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                            setFormData(prev => ({ ...prev, longitude: lng }));
                          } else if (e.target.value === '') {
                            setFormData(prev => ({ ...prev, longitude: null }));
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Значение от -180 до 180</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.latitude && formData.longitude) {
                      setShowMapPicker(false);
                    }
                  }}
                  disabled={!formData.latitude || !formData.longitude}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Применить координаты
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Preview */}
        {(formData.latitude && formData.longitude) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Расположение на карте
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="bg-gray-100 p-4 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-600 mt-2">
                  Карта будет отображена здесь
                </p>
                <p className="text-xs text-gray-500">
                  Координаты: {formData.latitude!.toFixed(6)}, {formData.longitude!.toFixed(6)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Карта будет интегрирована с Yandex Maps API для отображения точного местоположения
            </p>
          </div>
        )}

        {/* Geocoding Status */}
        {!formData.latitude && formData.address && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Координаты не определены
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Сохраните адрес, чтобы система автоматически определила координаты для отображения на карте.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !formData.address.trim()}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Сохранение...' : burialLocation ? 'Обновить' : 'Сохранить'}
          </button>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Информация о картах
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Система автоматически определит координаты по указанному адресу и отобразит место на интерактивной карте.
                Посетители смогут построить маршрут и получить подробные инструкции по навигации.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}