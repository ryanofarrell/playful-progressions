Site: Pediatric occupational therapist
built on: Jekyll + Liquid
Hosted on: GitHub Pages
Styling: Scss

File structure:
├── 404.html
├── CNAME
├── Gemfile
├── Gemfile.lock
├── LICENSE
├── _config.yml
├── _data
│   ├── navigation.yml
│   ├── privacy_policy.yml
│   ├── sitetext.yml
│   └── style.yml
├── _includes
│   ├── _section_header
│   ├── _unused
│   │   ├── clients.html
│   │   ├── contact.html
│   │   ├── modals.html
│   │   ├── nav.html
│   │   ├── portfolio_grid.html
│   │   └── timeline.html
│   ├── about.html
│   ├── book-calendly.html
│   ├── faqs.html
│   ├── figure
│   ├── footer.html
│   ├── head
│   │   └── custom.html
│   ├── head.html
│   ├── masthead.html
│   ├── mini-masthead.html
│   ├── navigation.html
│   ├── team.html
│   └── testimonial.html
├── _layouts
│   ├── default.html
│   ├── home.html
│   ├── minimal.html
│   ├── page.html
│   ├── post.html
│   └── single.html
├── _pages
│   ├── 5 minute friday.md
│   ├── about.md
│   └── blogs.md
├── _posts
│   ├── 2024-01-06-five-minute-friday-blanket-rides.md
│   ├── 2024-01-20-sensory-processing-in-womb.md
│   ├── 2024-02-03-five-minute-friday-painters-tape.md
│   ├── 2024-02-10-benefits-ot-telehealth.md
│   ├── 2024-02-15-ot-changed-mom.md
│   ├── 2024-02-22-wake-windows-0-3-months.md
│   ├── 2024-03-03-five-minute-friday-party-beads.md
│   ├── 2024-03-10-combined-feeding-model.md
│   ├── 2024-03-13-five-changes-postpartum-mental-health.md
│   ├── 2024-04-07-five-minute-friday-foil.md
│   ├── 2024-04-19-wake-windows-3-6-months.md
│   ├── 2024-05-05-five-minute-friday-hair-ties-scrunchies.md
│   ├── 2024-06-02-five-minute-friday-muffin-tins.md
│   ├── 2024-07-07-five-minute-friday-q-tips.md
│   ├── 2024-08-04-five-minute-friday-backpacks.md
│   ├── 2024-08-10-importance-of-tummy-time.md
│   ├── 2024-11-08-gift-guide-2024.md
│   ├── 2024-12-06-five-minute-friday-laundry-baskets.md
│   ├── 2025-01-06-five-minute-friday-tissue-boxes.md
│   ├── 2025-02-06-five-minute-baking-sheets.md
│   └── 2025-03-06-five-minute-friday-balloons.md
├── _sass
│   ├── base
│   │   ├── _custom_utilities.scss
│   │   ├── _mixins.scss
│   │   ├── _page.scss
│   │   └── _variables.scss
│   ├── components
│   │   ├── _blog-filter.scss
│   │   ├── _buttons.scss
│   │   ├── _navbar.scss
│   │   └── client-scroll.scss
│   └── layout
│       ├── _about.scss
│       ├── _blog.scss
│       ├── _contact-page.scss
│       ├── _contact.scss
│       ├── _footer.scss
│       ├── _masthead.scss
│       ├── _mini_masthead.scss
│       ├── _portfolio.scss
│       ├── _services-page.scss
│       ├── _services.scss
│       ├── _team.scss
│       ├── _testimonial.scss
│       ├── _timeline.scss
│       └── _training.scss
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png
├── assets
│   ├── css
│   │   ├── agency.scss
│   │   ├── all.min.css
│   │   ├── bootstrap.min.css
│   │   ├── bootstrap.min.css.map
│   │   └── webfonts
│   │       ├── fa-brands-400.eot
│   │       ├── fa-brands-400.svg
│   │       ├── fa-brands-400.ttf
│   │       ├── fa-brands-400.woff
│   │       ├── fa-brands-400.woff2
│   │       ├── fa-regular-400.eot
│   │       ├── fa-regular-400.svg
│   │       ├── fa-regular-400.ttf
│   │       ├── fa-regular-400.woff
│   │       ├── fa-regular-400.woff2
│   │       ├── fa-solid-900.eot
│   │       ├── fa-solid-900.svg
│   │       ├── fa-solid-900.ttf
│   │       ├── fa-solid-900.woff
│   │       └── fa-solid-900.woff2
│   ├── images
│   │   ├── 5mf-baking.png
│   │   ├── 5mf-balloons.png
│   │   ├── 5mf-blanket.jpg
│   │   ├── 5mf-foil.jpeg
│   │   ├── 5mf-laundry.png
│   │   ├── 5mf-party-beads.jpeg
│   │   ├── 5mf-tissue.png
│   │   ├── family.jpg
│   │   ├── gift-guide
│   │   │   ├── 0-6-1.jpeg
│   │   │   ├── 0-6-2.jpeg
│   │   │   ├── 12-18-1.jpg
│   │   │   ├── 12-18-2.jpg
│   │   │   ├── 18-24-1.jpg
│   │   │   ├── 18-24-2.jpeg
│   │   │   ├── 6-12-1.jpeg
│   │   │   ├── 6-12-2.jpeg
│   │   │   ├── pre-k.jpg
│   │   │   ├── preschool-1.jpg
│   │   │   ├── preschool-2.jpg
│   │   │   └── school-aged.jpg
│   │   ├── profile.jpeg
│   │   ├── teletherapy.jpeg
│   │   ├── tummy-time.jpeg
│   │   └── wake-windows.jpg
│   ├── img
│   │   ├── baby-crawling.avif
│   │   ├── baby-crawling.png
│   │   ├── baby-playing-game.avif
│   │   ├── baby-playing-game.png
│   │   ├── butterfly-square.png
│   │   ├── butterfly.png
│   │   ├── contact.png
│   │   ├── hands-child-with-paint.jpg
│   │   ├── header.jpeg
│   │   ├── header.png
│   │   ├── kid-ot-playing.avif
│   │   ├── kid-ot-playing.png
│   │   ├── little-boy-playing-home.jpg
│   │   ├── little-child-painting-like-artist.jpg
│   │   ├── logo-with-minor.png
│   │   ├── logo.avif
│   │   ├── logo.jpg
│   │   ├── logo.png
│   │   ├── logo2.jpg
│   │   ├── logo2.png
│   │   ├── logo3.png
│   │   ├── maria_headshot.avif
│   │   ├── maria_headshot.jpeg
│   │   ├── maria_headshot.png
│   │   ├── masthead.avif
│   │   ├── portfolio
│   │   │   ├── 04-thumbnail.jpg
│   │   │   ├── 05-thumbnail.jpg
│   │   │   └── 06-thumbnail.jpg
│   │   ├── smiling-crawling-baby.png
│   │   ├── team
│   │   │   ├── 2.jpg
│   │   │   └── 500x500.jpg
│   │   └── timeline
│   │       ├── 1.jpg
│   │       ├── 2.jpg
│   │       ├── 3.jpg
│   │       └── 4.jpg
│   └── js
│       ├── agency.min.js
│       ├── blog-filter.js
│       ├── bootstrap.bundle.min.js
│       ├── bootstrap.bundle.min.js.map
│       ├── contact_me.js
│       ├── jqBootstrapValidation.js
│       ├── jquery.easing.min.js
│       ├── jquery.min.js
│       ├── play-group-form.js
│       └── smooth-scroll-only.js
├── blog.html
├── commands.txt
├── contact.html
├── faq.html
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon.ico
├── index.md
├── privacy-policy.html
├── prompt.md
├── services.html
└── site.webmanifest