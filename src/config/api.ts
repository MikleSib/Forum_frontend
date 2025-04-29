const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://рыбный-форум.рф/api'
  : '/api';

export default API_URL; 