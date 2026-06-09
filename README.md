# Ortizello ✅

Gestor de tareas tipo Trello con tableros personalizables, drag & drop y autenticación por usuario.

## Tecnologías

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + Flask + SQLAlchemy
- **Base de datos:** PostgreSQL (producción) / SQLite (desarrollo)
- **Autenticación:** JWT
- **Deployment:** Railway (backend) + Vercel (frontend)

## Demo en vivo

🔗 https://ortizello.vercel.app

## Instalación local

**Requisitos**
- Python 3.10+
- Node.js 18+

**Backend**

1. Clona el repositorio
```bash
git clone https://github.com/dantaralex14/ortizello.git
cd ortizello/backend
```

2. Crea y activa el entorno virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Instala dependencias
```bash
pip install -r requirements.txt
```

4. Configura variables de entorno — crea un archivo `.env`:

SECRET_KEY=tu-clave-secreta
DATABASE_URL=sqlite:///ortizello.db

5. Corre el servidor
```bash
python app.py
```

**Frontend**

1. Desde la carpeta raíz
```bash
cd ortizello
npm install
npm run dev
```

2. Abre `http://localhost:5173` en tu navegador

## Funcionalidades

- Registro e inicio de sesión con JWT
- Crear tableros con colores personalizados
- Columnas por defecto: Por hacer, En progreso, Hecho
- Agregar columnas personalizadas
- Tarjetas con título, descripción, fecha límite y color
- Drag & drop para mover tarjetas entre columnas
- Eliminar tableros, columnas y tarjetas
- Diseño responsive con animaciones

## Estado del proyecto

✅ Proyecto completado y desplegado en producción — Junio 2026
