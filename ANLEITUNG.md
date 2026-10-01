# Metzgers Wirtshaus Abende – Einrichtung

## 1. Repo anlegen (wie gehabt)
- Auf github.com das Repo **metzgers-wirtshaus** anlegen (Public).
- Alle Dateien aus diesem Ordner hochladen („Add file“ → „Upload files“). Vorhandene Dateien einfach überschreiben.
- Settings → Pages → „Deploy from a branch“, Branch **main**, Ordner **/ (root)** → Save.
- Gast-App: https://smc0705.github.io/metzgers-wirtshaus/
- Wirts-App: https://smc0705.github.io/metzgers-wirtshaus/admin.html

## 2. Schlüssel für die Wirts-App (nur einmal)
- GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
- Repository access: **Only select repositories** → metzgers-wirtshaus.
- Permissions → Repository permissions → **Contents: Read and write**.
- Ablaufdatum wählen (z. B. 1 Jahr), Token kopieren und in der Wirts-App einfügen.

## 3. Zusagen einrichten (Google-Tabelle, kostenlos, ca. 5 Minuten)
Die Gäste haben kein GitHub-Konto. Ihre Zusagen landen deshalb in einer Google-Tabelle, die nur du besitzt.
1. Auf sheets.google.com eine neue, leere Tabelle anlegen, z. B. „Wirtshaus Zusagen“.
2. Menü **Erweiterungen → Apps Script**. Den vorhandenen Code löschen, den Inhalt von
   `zusagen-apps-script.gs` einfügen, oben auf 💾 Speichern.
3. Oben rechts **Bereitstellen → Neue Bereitstellung** → Zahnrad → **Web-App**.
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
4. **Bereitstellen**, Google fragt nach Berechtigungen → erlauben
   (bei „Google hat diese App nicht überprüft“: Erweitert → Weiter zu …).
5. Die **Web-App-URL** (endet auf `/exec`) kopieren und in `konfig.js` bei `zusagenUrl` eintragen.
6. `konfig.js` neu auf GitHub hochladen. Fertig.

Die Zusagen kannst du jederzeit direkt in der Tabelle ansehen oder korrigieren.

## Hinweise
- Gäste installieren nur die Gast-App über den Link (Browser-Menü → „Zum Startbildschirm“), mehr nicht.
- Wenn du später Dateien änderst: in `sw.js` die VERSION hochzählen (mwa-v3 …), damit alle Handys die neue Version bekommen.
- Das Repo ist öffentlich: `data.json` (Regeln, Getränke, Bierpong-Namen) kann jeder lesen, der danach sucht.
- Das Namens-Login hat kein Passwort. Theoretisch kann jemand unter fremdem Namen zusagen. Falsche Einträge entfernst du in der Wirts-App mit ✕.
