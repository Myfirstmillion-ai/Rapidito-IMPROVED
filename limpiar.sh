#!/bin/bash

echo "--- 1. Iniciando limpieza de Git ---"

# Intentar borrar node_modules de Frontend (si existe en git)
git rm -r --cached Frontend/node_modules 2>/dev/null
echo "✔ Frontend revisado"

# Intentar borrar node_modules de Backend (si existe en git)
git rm -r --cached Backend/node_modules 2>/dev/null
echo "✔ Backend revisado"

echo "--- 2. Actualizando .gitignore ---"
# El >> agrega la línea al final sin borrar lo que ya tienes
echo "**/node_modules" >> .gitignore

echo "--- 3. Subiendo cambios a GitHub ---"
git add .
git commit -m "Auto: Eliminar node_modules para arreglar ZIP"
git push

echo "--- ¡LISTO! Intenta descargar el ZIP ahora ---"
