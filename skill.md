# CINE-MARK AI Integration Guide

Hey there! If you're reading this, you're probably the AI agent tasked with adding some smarts to the CINE-MARK backend. This guide is meant to walk you through the codebase and explain exactly where and how we want to integrate AI and ML features. We want this to feel natural, so keep the code clean, the comments simple, and the logic straightforward.

## What is CINE-MARK?

Before we dive into the AI stuff, let's quickly recap what we're working with. CINE-MARK is a backend system for managing movie watchlists. It's built with Express.js, uses PostgreSQL (via Prisma) for the database, and relies on Redis for caching. It talks to the OMDb API to get movie details and uses Google OAuth for user logins.

The code is neatly organized into modules inside the `src/modules` folder. You'll mainly be looking at the `movie` and `watchlist` modules.

## The Goal: Making it Smarter

Right now, the app is pretty basic. You search for a movie, it hits OMDb, and you add it to a list. We want to upgrade this by adding features like semantic search, smart recommendations, and natural language commands. Here is the breakdown of what we need to build and where it fits.

### 1. Semantic Movie Search (RAG Implementation)

Currently, the search in `src/modules/movie/movie.services.js` just passes a keyword to OMDb. If someone searches for "movies about space travel," OMDb might struggle if those exact words aren't in the title. We need to fix that using Retrieval-Augmented Generation (RAG).

**How to build it:**

First, we need a way to turn movie descriptions into embeddings. You'll need to set up a connection to an embedding model (like OpenAI's text-embedding models). When we fetch a movie from OMDb and save it to our database, we should also generate an embedding for its plot, genre, and cast.

Next, we need a place to store these embeddings. You can either set up a dedicated vector database like Pinecone or Weaviate, or if you want to keep it simple, use the `pgvector` extension with our existing PostgreSQL setup.

Finally, update the search logic. When a user searches, turn their query into an embedding. Then, query the vector database to find movies with similar embeddings. You can still use OMDb as a fallback, but the vector search should be the primary engine for discovering movies based on concepts rather than exact keywords.

### 2. Smart Recommendations

Once we have embeddings working, we can start recommending movies. We want to suggest films based on what a user already has in their watchlists.

**How to build it:**

Create a new service function, maybe in `movie.services.js` or a dedicated `recommendation.services.js`. This function should look at the movies in a user's watchlists.

You can take the embeddings of the movies they've added and find the "average" embedding, or just pick a few favorites. Then, query the vector database for other movies that are close to those vectors but aren't already on their list.

To make it feel more human, pass the recommended movie details to an LLM and ask it to generate a short, friendly explanation of why it's recommending that specific movie based on their past choices.

### 3. Natural Language Watchlist Management (LangChain/LangGraph)

This is the fun part. We want users to be able to manage their watchlists by just typing sentences, like "Create a list for scary movies" or "Add Inception to my favorites."

**How to build it:**

You'll need to set up a new endpoint, something like `POST /api/v1/watchlist/chat`. This endpoint will receive the user's natural language command.

This is where LangChain or LangGraph comes in handy. You need to build a chain that takes the user's input and figures out their intent. Are they trying to create a list? Add a movie? View a list?

Once the intent is clear, extract the necessary details (like the movie name or the watchlist name). Then, map those details to our existing service functions in `watchlist.services.js` (like `createWatchlist` or `addMovieToWatchlist`).

If the user asks to add a movie, you might need a multi-step process: first, search for the movie to get its ID, then find the watchlist ID, and finally add it. LangGraph is great for managing these kinds of stateful, multi-step workflows.

### 4. AI-Generated Movie Summaries

Sometimes the OMDb plot summaries are a bit dry. We can use an LLM to spice them up.

**How to build it:**

When a user requests movie details (the `GET /api/v1/movie/:imdbID` route), you can intercept the data before sending it back.

Take the basic plot, cast, and genre, and feed it to an LLM with a prompt asking for a more engaging, fun summary. You could even use RAG here to pull in trivia from Wikipedia to make the summary richer.

Be careful with this one, though. LLM calls can be slow, so you'll definitely want to cache these generated summaries in Redis so we don't have to generate them every single time someone views the movie.

## Coding Style Guidelines

When you're writing the code for these features, keep it looking like a human wrote it. Here are a few rules:

*   **Keep it simple:** Don't over-engineer things. Use straightforward logic that's easy to read.
*   **Normal names:** Name your variables and functions clearly. Use names like `find_similar_movies` or `user_search_query` instead of overly technical or robotic names.
*   **Human comments:** Write comments like you're explaining the code to a coworker. "This part checks if the movie is already in the list" is much better than "Executes validation check against existing database records."
*   **Handle errors gracefully:** AI models fail sometimes. Make sure you wrap your LLM calls in try-catch blocks and return sensible error messages to the user if something goes wrong.

That's the plan! Take your time, read through the existing code in `src/modules`, and start integrating these features step by step. Good luck!
