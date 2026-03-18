Memoria PWA Core (Paket 1)
==========================

Dieses Paket ist drop-in ready.
Du musst NICHTS mehr manuell in deine HTML-Dateien einfügen.

Inhalte:
- Alle HTML-Dateien mit bereits eingebauter Service-Worker-Registrierung,
  Manifest-Link und Icon-Link.
- sw.js (Service Worker für Offline Cache).
- vendor/pdfjs/ (Stub-Dateien, damit das Caching sauber durchläuft).
- PWA_README_PAKET1.txt (diese Anleitung).

Verwendung:
1. Entpacke diese ZIP.
2. Kopiere ALLE Dateien in deinen Projektordner "memoria" (überschreibe vorhandene HTML).
3. style.css und main.js behältst du aus deinem Projekt oder ersetzt sie später durch Paket 3.
4. Starte lokal über Live Server / http://localhost/... statt per Doppelklick,
   weil Service Worker über file:// blockiert wird.

Danach:
- Deine App cached sich selbst.
- Läuft offline.
- Ist technisch eine echte PWA-Basis.

Paket 2 liefert:
- manifest.webmanifest mit App-Name Memoria
- icons/icon-192.png, icons/icon-512.png, favicon.ico (Neon-Dark)
- Splashscreen-Farbe (dunkel mit Pink/Cyan)

Paket 3 liefert:
- finale style.css (Neon+Glow, Mobile Bottom Nav, etc.)
- finales main.js (XP-System, Deck-Import/Export, PDF-Reader mit OCR & KI-Hook)
