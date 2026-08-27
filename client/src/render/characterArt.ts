import { CHARACTER_IDS, type CharacterId } from "@tower/shared";

export const CHARACTER_LABEL: Record<CharacterId, string> = {
  princess: "公主",
  warrior: "勇士",
};

/**
 * Front-facing bust icons, front-facing, 64x64 viewBox.
 * Single source of truth: used both as the lobby selection preview (injected
 * as inline markup) and as the in-game sprite texture (loaded as a data URI).
 */
export const CHARACTER_SVG: Record<CharacterId, string> = {
  princess: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M14 34 Q10 14 32 10 Q54 14 50 34 L50 46 Q50 30 44 28 Q46 40 40 44 L40 30 Q34 40 32 44 Q30 40 24 30 L24 44 Q18 40 20 28 Q14 30 14 46 Z" fill="#f2c744"/>
  <circle cx="32" cy="26" r="11" fill="#ffd9b3"/>
  <circle cx="24" cy="29" r="2.2" fill="#ff9fb2" opacity="0.85"/>
  <circle cx="40" cy="29" r="2.2" fill="#ff9fb2" opacity="0.85"/>
  <circle cx="27" cy="25" r="1.6" fill="#3a2b20"/>
  <circle cx="37" cy="25" r="1.6" fill="#3a2b20"/>
  <path d="M28 31 Q32 34.5 36 31" stroke="#a15c3e" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M20 14 L24 6 L29 12 L32 4 L35 12 L40 6 L44 14 Z" fill="#ffd700" stroke="#c9960c" stroke-width="1"/>
  <circle cx="32" cy="10.5" r="1.6" fill="#ff5c8a"/>
  <path d="M14 52 Q20 40 32 40 Q44 40 50 52 L50 60 L14 60 Z" fill="#ff8fab"/>
  <path d="M20 52 Q26 44 32 44 Q38 44 44 52" stroke="#ffd1de" stroke-width="2" fill="none"/>
</svg>`.trim(),
  warrior: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M20 16 Q32 6 44 16 L44 20 Q32 14 20 20 Z" fill="#3a2b20"/>
  <circle cx="32" cy="24" r="10" fill="#e0a578"/>
  <circle cx="28" cy="23" r="1.4" fill="#241a12"/>
  <circle cx="36" cy="23" r="1.4" fill="#241a12"/>
  <path d="M28 29.5 L36 29.5" stroke="#7a4a2f" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M16 40 Q20 32 32 32 Q44 32 48 40 L48 58 L16 58 Z" fill="#141414"/>
  <path d="M16 40 L10 48 L14 52 L20 44 Z" fill="#141414"/>
  <path d="M48 40 L54 48 L50 52 L44 44 Z" fill="#141414"/>
  <path d="M26 42 Q32 36 38 42 Q34 41 32 44 Q30 41 26 42 Z" fill="#cfd6da"/>
  <path d="M18 58 L30 58 L30 63 L20 63 Z" fill="#3a5a9c"/>
  <path d="M34 58 L46 58 L44 63 L34 63 Z" fill="#3a5a9c"/>
</svg>`.trim(),
};

function characterSvgDataUri(character: CharacterId): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(CHARACTER_SVG[character])}`;
}

export function characterTextureKey(character: CharacterId): string {
  return `char_${character}`;
}

/**
 * Rasterizes each character's SVG onto an offscreen canvas up front.
 *
 * Phaser's asset loader can hand WebGL a texture before an SVG data-URI
 * `<img>` has actually finished decoding (unsized SVGs have no reliable
 * intrinsic size), which reliably produces solid-black in-game sprites even
 * though the same markup renders fine as inline DOM (the lobby preview).
 * `decode()` + `drawImage` guarantees fully-rasterized pixels before the
 * canvas is ever handed to Phaser.
 */
export async function rasterizeCharacterIcons(size = 64): Promise<Record<CharacterId, HTMLCanvasElement>> {
  const entries = await Promise.all(
    CHARACTER_IDS.map(async (character) => {
      const img = new Image();
      img.src = characterSvgDataUri(character);
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D canvas context unavailable");
      ctx.drawImage(img, 0, 0, size, size);

      return [character, canvas] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<CharacterId, HTMLCanvasElement>;
}
