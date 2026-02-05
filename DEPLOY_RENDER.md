# Deploy Frontend + Backend to Render

Follow these steps to deploy both the **backend** (Web Service) and **frontend** (Static Site) on Render. Deploy the **backend first** so you have its URL for the frontend.

---

## Prerequisites

- Code pushed to a **GitHub** or **GitLab** repo (e.g. `https://github.com/yourusername/AI_Chat_Agent`).
- **MongoDB**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`).
- **OpenAI**: API key from [platform.openai.com](https://platform.openai.com) (optional; app works with fallback replies without it).

---

## Part 1: Deploy the Backend (Web Service)

1. **Log in to Render**  
   Go to [render.com](https://render.com) and sign in (or create an account).

2. **New Web Service**  
   - Click **Dashboard** → **New +** → **Web Service**.  
   - Connect your repository (GitHub/GitLab) and select the repo that contains `AI_Chat_Agent` (or the repo where `backend` and `frontend` live).

3. **Configure the backend**  
   Use these settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `ai-chat-backend` (or any name you like) |
   | **Region** | Choose the one closest to you |
   | **Root Directory** | `AI_Chat_Agent/backend` *(or just `backend` if your repo root is the project root)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

4. **Environment variables (Backend)**  
   In the same screen, open **Environment** / **Environment Variables** and add:

   | Key | Value |
   |-----|--------|
   | `MONGO_URI` | Your MongoDB connection string (e.g. from Atlas) |
   | `OPENAI_API_KEY` | Your OpenAI API key (optional; omit for fallback replies only) |

   Do **not** set `PORT`; Render sets it automatically.

5. **Create Web Service**  
   Click **Create Web Service**. Wait for the first deploy to finish.

6. **Copy the backend URL**  
   Once live, you’ll see a URL like:  
   `https://ai-chat-backend-xxxx.onrender.com`  
   **Copy this URL** — you’ll use it for the frontend in Part 2.

---

## Part 2: Deploy the Frontend (Static Site)

1. **New Static Site**  
   - **Dashboard** → **New +** → **Static Site**.  
   - Connect the **same repository** as the backend.

2. **Configure the frontend**  
   Use these settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `ai-chat-frontend` (or any name) |
   | **Root Directory** | `AI_Chat_Agent/frontend` *(or `frontend` if repo root is the project)* |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

3. **Environment variable (Frontend)**  
   In **Environment** add **one** variable so the frontend talks to your backend:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your backend URL from Part 1, e.g. `https://ai-chat-backend-xxxx.onrender.com` |

   **Important:** No trailing slash. Use `https://...onrender.com` only.

4. **Create Static Site**  
   Click **Create Static Site**. The first build may take a few minutes.

5. **Frontend URL**  
   When the deploy succeeds, Render gives a URL like:  
   `https://ai-chat-frontend-xxxx.onrender.com`  
   Open this URL to use the chat app.

---

## Part 3: If Your Repo Layout Is Different

- If your repo root **is** the project (so you see `backend` and `frontend` at the top level):
  - Backend **Root Directory:** `backend`
  - Frontend **Root Directory:** `frontend`
- If the project is inside a folder (e.g. `spurNow/AI_Chat_Agent/`):
  - Backend **Root Directory:** `AI_Chat_Agent/backend` (or `spurNow/AI_Chat_Agent/backend` depending on repo root).
  - Frontend **Root Directory:** `AI_Chat_Agent/frontend` (or the matching path).

---

## Checklist

- [ ] Backend: Root Directory = `backend` (or `AI_Chat_Agent/backend`).
- [ ] Backend: Build = `npm install`, Start = `npm start`.
- [ ] Backend: `MONGO_URI` and (optionally) `OPENAI_API_KEY` set.
- [ ] Frontend: Root Directory = `frontend` (or `AI_Chat_Agent/frontend`).
- [ ] Frontend: Build = `npm install && npm run build`, Publish = `dist`.
- [ ] Frontend: `VITE_API_URL` = your backend URL (no trailing slash).

---

## After Deployment

- **Backend sleeps on free tier:** The first request after idle time may take 30–60 seconds; later requests are fast.
- **CORS:** The backend allows all origins; your frontend URL will work.
- **MongoDB Atlas:** If your cluster is in a different region than Render, it still works; latency may be slightly higher.

If something fails, check the **Logs** tab for the backend or frontend on Render for build or runtime errors.
