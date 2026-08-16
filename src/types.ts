export interface Track {
  id: string;
  title: string;
  artist: string;
  film?: string;
  year?: number;
  duration: number; // in seconds
  videoId: string;
  fallbackVideoIds?: string[];
  cover?: string;
  category?: string;
}

export interface Playlist {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  youtubePlaylistId?: string;
  tracks: Track[];
}

export type ThemeMode = 'sukoon' | 'purane-din';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  hindiName: string;
  badgeLabel: string;
  subheading: string;
  bgWide: string;
  bgTall: string;
  accentColor: string;
  playlists: Playlist[];
  defaultPlaylist: Playlist;
}
