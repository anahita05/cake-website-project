# 🎂 CakeShop — Online Cake Store

A modern, delightful e-commerce web application for selling cakes and bakery products, built with **React** and **Tailwind CSS**.

---

## ✨ Overview

CakeShop is a frontend web application designed to showcase and sell handcrafted cakes online. It features a clean, warm UI with product listings, a shopping cart, and an order flow — all powered by React components and styled with Tailwind CSS utility classes.

---

## 🚀 Tech Stack

| Technology                               | Purpose                      |
| ---------------------------------------- | ---------------------------- |
| [React](https://react.dev/)              | UI component library         |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling        |
| [React Router](https://reactrouter.com/) | Client-side routing          |
| [Vite](https://vitejs.dev/)              | Fast dev server & build tool |

---

## 📁 Project Structure

```
cakeshop/
├── public/
│   └── assets/          # Static images and icons
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── CakeCard.jsx
│   │   ├── Cart.jsx
│   │   └── Footer.jsx
│   ├── pages/           # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Menu.jsx
│   │   ├── ProductDetail.jsx
│   │   └── Checkout.jsx
│   ├── data/            # Static product data (or API calls)
│   │   └── cakes.js
│   ├── App.jsx          # Root component with routing
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind directives
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anahita05/cake-website-project.git

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm run dev
```

The app will be running at `http://localhost:5173`.

### Build for Production

```bash
pnpm run build
```

The optimized output will be in the `dist/` folder.

---

## 🎨 Tailwind CSS Setup

Tailwind is configured via `tailwind.config.js`. The content paths are set to scan all JSX files:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        caramel: "#C68642",
        cream: "#FFF8F0",
        chocolate: "#3B1F0F",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

---

## 🛠️ Backend (Django API)

The project also includes a **Django REST Framework** backend in the `Back/` folder, which powers authentication, products, cart, and orders.

📖 **Full API reference: [`Back/API_DOCS.md`](Back/API_DOCS.md)** — every endpoint, request body, response shape, error code, and rate limit in one place. There is also live Swagger UI at `/api/docs/`.

### Tech Stack

| Technology                                            | Purpose                          |
| ----------------------------------------------------- | -------------------------------- |
| [Django](https://www.djangoproject.com/)              | Web framework                    |
| [DRF](https://www.django-rest-framework.org/)         | REST API                         |
| [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/) | Cookie-based JWT auth, rotation + blacklist |
| [Google Auth](https://google-auth.readthedocs.io/)    | Verifies Google ID tokens        |
| [drf-spectacular](https://drf-spectacular.readthedocs.io/) | OpenAPI docs / Swagger     |
| [django-cors-headers](https://github.com/adamchainz/django-cors-headers) | CORS for the frontend |
| SQLite                                                | Dev database                     |

### Project Structure

```
Back/
├── accounts/      # Custom user (UUID, email login), auth views, throttles, middleware
├── products/      # Categories + products (list / detail)
├── cart/          # Per-user cart + cart items
├── orders/        # Orders created from the cart
├── core/          # Settings & root URL config
├── API_DOCS.md    # Endpoint reference for the frontend team
├── .env.example   # Every supported environment variable
├── manage.py
└── requirements.txt
```

### API Endpoints

| Base              | Routes                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| `/api/auth/`      | `register/`, `login/`, `google/`, `refresh/`, `logout/`, `me/`, `set-password/`, `password-reset/`, `password-reset/confirm/` |
| `/api/products/`  | `/` (list, `?category=<slug>`), `categories/`, `<uuid>/`               |
| `/api/cart/`      | `/`, `items/`, `items/<product_id>/`, `clear/`                         |
| `/api/orders/`    | `/` (list), `create/` (from cart), `<id>/`                             |
| `/admin/`         | Django admin                                                           |
| `/api/docs/`      | Swagger UI (via `/api/schema/`)                                        |

### How Auth Works

- Tokens are set as **HttpOnly cookies** (`access_token`, `refresh_token`), so the frontend never touches them directly. Every request must use `credentials: "include"`.
- The access cookie lasts **15 minutes**; the refresh cookie lasts **7 days** and is rotated on every refresh (the old one is blacklisted).
- Login accepts `remember`: `true` keeps the session across browser restarts, `false`/omitted ends it when the browser closes. The choice survives rotation.
- `POST /api/auth/set-password/` gives Google-created accounts their first password (or changes an existing one, which requires the current password).
- `POST /api/auth/password-reset/` emails a 1-hour reset link; the reply is always the same so accounts cannot be enumerated.
- Changing or resetting a password signs the user out of **every** device.
- Unsafe requests from untrusted origins are rejected with `403`; auth endpoints are rate-limited (`429` when exceeded).

> **Dev tip:** use the same host for both apps. Opening the frontend on `localhost:5173` while the API runs on `127.0.0.1:8000` makes the cookies cross-site, so requests look anonymous.

### Running the Backend

```bash
# 1. Go to the backend folder
cd Back

# 2. Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate    # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Optional: copy the env template and fill in what you need
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

# 5. Apply migrations and create an admin user
python manage.py migrate
python manage.py createsuperuser

# 6. Start the API server
python manage.py runserver
```

The API will be running at `http://127.0.0.1:8000`. Open the frontend on the matching host (`http://127.0.0.1:5173`).

**Email in development:** the default `EMAIL_BACKEND` prints messages to the terminal, so a password-reset link appears in the `runserver` output instead of an inbox.

**Google sign-in:** set `GOOGLE_OAUTH_CLIENT_ID` on the backend and `VITE_GOOGLE_CLIENT_ID` on the frontend to the same OAuth client ID.

### Tests

```bash
cd Back
python manage.py test
```

Covers registration, case-insensitive login, cookie lifetime, token rotation and blacklisting, Google credential errors, set-password, password reset, and profile editing.

---

> Made with ❤️ and a lot of sugar 🍰
