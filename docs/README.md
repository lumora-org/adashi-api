# Tertiary SMS Blueprint

This package contains the initial implementation-oriented documentation for a hosted, multi-tenant School Management System for universities (full-time and part-time), colleges of education, and colleges of nursing.

## Documents
- `01-product-requirements.md` — product scope, roles, requirements, and acceptance criteria
- `02-system-architecture.md` — architecture, tenancy, modules, scaling path
- `03-database-design.md` — logical schema baseline
- `04-api-specification.md` — initial REST API contract
- `05-security-and-tenancy.md` — security requirements and tenant isolation
- `06-development-roadmap.md` — milestones, tests, risks, and pilot gates
- `07-repository-agent-prompts.md` — prompts for the web and API coding agents

## How to use
1. Review the documents against the pilot institution's actual academic and financial workflows.
2. Place the `docs/` folder in both the `web` and `api` repositories.
3. Use the frontend prompt in `07-repository-agent-prompts.md` in the web repository.
4. Use the backend prompt in the same document in the API repository.
5. Require the coding agent to inspect existing code and report a plan before making large changes.
6. Treat the database and API documents as baselines; update them deliberately as decisions are confirmed.

This is an implementation baseline, not a substitute for institution-specific policy validation, security review, or payment-provider integration testing.
