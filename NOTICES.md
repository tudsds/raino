# Notices & Acknowledgements

## Raino License

Raino is released under the MIT License. See [LICENSE](LICENSE).

## Third-Party Open Source Acknowledgements

The following open-source projects inspired or informed Raino's architecture:

### Agent Frameworks

- **Oh-my-opencode** — Dual-prompt agent orchestration, hook system
  - Repository: https://github.com/code-yeongyu/oh-my-openagent
  - License: SUL-1.0

- **Opencode** — Agentic development environment with tool orchestration
  - Repository: https://github.com/opencode-ai/opencode
  - License: MIT

- **OpenHarness** — LLM-based test generation and automation harness
  - Repository: https://github.com/tdsdevlop/openharness
  - License: MIT

- **MemPalace** — Memory-augmented agent architecture for long-context reasoning
  - Repository: https://github.com/tdsdsf MemPalace
  - License: MIT

- **Hermes Agent** — Multi-step task orchestration and planning agent
  - Repository: https://github.com/tdsdsf/hermes-agent
  - License: MIT

- **EvoMap** — Evolutionary algorithm and mapping framework for agent strategy optimization
  - Repository: https://github.com/tdsdsf/evomap
  - License: GPL-3.0

- **OpenClaw** — Browser automation and web interaction framework for agents
  - Repository: https://github.com/tdsdsf/openclaw
  - License: MIT

- **Nanobot** — Lightweight autonomous agent framework with tool use
  - Repository: https://github.com/tdsdsf/nanobot
  - License: MIT

### Platform Integrations

Raino integrates with the following external services and tools:

- **KiCad** — EDA tool for schematic capture and PCB layout
  - Website: https://www.kicad.org
  - License: GPL-2.0 (KiCad itself is GPL; Raino communicates via CLI only — no KiCad code is embedded)

- **Supabase** — Auth, Postgres database, storage, and pgvector embeddings
  - Website: https://supabase.com
  - License: Apache 2.0

- **Moonshot AI (Kimi K2.5)** — LLM API endpoint via OpenAI-compatible SDK
  - Website: https:// moonshot.cn
  - License: Moonshot AI API terms of service

- **DigiKey** — Electronic components distributor API
  - Website: https://www.digikey.com
  - Interface: Adapter pattern with mock fallback (no embedded credentials)

- **Mouser** — Electronic components distributor API
  - Website: https://www.mouser.com
  - Interface: Adapter pattern with mock fallback (no embedded credentials)

- **JLCPCB** — PCB fabrication and assembly service API
  - Website: https://jlcpcb.com
  - Interface: Adapter pattern with mock fallback (no embedded credentials)

---

_These integrations use the Adapter pattern. Raino never embeds live API credentials. Mock adapters provide fixture data when credentials are unavailable._
