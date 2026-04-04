const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: result.data || result,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error || result.message || 'Произошла ошибка',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка подключения к серверу',
    };
  }
}

export async function uploadFile(file: File, endpoint: string): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: result.data || result,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error || result.message || 'Ошибка загрузки файла',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка подключения к серверу',
    };
  }
}