const YOUTUBE_EMBED_ORIGIN = "https://www.youtube-nocookie.com/embed/";

/** Returns a privacy-enhanced embed URL only for a valid YouTube video ID. */
export function getOfficialTrailerEmbedUrl(videoId) {
  if (!/^[\w-]{11}$/.test(videoId || "")) return "";
  return `${YOUTUBE_EMBED_ORIGIN}${videoId}?autoplay=1&rel=0`;
}

/** Minimal iframe policy for official YouTube trailers; no third-party player sources. */
export const TRAILER_IFRAME_POLICY = Object.freeze({
  sandbox: "allow-scripts allow-presentation",
  referrerPolicy: "strict-origin-when-cross-origin",
  allow: "encrypted-media; picture-in-picture",
  allowFullScreen: true,
});
