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
Die Gäste haben kein GitHub-Konto. Ihre Antworten landen deshalb in einer Google-Tabelle, die nur dir gehört.
Anschauen musst du die Tabelle nie: Alles steht in der Wirts-App unter „Zusagen-Tabelle“.
1. Auf sheets.google.com eine neue, leere Tabelle anlegen.
2. Menü **Erweiterungen → Apps Script**. Vorhandenen Code löschen, Inhalt von `zusagen-apps-script.gs` einfügen
   und auf 💾 **Speichern** tippen (wichtig, sonst wird leerer Code bereitgestellt).
3. **Bereitstellen → Neue Bereitstellung** → Zahnrad → **Web-App**.
   Ausführen als: **Ich** · Zugriff: **Jeder** (nicht „Jeder mit Google-Konto“!) → **Bereitstellen**.
4. Berechtigungen erlauben (bei „Google hat diese App nicht überprüft“: Erweitert → Weiter zu …).
5. Die **Web-App-URL** kopieren (beginnt mit `https://script.google.com/macros/s/` und endet auf `/exec`).
6. In der **Wirts-App → Einstellungen** einfügen, **Testen** tippen. Klappt es, **Speichern**. Fertig.
   `konfig.js` musst du dafür nicht mehr ändern.

Sagt der Test, dass etwas nicht stimmt, steht dort direkt, woran es liegt.
Änderst du später etwas am Skript: Bereitstellen → Bereitstellungen verwalten → ✏️ → Version „Neue Version“ → Bereitstellen.

## Hinweise
- Gäste installieren nur die Gast-App über den Link (Browser-Menü → „Zum Startbildschirm“), mehr nicht.
- Wenn du später Dateien änderst: in `sw.js` die VERSION hochzählen (mwa-v3 …), damit alle Handys die neue Version bekommen.
- Das Repo ist öffentlich: `data.json` (Regeln, Getränke, Bierpong-Namen) kann jeder lesen, der danach sucht.
- Das Namens-Login hat kein Passwort. Theoretisch kann jemand unter fremdem Namen zusagen. Falsche Einträge entfernst du in der Wirts-App mit ✕.
