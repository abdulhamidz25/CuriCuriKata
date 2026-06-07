/**
 * Curi-Curi Kata: Character Sprites Injection Module
 * Menyimpan data mentah dan rendering SVG untuk Hero dan Penjahat.
 */

const HERO_SVG = `
<svg id="heroSprite" class="w-full h-full" viewBox="0 0 100 140">
  <!-- Boots -->
  <rect x="30" y="118" width="18" height="12" fill="#3b2314" rx="2" />
  <rect x="52" y="118" width="18" height="12" fill="#3b2314" rx="2" />
  <!-- Legs -->
  <rect x="34" y="94" width="12" height="26" fill="#1e3a8a" />
  <rect x="54" y="94" width="12" height="26" fill="#1e3a8a" />
  <!-- Belt with Gold Buckle -->
  <rect x="28" y="90" width="44" height="6" fill="#78350f" rx="1" />
  <rect x="46" y="88" width="8" height="10" fill="#f59e0b" rx="1" />
  <!-- Torso (Green tactical vest) -->
  <rect x="26" y="54" width="48" height="38" fill="#047857" rx="6" />
  <!-- Shoulder Pad -->
  <rect x="22" y="52" width="12" height="10" fill="#64748b" rx="2" />
  <!-- Bandana Tail -->
  <path d="M 22 36 L 10 40 L 18 46 Z" fill="#10b981" />
  <!-- Neck -->
  <rect x="44" y="48" width="12" height="8" fill="#fbcfe8" />
  <!-- Head -->
  <circle cx="50" cy="36" r="16" fill="#fbcfe8" />
  <!-- Expressive Hair -->
  <path d="M 34 32 Q 34 22 46 22 L 46 36 Z" fill="#451a03" />
  <path d="M 66 32 Q 66 22 54 22 L 54 36 Z" fill="#451a03" />
  <!-- Determined Eyes -->
  <rect x="40" y="32" width="5" height="5" fill="#000000" />
  <rect x="55" y="32" width="5" height="5" fill="#000000" />
  <!-- Smile -->
  <path d="M 46 45 Q 50 49 54 45" stroke="#000000" stroke-width="2.5" fill="none" />
  <!-- Bandana Headband -->
  <rect x="34" y="24" width="32" height="6" fill="#10b981" />
  <circle cx="50" cy="27" r="2.5" fill="#ffffff" />
  <!-- Right Arm with Sword -->
  <g id="heroSwordG" class="origin-bottom-left" style="transform-origin: 75px 86px;">
    <circle cx="75" cy="80" r="7.5" fill="#1f2937" />
    <rect x="71" y="66" width="8" height="14" fill="#64748b" />
    <rect x="63" y="62" width="24" height="5" fill="#f59e0b" rx="1" />
    <path d="M 70 62 L 70 12 L 75 4 L 80 12 L 80 62 Z" fill="#cbd5e1" stroke="#38bdf8" stroke-width="2" />
  </g>
</svg>
`;

const ENEMY_SVG = `
<svg id="enemySprite" class="w-full h-full" viewBox="0 0 100 140">
  <!-- Combat Boots -->
  <rect x="30" y="118" width="18" height="12" fill="#0f172a" rx="2" />
  <rect x="52" y="118" width="18" height="12" fill="#0f172a" rx="2" />
  <!-- Camo Cargo Pants -->
  <rect x="34" y="94" width="12" height="26" fill="#4b5563" />
  <rect x="54" y="94" width="12" height="26" fill="#4b5563" />
  <!-- Camo Patches -->
  <rect x="36" y="100" width="6" height="6" fill="#1f2937" />
  <rect x="56" y="106" width="6" height="6" fill="#111827" />
  <!-- Ammo Belt -->
  <rect x="28" y="90" width="44" height="6" fill="#374151" />
  <!-- Torso (Black Heavy Armor) -->
  <rect x="26" y="54" width="48" height="38" fill="#1e293b" rx="6" />
  <rect x="34" y="60" width="32" height="22" fill="#7f1d1d" rx="2" />
  <!-- Ammo slots -->
  <rect x="38" y="64" width="6" height="12" fill="#f59e0b" />
  <rect x="47" y="64" width="6" height="12" fill="#f59e0b" />
  <rect x="56" y="64" width="6" height="12" fill="#f59e0b" />
  <!-- Neck (Masked) -->
  <rect x="44" y="48" width="12" height="8" fill="#0f172a" />
  <!-- Head (Balaclava) -->
  <circle cx="50" cy="36" r="16" fill="#0f172a" />
  <!-- Goggles -->
  <rect x="36" y="28" width="28" height="8" fill="#dc2626" rx="2" />
  <circle cx="43" cy="32" r="3.5" fill="#facc15" />
  <circle cx="57" cy="32" r="3.5" fill="#facc15" />
  <!-- Left Hand (Dynamite Pack) -->
  <circle cx="20" cy="80" r="7.5" fill="#111827" />
  <rect x="8" y="70" width="8" height="18" fill="#b91c1c" rx="1" />
  <line x1="12" y1="70" x2="12" y2="64" stroke="#f59e0b" stroke-width="2" />
  <!-- Right Hand with Crowbar -->
  <g id="enemyWeaponG">
    <circle cx="80" cy="80" r="7.5" fill="#111827" />
    <path d="M 78 92 L 84 46 Q 87 35 96 39 L 91 48" stroke="#dc2626" stroke-width="5" stroke-linecap="round" fill="none" />
  </g>
</svg>
`;

// Helper untuk menyuntikkan Sprite SVG ke dalam Container HTML
function injectSprites() {
  const heroCont = document.getElementById('heroSpriteContainer');
  const enemyCont = document.getElementById('enemySpriteContainer');
  if (heroCont) heroCont.innerHTML = HERO_SVG;
  if (enemyCont) enemyCont.innerHTML = ENEMY_SVG;
}
