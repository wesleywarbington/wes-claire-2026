<INSTRUCTIONS>
## Global rules
- Always use Context7 MCP for library/API documentation, code generation, and setup/configuration steps unless explicitly told not to.
- Ensure new UI changes include a quick mobile layout check (stacking, spacing, tap targets) to avoid cramped layouts.
## Available MCP servers
- context7
- supabase
- vercel
## App structure and tooling
- Framework: Next.js App Router (`app/`), React 19
- Language: TypeScript (strict `true`)
- Routes: `app/` for pages/layouts, `app/api/` for route handlers
- Server actions: `app/actions.ts`
- Linting: `npm run lint` (ESLint)
- Package manager: npm (`package-lock.json`)
</INSTRUCTIONS>
