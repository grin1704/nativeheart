'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { MemorialPage, User } from '@/types';
import 'react-quill/dist/quill.snow.css';

interface BiographyEditorProps {
  memorialPage: MemorialPage;
  user: User;
  onUpdate: (updates: Partial<MemorialPage>) => void;
  onError: (error: string) => void;
}

// Динамический импорт react-quill для избежания SSR проблем
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function BiographyEditor({ memorialPage, user, onUpdate, onError }: BiographyEditorProps) {
  const [biographyText, setBiographyText] = useState(memorialPage.biographyText || '');

  const isFreeAccount = user.subscriptionType === 'free';
  const maxCharacters = isFreeAccount ? 1000 : null;
  
  // Подсчет символов без HTML тегов
  const getTextLength = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent?.length || 0;
  };
  
  const charactersUsed = getTextLength(biographyText);
  const charactersRemaining = maxCharacters ? maxCharacters - charactersUsed : null;

  const handleTextChange = (value: string) => {
    const textLength = getTextLength(value);
    
    if (maxCharacters && textLength > maxCharacters) {
      onError(`Превышен лимит символов. Максимум: ${maxCharacters}`);
      return;
    }
    
    setBiographyText(value);
    onUpdate({ biographyText: value });
  };

  // Настройки панели инструментов редактора
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote'],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote',
    'align'
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Биография</h2>
        <p className="text-sm text-gray-600">
          Расскажите историю жизни человека. Используйте форматирование для создания красивого и структурированного текста.
        </p>
        {isFreeAccount && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Бесплатный аккаунт:</strong> Ограничение на текст биографии - {maxCharacters} символов.
              Обновите подписку для снятия ограничений.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Character Counter */}
        {maxCharacters && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Использовано символов:</span>
            <span className={`text-sm font-medium ${charactersRemaining! < 100 ? 'text-red-600' : 'text-gray-700'}`}>
              {charactersUsed} / {maxCharacters}
            </span>
          </div>
        )}

        {/* Rich Text Editor */}
        <div className="biography-editor">
          <ReactQuill
            theme="snow"
            value={biographyText}
            onChange={handleTextChange}
            modules={modules}
            formats={formats}
            placeholder="Начните писать биографию... Используйте панель инструментов для форматирования текста."
            className="bg-white"
          />
        </div>

        {maxCharacters && charactersRemaining! < 100 && (
          <p className="text-sm text-red-600">
            Осталось символов: {charactersRemaining}
          </p>
        )}

        {/* Formatting Tips */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Советы по форматированию:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Используйте <strong>заголовки</strong> для структурирования текста по разделам</li>
            <li>• Выделяйте важные моменты <strong>жирным</strong> или <em>курсивом</em></li>
            <li>• Создавайте списки для перечисления достижений или важных дат</li>
            <li>• Используйте цитаты для выделения памятных слов или высказываний</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        .biography-editor .ql-container {
          min-height: 300px;
          font-size: 15px;
          font-family: inherit;
        }
        
        .biography-editor .ql-editor {
          min-height: 300px;
        }
        
        .biography-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        
        .biography-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #f9fafb;
        }
        
        .biography-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
