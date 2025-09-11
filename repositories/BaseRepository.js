
class BaseRepository {
  constructor(tableName, apiEndpoint) {
    this.tableName = tableName;
    this.apiEndpoint = apiEndpoint;
    this.baseUrl = 'https://staging.codinnovations.com/cardiomed';
  }

  // Create new record (direct API call)
  async create(data, userId = null) {
    try {
      // Add user_id if provided and not already in data
      if (userId && !data.user_id) {
        data.user_id = userId;
      }

      let url = `${this.baseUrl}${this.apiEndpoint}`;
      
      // Add user_id as query parameter if needed for POST requests
      if (this.tableName !== 'users' && data.user_id) {
        url += `?user_id=${data.user_id}`;
      }

      console.log(`[${this.tableName}Repository] Creating record via API: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const newRecord = await response.json();
      return newRecord;
    } catch (error) {
      console.error(`[${this.tableName}Repository] Create failed:`, error);
      throw error;
    }
  }

  // Get record by ID (direct API call)
  async findById(id) {
    try {
      const url = `${this.baseUrl}${this.apiEndpoint}/${id}`;
      console.log(`[${this.tableName}Repository] Fetching record by ID: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`[${this.tableName}Repository] Response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`[${this.tableName}Repository] User not found (404)`);
          return null;
        }
        const errorText = await response.text();
        console.error(`[${this.tableName}Repository] HTTP error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const record = await response.json();
      console.log(`[${this.tableName}Repository] Record found:`, record);
      return record;
    } catch (error) {
      console.error(`[${this.tableName}Repository] FindById failed:`, error);
      throw error;
    }
  }

  // Get all records (direct API call)
  async findAll(conditions = {}, orderBy = 'created_at DESC', limit = null) {
    try {
      let url = `${this.baseUrl}${this.apiEndpoint}`;
      const params = new URLSearchParams();
      
      // Add conditions as query parameters
      Object.entries(conditions).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      if (limit) {
        params.append('limit', limit);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`[${this.tableName}Repository] Fetching records from API: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const serverData = await response.json();
      const records = Array.isArray(serverData) ? serverData : [serverData];
      return records;
    } catch (error) {
      console.error(`[${this.tableName}Repository] FindAll failed:`, error);
      throw error;
    }
  }

  // Update record (direct API call)
  async update(id, data) {
    try {
      let url = `${this.baseUrl}${this.apiEndpoint}`;
      
      // Special handling for different reminder types
      switch (this.tableName) {
        case 'medication_reminders':
          url = `${this.baseUrl}/reminders/reminder/${id}`;
          break;
        case 'bp_reminders':
          url = `${this.baseUrl}/reminders/bp-reminder/${id}`;
          break;
        case 'doctor_reminders':
          url = `${this.baseUrl}/reminders/doctor-appointment/${id}`;
          break;
        case 'workout_reminders':
          url = `${this.baseUrl}/reminders/workout/${id}`;
          break;
        default:
          // Remove trailing slash if present, then add record ID
          const cleanEndpoint = this.apiEndpoint.endsWith('/') ? this.apiEndpoint.slice(0, -1) : this.apiEndpoint;
          url = `${this.baseUrl}${cleanEndpoint}/${id}`;
      }

      console.log(`[${this.tableName}Repository] Updating record via API: ${url}`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const updatedRecord = await response.json();
      return updatedRecord;
    } catch (error) {
      console.error(`[${this.tableName}Repository] Update failed:`, error);
      throw error;
    }
  }

  // Delete record (direct API call)
  async delete(id) {
    try {
      let url = `${this.baseUrl}${this.apiEndpoint}`;
      
      // Special handling for different reminder types
      switch (this.tableName) {
        case 'medication_reminders':
          url = `${this.baseUrl}/reminders/reminder/${id}`;
          break;
        case 'bp_reminders':
          url = `${this.baseUrl}/reminders/bp-reminder/${id}`;
          break;
        case 'doctor_reminders':
          url = `${this.baseUrl}/reminders/doctor-appointment/${id}`;
          break;
        case 'workout_reminders':
          url = `${this.baseUrl}/reminders/workout/${id}`;
          break;
        default:
          // Remove trailing slash if present, then add record ID
          const cleanEndpoint = this.apiEndpoint.endsWith('/') ? this.apiEndpoint.slice(0, -1) : this.apiEndpoint;
          url = `${this.baseUrl}${cleanEndpoint}/${id}`;
      }

      console.log(`[${this.tableName}Repository] Deleting record via API: ${url}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error(`[${this.tableName}Repository] Delete failed:`, error);
      throw error;
    }
  }
}

export default BaseRepository;
