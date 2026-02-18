## Portfolio admin & gallery

**What this does**

- `admin.html`: password-gated admin page where you can add a campaign with:
  - title
  - description
  - one or more image/video files
- `server.js`: Node/Express server that:
  - accepts uploads from `admin.html`
  - stores them in `public/uploads`
  - remembers campaigns in `data/campaigns.json`
  - exposes `GET /api/campaigns` for the public gallery
- `gallery.html`: public-facing portfolio page that fetches from `/api/campaigns` and shows a grid of all uploaded media.

---

## Getting started

1. Install Node dependencies:

```bash
cd /home/jboss/Desktop/Port
npm install
```

2. Run the server:

```bash
npm start
```

3. Open these in your browser:

- Public gallery (what visitors see): `http://localhost:3000/`
- Admin upload page: open the local file or serve it:
  - Easiest: just go to `http://localhost:3000/admin.html` (copy `admin.html` into this folder if needed).

> Note: The admin password is currently set inside `admin.html` as `ADMIN_PASSWORD`. Change it before deploying, and for real security move auth server-side.

---

## Where files are stored

- Uploaded media: `public/uploads/` (served at `/uploads/...`)
- Campaign metadata: `data/campaigns.json`

You can back up or move your portfolio simply by copying those folders/files along with this project.

