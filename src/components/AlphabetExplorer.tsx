import { useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { AlphabetReferenceTable } from '@/components/AlphabetChart';
import { SHAVIAN_ALPHABET } from '@/lib/shavian-alphabet';

export function AlphabetExplorer() {
  const [search, setSearch] = useState('');
  const searchId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const term = search.trim().toLowerCase();
  const isIpa = term.startsWith('/') && term.endsWith('/') && term.length > 2;
  const query = term.replaceAll('/', '');
  const isGlyph = SHAVIAN_ALPHABET.some((letter) => letter.glyph === query);
  const letters = SHAVIAN_ALPHABET.filter((letter) =>
    isGlyph ? letter.glyph === query : isIpa ? letter.ipa.toLowerCase() === query :
      [letter.glyph, letter.sound, letter.ipa, letter.example, letter.exampleEn].some((value) => value.toLowerCase().includes(query))
  );

  return (
    <div>
      <label htmlFor={searchId} className="mb-2 block text-sm font-semibold text-foreground">Find a letter</label>
      <div className="relative max-w-[480px]">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 text-muted-foreground" />
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Try “peep”, “cat”, /p/ or a Shavian letter"
          className="min-h-12 w-full rounded-btn border border-border bg-card py-3 pl-11 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-describedby={`${searchId}-hint`}
        />
      </div>
      <p id={`${searchId}-hint`} className="mt-2 text-xs leading-relaxed text-muted-foreground">Search by letter name, example word, IPA sound or glyph. Use the speaker to hear a letter’s name.</p>
      <p role="status" className="my-4 text-sm text-muted-foreground">{letters.length} of {SHAVIAN_ALPHABET.length} letters</p>
      {letters.length > 0 ? (
        <AlphabetReferenceTable glyphs={letters.map((letter) => letter.glyph)} speak />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="font-semibold text-foreground">No letters found.</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Try a name like “peep” or an example word like “cat”.</p>
          <button type="button" onClick={() => { setSearch(''); inputRef.current?.focus(); }} className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-btn text-sm font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <X size={16} aria-hidden="true" />Clear search
          </button>
        </div>
      )}
    </div>
  );
}
