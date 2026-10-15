# DocConnect: TheBrandopedia Assignment

A React Native (Expo) app with a Node.js + Express + MongoDB backend. It implements two screens from the DocConnect design:

- **Home**: the logged-in user's profile at the top, then a scrollable feed of posts, with loading and error states.
- **Discover**: a 2-column grid of people with search, each with a **Connect** button. A sent request shows as **Requested**, and stays that way after the app is closed and reopened, because the state is stored in MongoDB.

There is no login. The **first seeded user** is treated as the logged-in user, and their ID is hardcoded in the app.

```
brandopedia/
├── backend/   Express API, Mongoose models, seed script, design images
└── mobile/    Expo app (Expo Router)
```

## Requirements

- Node.js 20 or later
- A MongoDB database: a free MongoDB Atlas cluster or a local MongoDB server
- The **Expo Go** app on your phone, from the App Store or Play Store. It must support the project's Expo SDK, which is SDK 57.
- Your phone and computer on the **same Wi-Fi network**

## 1. MongoDB setup

**Option A: MongoDB Atlas (cloud)**

1. Create a free cluster at <https://cloud.mongodb.com>.
2. Under **Database Access**, create a database user with a password.
3. Under **Network Access**, click **Add IP Address**, then **Add Current IP Address**. If you skip this step, the server fails with *"Could not connect to any servers in your MongoDB Atlas cluster"*.
4. Click **Connect → Drivers** and copy the connection string.

**Option B: Local MongoDB**

Install and start MongoDB, then use `mongodb://127.0.0.1:27017/brandopedia` as the connection string.

## 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
MONGODB_URI=<your connection string>
PORT=3000
```

### Seed the database

```bash
npm run seed
```

This adds 5 users (name, occupation, profile image) and 5 posts (content, author, timestamp, image). It replaces any earlier seed data, including connection requests. The script prints the ID of the first user:

```
Logged-in user (first seeded): Arun Kumar
Set CURRENT_USER_ID in mobile/src/constants/api.ts to: 6ad05e56f0f8a6c535437cda
```

Copy that ID. You need it in step 3.

### Start the server

```bash
npm run dev
```

Wait for `MongoDB connected successfully` and `Server running on port 3000`. To check that it works, open <http://localhost:3000/posts>.

## 3. Run the app

Find your computer's local IP address:

```bash
# macOS
ipconfig getifaddr en0
# Windows: run `ipconfig` and use the "IPv4 Address"
```

Edit `mobile/src/constants/api.ts`:

```ts
export const API_URL = 'http://<your-ip>:3000';           // not localhost: the phone can't reach it
export const CURRENT_USER_ID = '<ID printed by the seed>';
```

Then:

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. On iPhone, use the Camera app.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/posts` | All posts, newest first, with author details |
| GET | `/users?currentUserId=<id>` | All users with their connection count, plus `requestedUserIds`: the users the current user has already sent a request to. The app uses this list to restore the **Requested** state. |
| POST | `/connect` | Body `{ "fromUserId": "...", "toUserId": "..." }`. Saves a connection request. Sending the same request again is ignored, because of a unique index on `fromUser` + `toUser`. |
| GET | `/images/...` | Profile and post images supplied with the design |

Images are stored in the database as paths, such as `/images/profile/profile-1.png`. The API returns them as full URLs built from the request host, so they load on the phone without extra configuration.

## Design

The colours and type scale come from the developer handoff and live in `mobile/src/constants/theme.ts` as `Palette` and `Typography`. The app uses the DM Sans font through `@expo-google-fonts/dm-sans`, loaded in `src/app/_layout.tsx`. The supplied SVG icons are in `mobile/assets/icons`; the Connect button uses `icon-add-user.svg`.

## Troubleshooting

| Problem | Fix |
|---|---|
| App shows "Unable to load home feed" or "Unable to load people" | Check that the backend is running and `API_URL` uses your computer's current IP address. Open `http://<ip>:3000/posts` in the phone's browser to test. |
| Connect does nothing, or the API returns 400 or 404 | `CURRENT_USER_ID` is out of date. Re-run the seed and copy the new ID. |
| "Could not connect to any servers in your MongoDB Atlas cluster" | Add your current IP under Atlas **Network Access**. |
| Expo Go says the project is incompatible | Update Expo Go to the version that supports SDK 57. |

## AI assistance

An AI assistant (Claude) was used for backend setup, debugging, environment setup, and this README. The Home and Discover screens were written by me.
