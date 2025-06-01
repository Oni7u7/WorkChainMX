# WorkChainMX

Plataforma de microcréditos descentralizados construida con React y Polkadot.

## Características

- Autenticación segura con Polkadot
- Dashboard interactivo para gestión de microcréditos
- Integración con blockchain de Polkadot
- Interfaz moderna y responsiva con TailwindCSS
- Pruebas automatizadas con Vitest
- Linting y formateo de código con ESLint y Prettier

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Polkadot.js Extension para el navegador

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/workchainmx.git
cd workchainmx
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta ESLint
- `npm run format` - Formatea el código con Prettier
- `npm run test` - Ejecuta las pruebas
- `npm run test:coverage` - Ejecuta las pruebas con cobertura

## Estructura del Proyecto

```
workchainmx/
├── src/
│   ├── components/     # Componentes React reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utilidades y helpers
│   ├── services/      # Servicios y APIs
│   ├── test/          # Configuración y utilidades de pruebas
│   └── App.jsx        # Componente principal
├── public/            # Archivos estáticos
├── index.html         # Punto de entrada HTML
└── package.json       # Dependencias y scripts
```
##Herramientas usadas

Remix para deployar contratos: https://remix.ethereum.org/#lang=en&optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.30+commit.73712a01.js
Metamask con la red de Moonbase Alpha (tokens de prueba)
ChainsList: https://chainlist.org/chain/1287
Cursor

## Consulta de Contratos usando MoonBase

https://moonbase.moonscan.io/address/0x0D185F4a939953aee2bF829BBE5b00eCe4302105


## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter) - email@ejemplo.com

Link del Proyecto: [https://github.com/tu-usuario/workchainmx](https://github.com/tu-usuario/workchainmx)
