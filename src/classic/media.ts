/** Read the current media without moving or starting another player. */
type MediaApi = HTMLElement & {
  getPlayerResponse?: () => {
    videoDetails?: {
      musicVideoType?: string;
      thumbnail?: {
        thumbnails?: { url: string; width?: number; height?: number }[];
      };
    };
  };
};
function details() {
  try {
    return document
      .querySelector<MediaApi>('#movie_player')
      ?.getPlayerResponse?.()?.videoDetails;
  } catch {
    return undefined;
  }
}
export function currentArtwork() {
  const thumbnails = details()?.thumbnail?.thumbnails ?? [];
  const best = [...thumbnails].sort(
    (a, b) =>
      (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0),
  )[0];
  const image = document.querySelector<HTMLImageElement>(
    'ytmusic-player #thumbnail img, ytmusic-player-bar img.image, ytmusic-player-bar img',
  );
  const source = best?.url || image?.currentSrc || image?.src || '';
  try {
    const url = new URL(source);
    // Google artwork URLs explicitly encode their requested thumbnail size.
    if (/(^|\.)(googleusercontent\.com|ggpht\.com)$/.test(url.hostname)) {
      url.pathname = url.pathname
        .replace(/=w\d+-h\d+/, '=w1200-h1200')
        .replace(/=s\d+/, '=s1200');
      return url.href;
    }
  } catch {
    /* Data URLs and fixture artwork can be used unchanged. */
  }
  return source;
}
export function playingBackgroundVideo(): HTMLVideoElement | null {
  const video = document.querySelector('video');
  const player = document.querySelector<HTMLElement & { videoMode_?: boolean }>(
    'ytmusic-player',
  );
  if (
    !video ||
    video.paused ||
    video.ended ||
    video.readyState < 2 ||
    !video.videoWidth ||
    !video.videoHeight ||
    player?.videoMode_ === false
  )
    return null;
  if (details()?.musicVideoType === 'MUSIC_VIDEO_TYPE_ATV') return null;
  return video;
}

export function setArtworkSource(image: HTMLImageElement, source: string) {
  image.onerror = () => {
    const bar = document.querySelector<HTMLImageElement>(
      'ytmusic-player-bar img.image, ytmusic-player-bar img',
    );
    const fallback = bar?.currentSrc || bar?.src || '';
    image.onerror = null;
    if (fallback && fallback !== image.src) image.src = fallback;
  };
  image.src = source;
}
