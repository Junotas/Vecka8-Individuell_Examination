# NASA Images – Responsive Frontend with JS Interactivity

## Overview
A small multi-page site that uses NASA's public Images API to display and explore space-related images. The project demonstrates semantic HTML, responsive CSS (Flexbox + Grid), and modern JavaScript (ES6+) with multiple interactive features.

## Pages
- `index.html`: Welcome page with a name form (stored in localStorage).
- `images.html`: Image gallery powered by the NASA Images API with search, like/dislike, description toggle, and fullscreen lightbox.

## Tech and Concepts
- **HTML:** Semantic structure (`header`, `nav`, `main`, `footer`). Alt text comes from the API.
- **CSS:** External styles, CSS variables (theme tokens), Flexbox (header/navigation, sticky footer layout), Grid (responsive gallery), media queries.
- **JavaScript (ES6+):**
  - `async/await` for API call.
  - DOM selection and manipulation (`querySelector`, `innerHTML`, `classList`).
  - Events (`addEventListener`) for forms and buttons.
  - Higher-order functions: `map`, `forEach`.
  - Template literals for rendering HTML.
  - Destructuring (object) in rendering flow.
  - LocalStorage for persisting user name and reactions.
  - Conditional logic, loops, and operators.

## Interactive Features
- Name form with basic validation and storage in localStorage.
- Search form that fetches filtered results from NASA Images API.
- Tri-state reactions per image (like, dislike, or none), persisted in localStorage.
- Show/Hide (toggle) description per card.
- Fullscreen lightbox for images.

## Project Structure
/public
index.html
images.html

/css
styles.css
images.css

/js
app.js
index.js
images.js
api.nasa.images.js

