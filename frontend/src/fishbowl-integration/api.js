import axios from 'axios';

// Backend API base URL
const BACKEND_BASE_URL = 'http://localhost:5001';

// Fishbowl API service
class FishbowlAPI {
  constructor() {
    this.token = null;
  }

  async login() {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/fishbowl/login`)
     

      if (response.data.success) {
        this.token = response.data.token;
        console.log('Login successful!');
        console.log('Token:', this.token);
        return this.token;
      } else {
        throw new Error(response.data.error || 'Login failed');
      } 
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  
}

const fishbowlAPI = new FishbowlAPI();


export async function loginToFishbowl() {
  try {
    const token = await fishbowlAPI.login();
    fishbowlAPI.token = token;
    console.log('Token:', token);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}


