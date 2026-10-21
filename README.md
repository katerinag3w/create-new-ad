# Create New Ad

A small full-stack app for creating property ads. Fill in the form, pick an area from the
autocomplete list, and the ad is saved to MongoDB. The **Ads** page lists all saved ads.

- **Frontend:** React 19 + Vite, React Router
- **Backend:** Node.js + Express 5, MongoDB with Mongoose

## Requirements

- [Node.js](https://nodejs.org) 20 or newer
- The URL of the autocomplete API (not included in the repo)

No database install is needed. Without a `MONGODB_URI`, the backend starts a temporary
in-memory MongoDB.

## Run it locally

**1. Clone the repo**

```bash
git clone <repo-url>
cd create-new-ad
```

**2. Start the backend**

```bash
cd backend
npm install
cp .env.example .env     # Windows: copy .env.example .env
```

Open `backend/.env` and set `AUTOCOMPLETE_API_URL`. Then run:

```bash
npm run dev
```

Wait for `Server is running on PORT: 8000`. The first start downloads MongoDB
(about 100 MB) and can take a minute.

**3. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

**4. Open** http://localhost:5173

## Configuration (`backend/.env`)

| Variable               | Required | Description                                                                                                                                  |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTOCOMPLETE_API_URL` | Yes      | Base URL of the autocomplete API. The backend calls `<url>?input=<text>`.                                                                    |
| `MONGODB_URI`          | No       | Leave empty for an in-memory DB (**ads are lost on restart**). Set it to keep data, e.g. `mongodb://localhost:27017` or a MongoDB Atlas URI. |
| `PORT`                 | No       | API port. Default `8000`                                                                                                                     |

The frontend needs no configuration. Vite forwards `/api` requests to `http://localhost:8000`.

## How it works

**Form rules:** Title, ad type, property type, area and price are required. The area must
be picked from the list. Typing text without picking an option doesn't count. Price must be
greater than 0. Size and bedrooms are optional. Title is limited to 155 characters and the
description to 2000.

**Area autocomplete:** Suggestions start after 3 characters. Requests are debounced
(300 ms), and a request is cancelled when a newer one starts. Arrow keys, Enter and
Escape work in the list. The browser never calls the external API directly. The backend
proxies it, caches results in memory, and times out after 5 seconds (`502` if the API
fails, `504` on timeout).

**API**

| Method | Path                   | Description                                       |
| ------ | ---------------------- | ------------------------------------------------- |
| `GET`  | `/api/health`          | Health check                                      |
| `GET`  | `/api/areas?input=...` | Area suggestions (min 3 characters)               |
| `POST` | `/api/ads`             | Create an ad: `201`, or `400` with field errors   |
| `GET`  | `/api/ads`             | List ads, newest first                            |
| `GET`  | `/api/ads/:id`         | One ad: `400` for an invalid id, `404` if missing |

Errors share one shape: `{ "message": "...", "errors": { "field": "..." } }`.
