# Create New Ad

A small full-stack app for creating property ads. The user fills in a form, picks the
area from an autocomplete list, and the ad is saved in MongoDB. A second page lists
all saved ads.

- **Frontend:** React 19 + Vite, React Router
- **Backend:** Node.js + Express 5, MongoDB with Mongoose

## Requirements

- Node.js 20 or newer (developed on Node 24)
- A MongoDB database: a local MongoDB server or a free MongoDB Atlas cluster
- The URL of the autocomplete API

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # on Windows: copy .env.example .env
```

Edit `backend/.env`:

| Variable                  | Description                                                                             | Example                     |
| ------------------------- | --------------------------------------------------------------------------------------- | --------------------------- |
| `PORT`                    | Port of the API. Must match the Vite proxy (8000).                                      | `8000`                      |
| `MONGODB_URI`             | MongoDB connection string. The database `property-ad-project` is created automatically. | `mongodb://localhost:27017` |
| `AUTOCOMPLETE_API_URL`    | Base URL of the autocomplete API. The backend calls `<url>?input=<text>`.               | `https://...`               |
| `AREAS_CACHE_TTL_SECONDS` | Optional. How long autocomplete results are cached. Default `600`.                      | `600`                       |

```bash
npm run dev      # or: npm start
```

You should see `MongoDB connected` and `Server is running on PORT: 8000`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server forwards every `/api` request to
`http://localhost:8000`, so no extra configuration is needed. `frontend/.env.example`
shows the optional `VITE_API_URL` variable, if the API runs somewhere else.

## How it works

### Pages

- **Create ad** (`/`): the form.
- **Ads** (`/ads`): all saved ads, newest first, read back from the database.

### The form

| Field               | Rules                                                 |
| ------------------- | ----------------------------------------------------- |
| Title               | Required, up to 155 characters                        |
| Ad type             | Required dropdown: Rent, Buy, Exchange, Donation      |
| Property type       | Required dropdown: House, Apartment, Maisonette, Land |
| Area                | Required, must be picked from the autocomplete list   |
| Price               | Required, digits only, greater than 0                 |
| Size (m²), Bedrooms | Optional, 0 or more                                   |
| Description         | Optional, up to 2000 characters                       |

### Area autocomplete

- Suggestions appear after 3 characters and update while the user types.
- Requests are debounced (300 ms), and an older request is cancelled when a newer one
  starts, so stale results never replace newer ones.
- Picking an option fills the field with the text returned by the API (`mainText`).
  Both the `placeId` and the name are stored with the ad. Typing text without picking
  an option does not count as a selection.
- Keyboard support: arrow keys, Enter, Escape.

The frontend never calls the external API directly. The backend acts as a proxy
(`GET /api/areas?input=...`):

- It keeps an in-memory cache with a TTL, so repeated searches don't call the
  external API again (response header `X-Cache: HIT` / `MISS`).
- It applies a 5-second timeout and returns clear errors (`502` if the external API
  fails, `504` on timeout).
- It converts the response to a small shape of its own: `{ id, name, secondaryText }`.

### API

| Method | Path                   | Description                                                       |
| ------ | ---------------------- | ----------------------------------------------------------------- |
| `GET`  | `/api/health`          | Health check                                                      |
| `GET`  | `/api/areas?input=...` | Area suggestions (min 3 characters)                               |
| `POST` | `/api/ads`             | Create an ad. `201` with the saved ad, or `400` with field errors |
| `GET`  | `/api/ads`             | List ads, newest first                                            |
| `GET`  | `/api/ads/:id`         | One ad. `400` for an invalid id, `404` if missing                 |

All errors go through one error handler and have the same JSON shape:
`{ "message": "...", "errors": { "field": "..." } }`.

No UI component library is used. The autocomplete, validation, cache and styling are
written from scratch.
