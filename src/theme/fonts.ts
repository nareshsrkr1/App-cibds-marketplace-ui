/**
 * Self-hosted fonts under public/fonts (latin woff2).
 * Includes Cormorant italic 600/700 for thick KPI numerals (HTML SoT parity).
 * No Fontsource / Google Fonts packages — works on restricted corporate npm networks.
 *
 * Roboto is the one exception: bundled locally via @fontsource at build time
 * (no runtime CDN), standing in for Google Sans (proprietary, not publicly
 * licensable) — Roboto is Google's own open-source font from the same design
 * era/team. Used inside the Producer Console and the landing page so far;
 * rolling out to the rest of the app gradually. 600-italic backs the landing
 * page's accent words (h1/CTA em) so they keep an italic "lift" in Roboto
 * instead of switching families for just those words.
 */
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600-italic.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';
import './fonts.css';
