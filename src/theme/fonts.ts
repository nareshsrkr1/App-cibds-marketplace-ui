/**
 * Self-hosted fonts under public/fonts (latin woff2).
 * Includes Cormorant italic 600/700 for thick KPI numerals (HTML SoT parity).
 * No Fontsource / Google Fonts packages — works on restricted corporate npm networks.
 *
 * Roboto is the one exception: bundled locally via @fontsource at build time
 * (no runtime CDN). Used only inside the Producer Console, standing in for
 * Google Sans (proprietary, not publicly licensable) — Roboto is Google's own
 * open-source font from the same design era/team.
 */
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import './fonts.css';
