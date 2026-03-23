# DocuMind — Intelligent Document Analysis

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

Une application web moderne pour l'analyse intelligente de documents. Extrayez automatiquement des entités, générez des résumés et interagissez avec vos documents via une interface conversationnelle.

![Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=DocuMind+Interface)

## ✨ Fonctionnalités

- **📤 Upload Multi-Format** : Support PDF, DOCX, PNG, JPG, TXT (max 50MB)
- **🤖 Analyse IA** : Extraction automatique d'entités (dates, montants, noms, organisations)
- **📝 Résumés Intelligents** : Génération automatique de résumés contextualisés
- **💬 Chat Interactif** : Posez des questions sur vos documents en langage naturel
- **🏷️ Classification** : Détection automatique du type de document
- **📊 Tableau de Bord** : Statistiques en temps réel et filtrage avancé
- **🎨 Interface Premium** : Design moderne avec animations fluides

## 🚀 Démarrage Rapide

### Prérequis

- Node.js ≥ 18.0
- npm ≥ 8.0

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/documind-frontend.git
cd documind-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
L'application sera accessible sur http://localhost:3000
Build Production
bash
Copy
npm run build
npm run preview
🏗️ Architecture
plain
Copy
documind-frontend/
├── public/                 # Assets statiques
├── src/
│   ├── components/         # Composants React réutilisables
│   │   ├── ChatBox.jsx        # Interface conversationnelle
│   │   ├── DocumentCard.jsx   # Carte document (grid/list)
│   │   ├── EntitiesPanel.jsx  # Affichage des entités extraites
│   │   ├── Navbar.jsx         # Navigation principale
│   │   └── UploadZone.jsx     # Zone de dépôt de fichiers
│   ├── pages/              # Pages de l'application
│   │   ├── HomePage.jsx         # Tableau de bord
│   │   └── DocumentPage.jsx     # Vue détail document
│   ├── utils/
│   │   └── api.js             # Client HTTP et endpoints API
│   ├── App.jsx             # Routeur principal
│   ├── index.css           # Styles Tailwind + custom
│   └── main.jsx            # Point d'entrée React
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
🛠️ Stack Technique
Table
Catégorie	Technologie
Framework	React 18.3 avec Hooks
Build Tool	Vite 5.4
Styling	Tailwind CSS 3.4
Routing	React Router DOM 6.24
HTTP Client	Axios 1.7
Icons	Lucide React
Upload	React Dropzone
📡 API Endpoints
Le frontend communique avec une API backend via les endpoints suivants :
Table
Méthode	Endpoint	Description
POST	/api/documents/upload	Upload de document avec suivi de progression
GET	/api/documents/	Liste des documents (avec filtres optionnels)
GET	/api/documents/:id	Détails d'un document spécifique
DELETE	/api/documents/:id	Suppression d'un document
POST	/api/chat/ask	Question/réponse sur un document
GET	/health	Vérification santé du backend
🎨 Design System
Couleurs Principales
Table
Token	Valeur	Usage
primary-500	#6366f1	Actions principales
primary-600	#4f46e5	Hover états
accent-cyan	#06b6d4	Informations
accent-purple	#8b5cf6	Highlights
accent-pink	#ec4899	Alertes douces
Composants Clés
Boutons
jsx
Copy
// Primaire avec gradient
<button className="btn-primary">Action</button>

// Secondaire outline
<button className="btn-secondary">Annuler</button>

// Ghost
<button className="btn-ghost">Option</button>
Cards
jsx
Copy
// Standard avec hover effect
<div className="card-premium">Contenu</div>

// Élevée avec ombre
<div className="card-elevated">Contenu important</div>
⚙️ Configuration
Variables d'Environnement
Créez un fichier .env à la racine :
env
Copy
VITE_API_URL=http://localhost:8000
Personnalisation Tailwind
Modifiez tailwind.config.js pour étendre le design system :
JavaScript
Copy
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          500: '#6366f1',
          900: '#312e81',
        }
      }
    }
  }
}
🔧 Dépannage
Erreur "framer-motion" manquant
bash
Copy
npm install framer-motion
Ou utilisez la version simplifiée sans animations dans App.jsx.
Warning PostCSS module type
Vérifiez que package.json contient :
JSON
Copy
{
  "type": "module"
}
Et que postcss.config.js utilise :
JavaScript
Copy
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
Styles Tailwind non appliqués
Vérifier l'import dans index.css :
css
Copy
@import url('...'); /* Première ligne */
@tailwind base;
@tailwind components;
@tailwind utilities;
Redémarrer le serveur Vite
📱 Responsive Breakpoints
Table
Breakpoint	Largeur	Usage
sm	640px	Mobile paysage
md	768px	Tablette
lg	1024px	Desktop
xl	1280px	Grand écran
🤝 Contribution
Fork le projet
Créez une branche (git checkout -b feature/AmazingFeature)
Committez vos changements (git commit -m 'Add some AmazingFeature')
Push vers la branche (git push origin feature/AmazingFeature)
Ouvrez une Pull Request
📄 Licence
Distribué sous licence MIT. Voir LICENSE pour plus d'informations.
👤 Contact
Votre Nom - @votre_twitter - email@example.com
Lien du projet : https://github.com/votre-username/documind-frontend
<p align="center">Made with ❤️ and ☕</p>
```