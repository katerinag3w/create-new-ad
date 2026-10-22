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

> **Required:** open `backend/.env` and fill in `AUTOCOMPLETE_API_URL` with the URL of the
> autocomplete API, e.g. `AUTOCOMPLETE_API_URL=https://<autocomplete-api-url>/`.
> Without it the area search does not work (`500 Autocomplete API is not configured`).

Then run:

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

**Area check on submit:** The form sends the selected area's `placeId` as `area.id`. The
backend only saves the ad if that id came from the autocomplete API. It first checks the
areas it has already sent to the browser. If the id isn't there (for example after a
restart), it searches the API by the area name. A made-up id is rejected with `400`.

**API**

| Method | Path                   | Description                                       |
| ------ | ---------------------- | ------------------------------------------------- |
| `GET`  | `/api/health`          | Health check                                      |
| `GET`  | `/api/areas?input=...` | Area suggestions (min 3 characters)               |
| `POST` | `/api/ads`             | Create an ad: `201`, or `400` with field errors   |
| `GET`  | `/api/ads`             | List ads, newest first                            |
| `GET`  | `/api/ads/:id`         | One ad: `400` for an invalid id, `404` if missing |

Errors share one shape: `{ "message": "...", "errors": { "field": "..." } }`.

## Tests

Run in `backend/` or `frontend/`:

```bash
npm test
```

The tests don't call the real autocomplete API (`fetch` is mocked), and the backend tests
use an in-memory MongoDB, so no `.env` is needed.

- **Backend** (`backend/tests/`): the cache, the autocomplete service (response mapping,
  `502`/`504`/invalid data), and the HTTP API with supertest (validation, placeId check,
  caching, listing ads).
- **Frontend** (`*.test.jsx` next to the code): the area autocomplete (3-character minimum,
  debounce, mouse/keyboard selection, errors), the create-ad form (validation, submitted
  payload with the placeId, backend errors), and the validation helpers.

## Packages used

**Backend**

- [express](https://expressjs.com): HTTP server and routing
- [mongoose](https://mongoosejs.com): MongoDB models and validation
- [mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server): in-memory MongoDB when `MONGODB_URI` is empty, and for tests
- [cors](https://github.com/expressjs/cors): allows requests from the frontend
- [dotenv](https://github.com/motdotla/dotenv): loads `backend/.env`
- [nodemon](https://nodemon.io) (dev): restarts the server on changes
- [vitest](https://vitest.dev) + [supertest](https://github.com/ladjs/supertest) (dev): tests

**Frontend**

- [react](https://react.dev) + react-dom: UI
- [react-router-dom](https://reactrouter.com): pages (form and ads list)
- [vite](https://vite.dev): dev server, build, and `/api` proxy
- [vitest](https://vitest.dev), [jsdom](https://github.com/jsdom/jsdom),
  [Testing Library](https://testing-library.com) (react, dom, jest-dom, user-event) (dev): tests
- [eslint](https://eslint.org) (dev): linting
