Memoria PWA Plus (Paket 3)
=========================

Dieses Paket finalisiert Optik und Logik.
Nach Einbau von Paket 1 (Core) und Paket 2 (Assets) ersetzt Paket 3
nur zwei Dateien in deinem Projekt:
  - style.css
  - main.js

Ergebnis nach Einbau:
---------------------
- Neon-Dark UI mit Sidebar links, runden Pill-Buttons, Glow, weißer Text
- Mobile Bottom-Nav mit aktivem Zustand
- Karten (Panels) mit Pink/Cyan-Verlauf
- XP/Level-Box inkl. Fortschrittsbalken
- Deck-Erstellung, Import, Export
- Lernmodus mit Bewertung (again/hard/good/easy) und XP-Gutschrift
- Quests hinzufügen und abschließen → XP wird gutgeschrieben
- Stats-Ansicht (XP gesamt, Karten heute, Fokuszeit)
- PDF-Panel mit Buttons (Öffnen, Vorlesen, OCR, Zusammenfassen usw.)
  Hinweis: PDF-Rendering selbst hängt von pdf.js ab, Hooks sind vorbereitet
- Settings: Theme (neon / dark / light), Farbakzente, Voice-Auswahl
- KI-Hook vorbereitet (MEMORIA_SUMMARY_API)
- Toast-Benachrichtigungen (Snackbar rechts unten)

Einbauanleitung:
----------------
1. Entpacke diese ZIP.
2. Kopiere style.css und main.js in dein Memoria-Projekt und überschreibe die existierenden Dateien.
3. Fertig. Nicht mehr anfassen.

Optional (PDF KI Zusammenfassen):
---------------------------------
Du kannst (später) in deinem Code eine eigene Funktion definieren:
    window.MEMORIA_SUMMARY_API = async function (rawText) {
      // call your API / OpenAI / eigener Server
      return "deine Antwort von der KI";
    }
Dann nutzt der Button "Zusammenfassen" diese Funktion.

Du bist jetzt produktionsreif lokal und auf Netlify.
