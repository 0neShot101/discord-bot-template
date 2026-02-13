<p align="center">
	<img src="https://i.imgur.com/ugzrV7e.png" alt="Discord Bot Template" width="200">
</p>

# Discord Bot Template

<p align="center">
	<a href="https://discord.js.org"><img src="https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js"></a>
	<a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Runs on Bun"></a>
	<a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
	<a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"></a>
	<a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"></a>
	<a href="https://eslint.org"><img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"></a>
	<a href="https://prettier.io"><img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier"></a>
	<a href="./LICENSE"><img src="https://img.shields.io/badge/License-Source_Available-blue?style=for-the-badge" alt="License"></a>
</p>

An opinionated Discord.js v14 starter that pairs Bun, TypeScript, and a modular architecture so you can focus on shipping features instead of wiring boilerplate. Commands, events, buttons, dropdowns, and modals auto-load, guards are reusable middleware, and MongoDB plus Redis connections are ready out of the box.

## Highlights
- Command framework with reusable guard middleware, automatic subcommand routing, and typed error hooks (`src/structures/Command.ts`).
- Interaction loader that discovers buttons, dropdowns, select menus, modals, and context menu handlers from `src/interactables/**` with zero manual registration.
- Environment bootstrapper that creates `.env` from `.env.example`, validates required keys, and even opens an editor for you when values are missing.
- Built-in MongoDB client with command logging plus a Redis cache that gracefully falls back to in-memory storage.
- Bun-powered DX: watch mode via `bun --watch`, fast installs, strict TypeScript config, ESLint + Prettier.
- Structured logging powered by Pino with pretty console output in development and file outputs in production.

