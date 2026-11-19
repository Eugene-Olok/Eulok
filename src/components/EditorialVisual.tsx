import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface EditorialVisualProps {
  webpSrc: string;
  fallbackSrc: string;
  alt: string;
  aspectRatio?: '16/9' | '4/3';
  kicker?: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const EditorialVisual: React.FC<EditorialVisualProps> = ({
  webpSrc,
  fallbackSrc,
  alt,
  aspectRatio = '4/3',
  kicker,
  caption,
  priority = false,
  className = '',
  style,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={`editorial-frame ${className}`.trim()}
      style={{
        aspectRatio,
        margin: 0,
        ...style,
      }}
    >
      {failed ? (
        <div className="editorial-fallback" role="img" aria-label={alt}>
          <Layers size={28} color="var(--accent-blue)" />
          <span className="mono-tag" style={{ color: 'var(--text-subtle)' }}>
            {kicker || 'EULOK Engineering Practice'}
          </span>
        </div>
      ) : (
        <picture style={{ display: 'block', width: '100%', height: '100%' }}>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={fallbackSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
            className="editorial-img"
          />
        </picture>
      )}

      {(kicker || caption) && (
        <figcaption className="editorial-caption">
          {kicker && <span className="editorial-caption-kicker">{kicker}</span>}
          {caption && <span className="editorial-caption-text">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
};
