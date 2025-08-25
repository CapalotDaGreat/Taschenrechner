# Linear Optimization Problem Solver

// ...existing code...

## Vercel Deployment Hinweise

Falls beim Deployment auf Vercel die Fehlermeldung erscheint  
`Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.`

**Lösung:**
1. Stellen Sie sicher, dass die Datei `package.json` im Verzeichnis `nextjs-calculator` vorhanden ist und die Abhängigkeit `"next"` enthält:
   ```json
   {
     // ...existing code...
     "dependencies": {
       "next": "^13.0.0",
       // ...existing code...
     }
     // ...existing code...
   }
   ```
2. Setzen Sie in Vercel als Root Directory das Verzeichnis `nextjs-calculator`.
   - Im Vercel Dashboard: Project → Settings → General → Root Directory → `nextjs-calculator`
3. Starten Sie das Deployment erneut.

Dadurch erkennt Vercel die Next.js-Version und kann das Projekt erfolgreich bauen und deployen.

// ...existing code...