# ADHD-Centered Executive function Support (🂱ACES)

## Freeze-Drying Working Task Context

**ADHD-Centered Executive-functioning Support (or 🂱 ACES)** is a project at CMU's Variability Lab focused on providing executive function support for individuals with ADHD. The goal of the project is to design a tool that passively and automatically analyzes users' previous computer-based activity, with the intention of providing useful contextual information to aid task resumption.

This project is motivated by the fact that individuals with ADHD often benefit from executive functioning support. One of the common pain points for people with ADHD is the process of task resumption, which is crucial not only for performance but also for maintaining motivation. The ability to efficiently return to a task after interruption can significantly impact productivity and reduce frustration.

🂱 ACES explores what contextual information users may find useful, as well as ways to represent this information effectively. We anticipate investigating a variety of sources, including browsing history metadata, user-provided labels, and semantic data on the user's computer display, as relevant data to ascertain users' contexts.

Through 🂱 ACES, we aim to develop and test an initial executive function helper tool on which to conduct user studies, identifying best practices for task resumption. Following user testing, we plan to release an open-source version of the tool, making it accessible to a wider audience who may benefit from its features.

### Other things to read about building

![build](https://github.com/chibat/chrome-extension-typescript-starter/workflows/build/badge.svg)

Chrome Extension, TypeScript and Visual Studio Code

## Prerequisites

- [node + npm](https://nodejs.org/) (Current Version)

## Option

- [Visual Studio Code](https://code.visualstudio.com/)

## Includes the following

- TypeScript
- Webpack
- React
- Jest
- Example Code
  - Chrome Storage
  - Options Version 2
  - content script
  - count up badge number
  - background

## Project Structure

- src/typescript: TypeScript source files
- src/assets: static files
- dist: Chrome Extension directory
- dist/js: Generated JavaScript files

## Setup

```
npm install
```

## Import as Visual Studio Code project

...

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Test

`npx jest` or `npm run test`
