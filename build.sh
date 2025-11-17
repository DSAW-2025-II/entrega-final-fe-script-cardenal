#!/bin/bash

echo "🚀 Building Wheels Frontend..."

# Instalar dependencias
npm install

# Build de Vite (compila React)
npm run build

# Copiar archivos JS y CSS que no son de React
echo "📦 Copiando archivos estáticos..."
cp -r frontend/js dist/
cp -r frontend/css dist/

echo "✅ Build completado!"
