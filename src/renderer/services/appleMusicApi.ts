import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://api.music.apple.com/v1';

class AppleMusicApi {
  private client: AxiosInstance;
  private developerToken: string = '';
  private userToken: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.developerToken) {
        config.headers.Authorization = `Bearer ${this.developerToken}`;
      }
      if (this.userToken) {
        config.headers['Music-User-Token'] = this.userToken;
      }
      return config;
    });
  }

  setTokens(developerToken: string, userToken: string): void {
    this.developerToken = developerToken;
    this.userToken = userToken;
  }

  async search(query: string, types: string[] = ['songs', 'albums', 'artists']) {
    const response = await this.client.get('/catalog/us/search', {
      params: {
        term: query,
        types: types.join(','),
        limit: 25,
      },
    });
    return response.data;
  }

  async getAlbum(id: string) {
    const response = await this.client.get(`/catalog/us/albums/${id}`);
    return response.data;
  }

  async getPlaylist(id: string) {
    const response = await this.client.get(`/catalog/us/playlists/${id}`);
    return response.data;
  }

  async getRecommendations() {
    const response = await this.client.get('/me/recommendations');
    return response.data;
  }

  async getRecentlyPlayed() {
    const response = await this.client.get('/me/recent/played');
    return response.data;
  }

  async getLibraryAlbums() {
    const response = await this.client.get('/me/library/albums');
    return response.data;
  }

  async getLibraryPlaylists() {
    const response = await this.client.get('/me/library/playlists');
    return response.data;
  }
}

export const appleMusicApi = new AppleMusicApi();
