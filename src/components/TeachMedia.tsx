import type { TeachMedia as Media } from '@/lessons/types';
import { AlphabetReferenceTable } from '@/components/AlphabetChart';
import { embedUrl } from '@/lib/video';

function Video({ src, caption }: { src: string; caption?: string }) {
  const embed = embedUrl(src);
  return (
    <figure className="w-full m-0 flex flex-col gap-2">
      <div className="w-full aspect-video rounded-card border border-border overflow-hidden bg-border">
        {embed ? (
          <iframe
            className="w-full h-full border-none"
            src={embed}
            title={caption ?? 'Lesson video'}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video className="w-full h-full" src={src} controls playsInline />
        )}
      </div>
      {caption && (
        <figcaption className="text-xs text-muted-foreground text-center">{caption}</figcaption>
      )}
    </figure>
  );
}

/** The visual above a teach card's body — see `TeachMedia` in lessons/types.ts. */
export function TeachMedia({ media }: { media: Media }) {
  switch (media.kind) {
    case 'video':
      return <Video src={media.src} caption={media.caption} />;
    case 'letters':
      // Cap to the cards' natural size so one letter doesn't stretch across the
      // whole teach card; past that the table wraps into columns as usual.
      return (
        <div className="w-full mx-auto" style={{ maxWidth: `${media.glyphs.length * 270}px` }}>
          <AlphabetReferenceTable className="w-full" glyphs={media.glyphs} speak />
        </div>
      );
  }
}
