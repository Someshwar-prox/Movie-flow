CINE-MARK Claude Skill

Purpose
- Provide concise actions for semantic search, recommendations, natural-language watchlist management, and AI-generated movie summaries.

Invocation examples
- "search: movies about space travel"
- "recommend for user_id:123"
- "watchlist: create Scary Movies"
- "watchlist: add Inception to Favorites"
- "summarize imdb:tt0133093"

Input (JSON)
- action: one of [semantic_search, recommend, manage_watchlist, summarize]
- user_id: integer (when applicable)
- text: natural language query or command
- imdbID: string (when applicable)
- watchlistName: string (when applicable)
- options: object (optional flags like limit, freshness)

Processing rules (concise)
- semantic_search: embed `text` -> query vector DB (pgvector/Pinecone) -> return top N movie records -> fallback to OMDb if empty.
- recommend: fetch user's watchlist movie embeddings -> aggregate (mean or top-k) -> query vector DB excluding existing -> return movies + short LLM explanation.
- manage_watchlist: parse intent (create/add/remove/list) -> resolve movie via existing search -> call internal watchlist services -> return status.
- summarize: fetch OMDb data for `imdbID` -> optionally RAG with Wikipedia -> prompt LLM for engaging summary -> cache in Redis.

APIs / Code hooks
- Search: call `movie.services.js` semantic search path; fallback to OMDb in `src/modules/movie`.
- Watchlist NL: endpoint `POST /api/v1/watchlist/chat` (implement chain using LangChain/LangGraph). Map intents to `watchlist.services.js`.
- Movie details: `GET /api/v1/movie/:imdbID` intercept to add `summary` field.

Response format (JSON)
- {"status":"ok"|"error","action":"...","data":{...},"message":"concise message"}

Constraints & safety
- Validate authentication before data-modifying actions.
- Cache LLM outputs; wrap calls in try/catch and return graceful errors.
- Keep LLM output brief (1-3 sentences for recommendations/explanations).
- Limit vector queries and LLM tokens; avoid hallucinations by using RAG and factual fallbacks.

Implementation notes
- Use `pgvector` or a managed vector DB. Generate embeddings when saving movies.
- Store generated summaries in Redis with TTL.
- Keep code simple, descriptive names, and clear error messages as per guide.

Done: concise actionable spec for Claude integration.