import BaseRepository from './BaseRepository';

class UserRepository extends BaseRepository {
  constructor() {
    super('users', '/users');
  }

  // Get user by username
  async findByUsername(username) {
    try {
      const users = await this.findAll({ username });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('[UserRepository] FindByUsername failed:', error);
      throw error;
    }
  }

  // Get user by email
  async findByEmail(email) {
    try {
      const users = await this.findAll({ email });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('[UserRepository] FindByEmail failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const allowedFields = [
        'full_name', 'age', 'gender', 'height', 'weight', 
        'medical_conditions', 'medications'
      ];
      
      const filteredData = {};
      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = profileData[key];
        }
      });

      return await this.update(userId, filteredData);
    } catch (error) {
      console.error('[UserRepository] UpdateProfile failed:', error);
      throw error;
    }
  }

  // Get current user (assuming user ID 1 for now)
  async getCurrentUser() {
    try {
      return await this.findById(1);
    } catch (error) {
      console.error('[UserRepository] GetCurrentUser failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const userRepository = new UserRepository();
export default userRepository;
