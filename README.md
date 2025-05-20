## Description

A Battleship game app built with Node.js **without using any frameworks**.  
Completed as part of the [RS School: WebsSocket Battleship Server](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/battleship/assignment.md) course assignment.

## Usage

1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone this repo locally
3. Navigate to `battleship`
4. Checkout dev branch
5Install all dependencies using [`npm install`](https://docs.npmjs.com/cli/install)
6Copy `.env.development` or `.env.production` to `.env` file
7Run the application (e.g., in development mode) `npm run start:dev`

## Work modes

1. `npm run start:dev` - Development mode
2. `npm run start:prod` - Production mode: starts the build process and then runs the bundled file

## API Overview

The application uses a single **in-memory database**.

By default app starts the server at `ws://localhost:3000`.
Port number can be changed via the `.env`-file (not recommended as UI app uses 3000 port).


