export interface MKArtwork {
  url: string;
  width?: number;
  height?: number;
  bgColor?: string;
  textColor1?: string;
}

export interface MKSong {
  id: string;
  type: 'songs' | 'library-songs';
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    artwork?: MKArtwork;
    durationInMillis: number;
    previews?: Array<{ url: string }>;
    trackNumber?: number;
    discNumber?: number;
    genreNames?: string[];
    releaseDate?: string;
    isrc?: string;
    contentRating?: string;
  };
  relationships?: {
    albums?: { data: MKAlbum[] };
    artists?: { data: MKArtist[] };
  };
}

export interface MKAlbum {
  id: string;
  type: 'albums' | 'library-albums';
  attributes: {
    name: string;
    artistName: string;
    artwork?: MKArtwork;
    trackCount: number;
    releaseDate?: string;
    genreNames?: string[];
    isSingle?: boolean;
    contentRating?: string;
    editorialNotes?: { standard?: string; short?: string };
  };
  relationships?: {
    tracks?: { data: MKSong[] };
    artists?: { data: MKArtist[] };
  };
}

export interface MKArtist {
  id: string;
  type: 'artists' | 'library-artists';
  attributes: {
    name: string;
    artwork?: MKArtwork;
    genreNames?: string[];
    url?: string;
    editorialNotes?: { standard?: string; short?: string };
  };
  relationships?: {
    albums?: { data: MKAlbum[] };
  };
}

export interface MKPlaylist {
  id: string;
  type: 'playlists' | 'library-playlists';
  attributes: {
    name: string;
    description?: { standard?: string };
    artwork?: MKArtwork;
    curatorName?: string;
    lastModifiedDate?: string;
    trackTypes?: string[];
  };
  relationships?: {
    tracks?: { data: MKSong[] };
  };
}

export interface MKSearchResults {
  songs?: { data: MKSong[]; next?: string };
  albums?: { data: MKAlbum[]; next?: string };
  artists?: { data: MKArtist[]; next?: string };
  playlists?: { data: MKPlaylist[]; next?: string };
}

export interface MKMediaItem {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    artwork?: MKArtwork;
    durationInMillis: number;
  };
}

export interface MusicKitInstance {
  isAuthorized: boolean;
  authorize: () => Promise<string>;
  unauthorize: () => Promise<void>;
  volume: number;
  playbackState: number;
  currentPlaybackTime: number;
  currentPlaybackDuration: number;
  nowPlayingItem: MKMediaItem | null;
  shuffleMode: number;
  repeatMode: number;
  queue: { items: MKMediaItem[] };
  storefrontId?: string;
  setQueue: (options: Record<string, unknown>) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  skipToNextItem: () => Promise<void>;
  skipToPreviousItem: () => Promise<void>;
  seekToTime: (time: number) => Promise<void>;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  api: {
    music: (path: string, options?: Record<string, unknown>) => Promise<{ data: Record<string, unknown> }>;
  };
}

export const PlaybackStates = {
  none: 0,
  loading: 1,
  playing: 2,
  paused: 3,
  stopped: 4,
  ended: 5,
  seeking: 6,
  waiting: 8,
  stalled: 9,
  completed: 10,
} as const;

export type PlaybackState = (typeof PlaybackStates)[keyof typeof PlaybackStates];
