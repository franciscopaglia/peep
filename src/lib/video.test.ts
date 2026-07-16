import { describe, it, expect } from 'vitest';
import { embedUrl } from '@/lib/video';

describe('embedUrl', () => {
  it('embeds a youtube watch url', () => {
    expect(embedUrl('https://www.youtube.com/watch?v=abc123&t=30')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    );
  });

  it('embeds a youtu.be short url', () => {
    expect(embedUrl('https://youtu.be/abc123')).toBe('https://www.youtube-nocookie.com/embed/abc123');
  });

  it('keeps an already-embeddable youtube url', () => {
    const src = 'https://www.youtube-nocookie.com/embed/abc123';
    expect(embedUrl(src)).toBe(src);
  });

  it('embeds a vimeo url', () => {
    expect(embedUrl('https://vimeo.com/12345678')).toBe('https://player.vimeo.com/video/12345678');
  });

  // Anything unrecognised falls back to the native <video> player.
  it('returns null for a plain file url', () => {
    expect(embedUrl('https://example.com/lesson.mp4')).toBeNull();
  });

  it('returns null for a malformed url', () => {
    expect(embedUrl('not a url')).toBeNull();
  });

  it('returns null for a youtube url with no video id', () => {
    expect(embedUrl('https://www.youtube.com/watch?list=xyz')).toBeNull();
  });
});
