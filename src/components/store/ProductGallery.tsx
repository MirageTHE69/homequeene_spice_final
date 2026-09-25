"use client";

import { useState } from "react";
import { PackImage } from "@/components/PackImage";

const isPhoto = (src: string) => /^https?:\/\//.test(src);

export function ProductGallery({ images, name, tileBg }: { images: string[]; name: string; tileBg: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];

  if (images.length === 0) {
    return (
      <div className="gallery" style={{ gridTemplateColumns: "1fr" }}>
        <div className="main-shot" style={{ background: tileBg }}>
          <PackImage name={name} />
        </div>
      </div>
    );
  }

  return (
    <div className="gallery" style={images.length === 1 ? { gridTemplateColumns: "1fr" } : undefined}>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, k) => (
            <button
              key={src + k}
              type="button"
              className={`thumb ${isPhoto(src) ? "photo" : ""} ${k === i ? "on" : ""}`}
              style={{ background: isPhoto(src) ? undefined : tileBg }}
              onClick={() => setI(k)}
              aria-label={`Show image ${k + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className={`main-shot ${isPhoto(cur) ? "photo" : ""}`} style={{ background: tileBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={cur} src={cur} alt={name} style={{ animation: "fadeUp .35s ease" }} />
      </div>
    </div>
  );
}