## Requirements
- [Bun](https://bun.sh/docs/installation) 1.1+ (provides the runtime, package manager, and Redis bindings).
- Node.js 18+ is recommended for tooling compatibility (TypeScript, ESLint).
- A Discord application with a bot token and at least one guild you can use for development.
- MongoDB and Redis instances (local Docker containers work fine) if you plan to use the provided services.

## Getting Started
1. Clone the repository and install dependencies

	```bash
	git clone https://github.com/0neShot101/discord-bot-template.git discord-bot-template
	cd discord-bot-template
	bun install
	```

2. Copy the example environment file and fill in your credentials

	```bash
	cp .env.example .env
	```

3. Start the bot in watch mode while you iterate

	```bash
	bun dev
	```

4. Run `bun start` when you want to execute the compiled app, or `bun run build` to emit `dist/` only.

## Available Scripts
| Command        | Description |
| -------------- | ----------- |
| `bun dev`      | Runs `src/index.ts` in watch mode for rapid iteration.
| `bun start`    | Runs the bot once (no watch) via Bun runtime.
| `bun run build`| Transpiles TypeScript into `dist/` using `tsc`.
| `bun run typecheck` | Runs the TypeScript compiler with `--noEmit` for CI.
| `bun run lint` | ESLint across the repo using the flat config in `eslint.config.js`.
| `bun run format` | Applies Prettier to every supported file.
| `bun run commands deploy` | Deploy slash commands to Discord (guild or global).
| `bun run commands clear` | Remove all registered commands from Discord.
| `bun run commands list` | Compare local commands against what Discord has registered.

### Command Registration
Slash commands need to be registered with Discord before they appear in servers. The template handles this automatically in development and gives you a CLI for production.

**Development (automatic):** When `NODE_ENV=development` (the default), commands auto-register to your dev guild on startup. Guild-scoped commands propagate instantly so you can iterate fast. Hash-based change detection skips the API call if nothing changed.

**Production (explicit):** Auto-registration is off by default in production. Deploy commands when you're ready:

```bash
bun run commands deploy          # auto-detects scope from NODE_ENV
bun run commands deploy --global # force global registration
bun run commands deploy --guild  # force guild registration
bun run commands deploy --force  # skip change detection
bun run commands clear --global  # remove all global commands
bun run commands list            # diff local vs registered commands
```

**Separate dev/prod bots:** Use different `.env` files per environment with different bot credentials. The `.env` is gitignored so each environment gets its own config.

## Environment Variables
| Key | Required | Description |
| --- | -------- | ----------- |
| `DISCORD_TOKEN` | Yes | Bot token from the Discord Developer Portal.
| `DISCORD_CLIENT_ID` | Yes | Application (bot) ID used for slash command registration.
| `DISCORD_DEVELOPMENT_GUILD_ID` | Yes | Guild ID used for registering commands during development.
| `MONGODB_URI` | No | MongoDB connection string (leave empty to disable).
| `MONGODB_DB_NAME` | No | Database name to use once connected (leave empty to disable).
| `REDIS_URL` | No | Redis connection string (falls back to in-memory cache if unavailable).
| `NODE_ENV` | No | Defaults to `development`. Controls logging verbosity and command registration scope.
| `LOG_LEVEL` | No | Overrides default Pino log level.
| `AUTO_REGISTER_COMMANDS` | No | Auto-register commands on startup. Defaults to `true` in development, `false` in production.

> Tip: `src/utils/environment.ts` validates these keys at startup, creates `.env` if it is missing, and attempts to open the file in your editor when required keys are absent. Fill everything out once and the template will refuse to boot with incomplete configuration, saving time later.

## Project Layout
```
src/
  index.ts                # Entry point, signal handlers, client.run()
  client.ts               # Client instance (separate from index to avoid circular imports)
  cli/                    # Command registration CLI (bun run commands)
  events/                 # Event definitions extending src/structures/Event.ts
  guards/                 # Middleware such as cooldown, access, permissions
  handlers/               # File system loaders for commands, events, interactions
  interactables/          # Slash commands, buttons, dropdowns, modals, context menus
  services/database/      # MongoDB + Redis helpers (lazy connections)
  structures/             # Base classes for commands, interactions, events, guards
  types/                  # TypeScript type definitions
  utils/                  # Logging, env management, shutdown hooks, walkers
```

Path aliases (`@utils`, `@structures`, etc.) are defined in `tsconfig.json`, so imports stay concise.

## Working With Commands and Interactions
- **Slash commands**: Create a new file under `src/interactables/commands`. Export instances of `Command` (or `ContextMenuCommand`) and call `.run()` with your handler. Attach guard middleware via the `guards` property to reuse cooldowns, channel restrictions, or permission checks.
- **Buttons, select menus, modals, dropdowns**: Place files in the matching folder under `src/interactables`. Each file exports `Interaction` instances keyed by their custom IDs. The loader handles registration automatically.
- **Events**: Add `Event` instances to `src/events`. Setting the second constructor argument to `true` marks the event as once-only (see `ready.ts`).

### Subcommands made easy
`src/utils/subCommandRouter.ts` parses the builder config and routes nested subcommands before your handler executes. Use the `subcommands` property when creating a `Command` to keep large commands tidy without manual switch statements.

## Data Layer
- **MongoDB**: `src/services/database/mongodb.ts` creates a client lazily — no connection happens until a command actually queries the database. Import `mongodb` and call `.collection()` anywhere. Operations are logged at debug level. Both MongoDB and its database name are optional; leave the env vars empty to disable.
- **Redis cache**: `src/services/database/redis.ts` wraps Bun's Redis client. Call `redis.connect()` when you need it. If Redis is unreachable or unconfigured, it silently falls back to an in-memory map.
- **Graceful shutdown**: `src/utils/shutdown.ts` listens to `SIGINT`/`SIGTERM`, closes database clients, and exits cleanly to avoid dangling connections.

## Deployment Notes
1. Set `NODE_ENV=production` in your production `.env`.
2. Deploy slash commands before going live: `bun run commands deploy`.
3. Ensure MongoDB and Redis are reachable from your host if you use them (cloud services, managed instances, or Docker containers with exposed ports).
4. Configure log rotation by mounting `./logs` or redirecting stdout wherever you deploy; production logging writes to `logs/app.log` and `logs/error.log`.
5. Use `bun run build` followed by `bun start` with a process manager (PM2, systemd) if you prefer running compiled output.

---

## License

This project uses a source-available license that permits free non-commercial use while requiring a commercial license for revenue-generating projects. See the [LICENSE](LICENSE) file for full terms.

**In short:**
- Personal projects, learning, open-source contributions: go for it, just keep attribution.
- Making money with it (SaaS, paid bots, client work): reach out first.

---

This template aims to get you past the boring setup phase quickly. Wire your own features into the provided structures, drop your credentials into `.env`, and start shipping.
