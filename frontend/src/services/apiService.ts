/**
 * API Service
 * Centralized API calls with proper error handling
 */

import { API_CONFIG } from '../config/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  /**
   * Generic fetch method with error handling
   */
  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = API_CONFIG.getUrl(endpoint);
      
      const defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, defaultOptions);
      
      if (response.status === 401) {
        return {
          status: 401,
          error: 'Unauthorized access - please log in.',
        };
      }

      if (!response.ok) {
        return {
          status: response.status,
          error: `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error('API call failed:', error);
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchWithErrorHandling<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.fetchWithErrorHandling<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.fetchWithErrorHandling<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchWithErrorHandling<T>(endpoint, {
      method: 'DELETE',
    });
  }


  
  // Specific API methods for the app
  async fetchSemestersList() {
    return this.get('/semesters_list');
  }

  async fetchPersons() {
    return this.get('/home');
  }

  async createGuest(guestData: any) {
    return this.post('/account', guestData);
  }

  async fetchActivities(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/activities${queryString}`);
  }

  async fetchLogbook(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/logbook${queryString}`);
  }

  async fetchSemesters() {
    return this.get('/semester');
  }

  async fetchProblemBehaviors(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/problem_behavior${queryString}`);
  }

  async login(params: any) {
    return this.post('/login', params);
  }

  async fetchAppreciations(month?: number) {
    const queryString = month ? `?month=${month}` : '';
    return this.get(`/appreciations${queryString}`);
  }

  async createLogBook(logData: any) {
    return this.post('/new_logbook_entry', logData);
  }

  async deleteLogbook(id: number) {
    return this.get(`/delete_logbook?id=${id}`);
  }

  async createActivity(activityData: any) {
    return this.post('/new_activity_entry', activityData);
  }

  async deleteActivity(id: number) {
    return this.get(`/delete_activity?id=${id}`);
  }

  async declareAbsence(absenceData: any) {
    return this.post('/declare_absence', absenceData);
  }

  async createProblemBehavior(problemData: any) {
    return this.post('/new_problem_behavior_entry', problemData);
  }

  async deleteProblemBehavior(id: number) {
    return this.get(`/delete_problem_behavior?id=${id}`);
  }

  async changePassword(passwordData: any) {
    return this.post('/change_password', passwordData);
  }

  async newOperator(operatorData: any) {
    return this.post('/new_operator', operatorData);
  }

  async fetchAccountInfos() {
    return this.get('/get_all_account_infos');
  }

  async deleteGuest(guest_id: number) {
    return this.get(`/delete_guest?guest_id=${guest_id}`);
  }

  async changePermissions(user_id: number, permissions: number) {
    return this.get(`/change_permissions?user_id=${user_id}&permissions=${permissions}`);
  }

  async setSemester(semesterId: number) {
    return this.post('/set_semester', { semester_id: semesterId });
  }

  async resetSemester() {
    return this.post('/reset_semester');
  }

  async logout() {
    return this.get('/logout');
  }

  async newSemester() {
    return this.get('/new_semester');
  }

  async backupDatabase(password: string) {
    return this.post('/backup_database', { password });
  }

}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;
