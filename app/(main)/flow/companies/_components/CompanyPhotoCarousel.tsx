'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import type { CompanyPhoto } from '@/_types/flow';
import { resolveAssetUrl } from '@/_lib/utils/assetUrl';
import { logoBg, logoText } from '../../_components/companyTheme';

interface Props {
  photos: CompanyPhoto[];
  /** 사진이 없을 때 폴백으로 표시할 글자 (보통 회사 logo_letter) */
  fallbackLetter: string;
  /** 폴백 글자 색상 키 (logo_color) */
  fallbackColor: string | null;
}

export default function CompanyPhotoCarousel({
  photos,
  fallbackLetter,
  fallbackColor,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: photos.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Fallback — 사진 없을 때
  if (photos.length === 0) {
    return (
      <div
        className={`relative w-full ${logoBg(fallbackColor)} flex items-center justify-center`}
        style={{ aspectRatio: '16 / 9' }}
      >
        <span className={`text-7xl font-extrabold ${logoText(fallbackColor)}/40`}>
          {fallbackLetter}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-100">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative flex-[0_0_100%] min-w-0"
              style={{ aspectRatio: '16 / 9' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveAssetUrl(p.url)}
                alt={p.caption ?? ''}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                draggable={false}
              />
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8">
                  <p className="text-xs font-medium text-white drop-shadow-sm">
                    {p.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`사진 ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === selectedIndex
                  ? 'w-5 bg-white'
                  : 'w-1.5 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
