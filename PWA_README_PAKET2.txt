Memoria PWA Assets (Paket 2)
===========================

Dieses Paket macht Memoria installierbar (Add to Home Screen / Install App)
und definiert Branding.

Enthalten:
----------
1. manifest.webmanifest
   - Name, Farben, Start-URL, Icons
   - "display": "standalone" = wirkt wie echte App ohne Browser UI

2. icons/
   - icon-192.png
   - icon-512.png
   - favicon.ico
   Diese Dateien sind Platzhalter. Ersetze sie durch dein Memoria-Icon
   (Neon Buch + Portal), aber behalte exakt die Dateinamen.

3. PWA_README_PAKET2.txt


Einbau:
-------
1. Entpacke diese ZIP in dein Projektverzeichnis "memoria" (neben index.html).
   Danach sollte deine Struktur so aussehen:

     memoria/
       index.html
       ...
       manifest.webmanifest
       icons/icon-192.png
       icons/icon-512.png
       icons/favicon.ico

2. In allen HTML-Dateien aus Paket 1 sind diese Links im <head> schon vorhanden:
     <link rel="manifest" href="manifest.webmanifest">
     <link rel="icon" href="icons/icon-192.png" type="image/png">
     <meta name="theme-color" content="#0f0f1a">

   Du musst nichts mehr einfügen.

3. Icons austauschen:
   - icon-192.png  -> 192x192 PNG Version deines Icons
   - icon-512.png  -> 512x512 PNG Version deines Icons
   - favicon.ico   -> 32x32 ICO Version fürs Browser-Tab
   Wichtig: Dateinamen exakt gleich lassen.

Test Installation:
------------------
- Starte lokal (http://localhost/...)
- Öffne Chrome DevTools (F12) → "Application" → "Manifest"
  Dort siehst du Memoria, Farben, Icons, Installierbarkeit.
- Auf Android/Chrome erscheint dann "Zum Startbildschirm hinzufügen"
  bzw. in Desktop Chrome/Edge "Installieren".

Farben Splashscreen:
--------------------
background_color: #090915   (sehr dunkles Violett / Schwarz)
theme_color:      #0f0f1a   (dein App-Hintergrund)
Das verhindert weißen Flash beim Start.

Nächstes Paket (Paket 3):
-------------------------
- finale style.css (Neon-Glow, weißer Text mit leichtem Glow, Mobile Bottom Nav etc.)
- finales main.js (XP-System, Deck-Verwaltung, Quests, PDF inkl. OCR/Sprachausgabe/KI-Hook)
