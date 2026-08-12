# PosterCraft: Browser-Based Poster Design and Background Removal

> Design marketing posters in your browser. Place logos, upscale images and remove backgrounds with one click. Built with React 19 and TypeScript, and every image is processed on your own device.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Privacy](https://img.shields.io/badge/Processing-On_Device-success?style=for-the-badge)](#)

## What it does

Marketing teams produce the same poster over and over with a different photo and the same branding. PosterCraft turns that into a repeatable, few-click job: drop in an image, the background comes off automatically, the logo lands in the right place, and the result exports at full resolution.

Background removal runs locally in the browser through `@imgly/background-removal`, so no image is ever uploaded to a server.

## Features

- **One-click background removal**: AI matting running fully in the browser
- **Logo placement**: consistent brand positioning across every poster
- **Image upscaling**: raise resolution before export
- **Live preview**: see the composition as you edit
- **On-device processing**: images never leave the machine
- **High-resolution export**: download print-ready output

## Getting started

### Prerequisites

Node.js 18 or newer.

### Installation

```bash
git clone https://github.com/AnubhavChaturvedi-GitHub/postercraft-bd.git
cd postercraft-bd
npm install
npm run dev
```

Open the localhost URL Vite prints.

### Build

```bash
npm run build
npm run preview
```

The static bundle in `dist/` deploys to Netlify, Vercel or any static host.

## Usage

1. Upload the subject photo.
2. Let background removal run, it happens locally and takes a few seconds on first load while the model downloads.
3. Position the logo and adjust the layout.
4. Upscale if you need more resolution.
5. Export the finished poster.

## Project structure

```
src/components/   UI components
src/utils/        image processing helpers
src/types.ts      shared TypeScript types
src/App.tsx       application shell
```

## Tech stack

React 19, TypeScript, Vite, `@imgly/background-removal`, Canvas API.

## Contributing

Issues and pull requests are welcome.

## License

See the repository license file.

## Author

**Anubhav Chaturvedi**, founder of [NetHyTech](https://www.youtube.com/@NetHyTech), a developer community of 30,000+ members.

[![YouTube](https://img.shields.io/badge/YouTube-NetHyTech-FF0000?style=flat-square&logo=youtube&logoColor=white)](https://www.youtube.com/@NetHyTech)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anubhav-chaturvedi-/)

If this project saved you time, a star on the repo helps other people find it.
