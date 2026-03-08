import axios from 'axios';
import { generateDeveloperToken } from './auth';

export async function verifyToken(): Promise<void> {
  console.log('Generating developer token...');

  let token: string;
  try {
    token = generateDeveloperToken();
    console.log('Token generated successfully.');
    console.log('Token preview:', token.substring(0, 40) + '...');
  } catch (err) {
    console.error('Token generation failed:', err);
    process.exit(1);
  }

  console.log('\nVerifying token against Apple Music API...');

  try {
    const response = await axios.get(
      'https://api.music.apple.com/v1/catalog/us/charts?types=songs&limit=1',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('HTTP Status:', response.status);

    const songs = response.data?.results?.songs?.[0]?.data;
    if (songs && songs.length > 0) {
      const firstSong = songs[0].attributes;
      console.log('\n✅ Apple Music API verified successfully!');
      console.log('Top song:', firstSong.name, '—', firstSong.artistName);
    } else {
      console.log('✅ API responded but no song data in response. Token is valid.');
    }
  } catch (err: any) {
    if (err.response) {
      console.error('❌ API request failed');
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('❌ Network error:', err.message);
    }
    process.exit(1);
  }
}
