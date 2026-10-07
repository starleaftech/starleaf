/* ============================================================
   STARLEAF TECHNOLOGIES FZE LLC - Main JavaScript
   Version: 13.0 - Mobile Dropdown Final Fix
   ============================================================ */

(function() {
    'use strict';

    /* ============================================================
       UTILITY FUNCTIONS
       ============================================================ */
    const debounce = (func, wait = 200) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const isMobile = () => window.innerWidth <= 992;

    /* ============================================================
       DOCUMENT READY
       ============================================================ */
    document.addEventListener('DOMContentLoaded', function() {

        /* ============================================================
           PRELOADER
           ============================================================ */
        const preloader = document.getElementById('preloader');
        if (preloader) {
            const startTime = Date.now();
            window.addEventListener('load', function() {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 600 - elapsed);
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }, remaining);
            });
            setTimeout(() => {
                if (!preloader.classList.contains('hidden')) {
                    preloader.classList.add('hidden');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }
            }, 3000);
        }

        /* ============================================================
           AOS ANIMATIONS
           ============================================================ */
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: isMobile() ? 500 : 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: isMobile() ? 30 : 60,
                disable: isMobile()
            });
        }

        // Hero visibility is never allowed to depend on AOS.
        if (isMobile()) {
            document.querySelectorAll('.hero-section [data-aos], .service-hero-lottie [data-aos]')
                .forEach(function(el) {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                    el.style.transform = 'none';
                });
        }

        /* ============================================================
           BACK TO TOP
           ============================================================ */
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            const toggleBackToTop = () => {
                backToTop.classList.toggle('show', window.scrollY > 320);
            };
            toggleBackToTop();
            window.addEventListener('scroll', toggleBackToTop, { passive: true });
            backToTop.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        /* ============================================================
           NAVBAR SCROLL EFFECT
           ============================================================ */
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const handleNavbarScroll = debounce(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 20);
            }, 50);
            window.addEventListener('scroll', handleNavbarScroll, { passive: true });
            handleNavbarScroll();
        }

        /* ============================================================
           LAZY LOAD IMAGES
           ============================================================ */
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
            if (lazyImages.length > 0) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                            }
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.1
                });
                lazyImages.forEach(img => imageObserver.observe(img));
            }
        }

        /* ============================================================
           COUNTER ANIMATION
           ============================================================ */
        const counters = document.querySelectorAll('.counter[data-target]');
        if (counters.length > 0 && 'IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.getAttribute('data-target'), 10);
                        const duration = isMobile() ? 1500 : 2000;
                        const startTime = performance.now();
                        const suffix = el.getAttribute('data-suffix') || '';
                        const prefix = el.getAttribute('data-prefix') || '';

                        const animateCounter = (currentTime) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.floor(eased * target);
                            el.textContent = prefix + current.toLocaleString() + suffix;
                            if (progress < 1) {
                                requestAnimationFrame(animateCounter);
                            } else {
                                el.textContent = prefix + target.toLocaleString() + suffix;
                            }
                        };
                        requestAnimationFrame(animateCounter);
                        counterObserver.unobserve(el);
                    }
                });
            }, { threshold: 0.3 });
            counters.forEach(c => counterObserver.observe(c));
        }

        /* ============================================================
           SMOOTH SCROLL FOR ANCHOR LINKS
           ============================================================ */
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const navbarHeight = navbar ? navbar.offsetHeight : 70;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    history.pushState(null, null, targetId);
                }
            });
        });

        /* ============================================================
           NAVBAR MOBILE OFFCANVAS
           ============================================================ */
        const navbarCollapse = document.querySelector('#navbarMain');
        if (navbarCollapse) {
            // Exclude the Services dropdown-toggle: it must only open/close its
            // own submenu (handled by setupMobileDropdown below), not close
            // the whole mobile menu. Previously this matched the toggle too,
            // so tapping "Services" opened the submenu and immediately closed
            // the entire navbar in the same click.
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (navbarCollapse.classList.contains('show')) {
                        const bsOffcanvas = bootstrap.Offcanvas.getInstance(navbarCollapse);
                        if (bsOffcanvas) {
                            bsOffcanvas.hide();
                        } else {
                            navbarCollapse.classList.remove('show');
                        }
                    }
                });
            });
        }

        /* ============================================================
           MOBILE DROPDOWN FIX - Services Dropdown
           ============================================================ */
        function setupMobileDropdown() {
            // Get the services toggle with the specific class
            var toggle = document.querySelector('.services-toggle');
            if (!toggle) {
                // If not found, try finding by text content
                var allToggles = document.querySelectorAll('.navbar .dropdown-toggle');
                allToggles.forEach(function(el) {
                    if (el.textContent.trim() === 'Services') {
                        toggle = el;
                        toggle.classList.add('services-toggle');
                    }
                });
                if (!toggle) return;
            }

            // Remove any existing listeners
            toggle.removeEventListener('click', handleToggleClick);
            toggle.addEventListener('click', handleToggleClick);

            function handleToggleClick(e) {
                // Only handle on mobile
                if (window.innerWidth > 992) return;
                
                e.preventDefault();
                e.stopPropagation();

                var parent = this.closest('.dropdown');
                var menu = parent.querySelector('.dropdown-menu');
                
                if (!menu) return;

                var isOpen = menu.classList.contains('show');

                // Close all other dropdowns
                document.querySelectorAll('.navbar .dropdown-menu.show').forEach(function(m) {
                    if (m !== menu) {
                        m.classList.remove('show');
                        var t = m.closest('.dropdown').querySelector('.dropdown-toggle');
                        if (t) t.setAttribute('aria-expanded', 'false');
                    }
                });

                if (isOpen) {
                    menu.classList.remove('show');
                    this.setAttribute('aria-expanded', 'false');
                } else {
                    menu.classList.add('show');
                    this.setAttribute('aria-expanded', 'true');
                }
            }

            // Close dropdown when clicking outside
            document.removeEventListener('click', handleOutsideClick);
            document.addEventListener('click', handleOutsideClick);

            function handleOutsideClick(e) {
                if (window.innerWidth > 992) return;
                
                var dropdown = document.querySelector('.navbar .dropdown');
                if (!dropdown) return;
                
                var menu = dropdown.querySelector('.dropdown-menu');
                var toggle = dropdown.querySelector('.dropdown-toggle');

                if (menu && menu.classList.contains('show') && !dropdown.contains(e.target)) {
                    menu.classList.remove('show');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }

            // Close dropdown when clicking a link inside
            document.querySelectorAll('.navbar .dropdown-item').forEach(function(item) {
                item.removeEventListener('click', handleItemClick);
                item.addEventListener('click', handleItemClick);
            });

            function handleItemClick() {
                if (window.innerWidth > 992) return;
                
                var menu = this.closest('.dropdown-menu');
                if (menu) {
                    menu.classList.remove('show');
                    var toggle = document.querySelector('.services-toggle');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        }

        /* ============================================================
           BUTTON SHINE EFFECT (Desktop only)
           ============================================================ */
        if (!isMobile()) {
            document.querySelectorAll('.btn-gradient').forEach(function(btn) {
                btn.addEventListener('mouseenter', function(e) {
                    var rect = this.getBoundingClientRect();
                    var x = ((e.clientX - rect.left) / rect.width) * 100;
                    var y = ((e.clientY - rect.top) / rect.height) * 100;
                    this.style.setProperty('--shine-x', x + '%');
                    this.style.setProperty('--shine-y', y + '%');
                });
            });
        }

        /* ============================================================
           DASHBOARD SLIDER
           ============================================================ */
        if (typeof Swiper !== 'undefined') {
            var dashboardSlider = document.querySelector('.dashboard-slider');
            if (dashboardSlider) {
                var dashboardSwiper = new Swiper('.dashboard-slider', {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    loop: true,
                    speed: isMobile() ? 400 : 600,
                    autoplay: {
                        delay: isMobile() ? 3000 : 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: !isMobile(),
                    },
                    pagination: {
                        el: '.dashboard-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.dashboard-button-next',
                        prevEl: '.dashboard-button-prev',
                    },
                    on: {
                        slideChangeTransitionEnd: function() {
                            document.querySelector('.dashboard-slider .swiper-slide-active .dashboard-illustration')
                                ?.classList.add('slide-visible');
                        }
                    }
                });

                var sliderWrapper = document.querySelector('.dashboard-slider-wrapper');
                if (sliderWrapper && !isMobile()) {
                    sliderWrapper.addEventListener('mouseenter', function() { dashboardSwiper.autoplay.stop(); });
                    sliderWrapper.addEventListener('mouseleave', function() { dashboardSwiper.autoplay.start(); });
                }
            }
        } else {
            // Swiper is optional. Keep the first hero slide visible if its CDN is unavailable.
            document.querySelectorAll('.dashboard-slider .swiper-slide:first-child, .dashboard-slider .swiper-slide:first-child .dashboard-illustration')
                .forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
        }

        /* ============================================================
           SETUP MOBILE DROPDOWN
           ============================================================ */
        setupMobileDropdown();

        /* ============================================================
           WINDOW RESIZE HANDLER
           ============================================================ */
        var handleResize = debounce(function() {
            if (typeof AOS !== 'undefined') AOS.refresh();
            
            if (window.innerWidth > 992) {
                document.querySelectorAll('.navbar .dropdown-menu.show').forEach(function(menu) {
                    menu.classList.remove('show');
                });
                document.querySelectorAll('.navbar .dropdown-toggle[aria-expanded="true"]').forEach(function(toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                });
            }
            
            if (typeof Swiper !== 'undefined') {
                document.querySelectorAll('.swiper').forEach(function(el) {
                    if (el.swiper) el.swiper.update();
                });
            }
        }, 250);
        window.addEventListener('resize', handleResize);

        // Also run once after initial load (not just on resize). Without this,
        // AOS.refresh() and Swiper.update() never ran until the user triggered
        // an actual resize event - which on mobile happens the moment the
        // browser's address bar collapses on first scroll. That's why the hero
        // could look wrong on first paint but "fix itself" only after scrolling.
        window.addEventListener('load', function () {
            requestAnimationFrame(function () {
                handleResize();
            });
        });

        /* ============================================================
           KEYBOARD ACCESSIBILITY
           ============================================================ */
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.navbar .dropdown-menu.show').forEach(function(menu) {
                    menu.classList.remove('show');
                    var toggle = document.querySelector('.services-toggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                });
            }
        });

        /* ============================================================
           CONSOLE BRANDING
           ============================================================ */
        console.log('%c STARLEAF TECHNOLOGIES ', 'background: #2563EB; color: #fff; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 4px;');
        console.log('%c Engineering Intelligence. Accelerating Possibility. ', 'color: #94A3B8; font-size: 14px;');
        console.log('%c https://starleaf.ae ', 'color: #2563EB; font-size: 12px;');

    }); // End DOMContentLoaded

    /* ============================================================
       WINDOW LOAD HANDLER
       ============================================================ */
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

})();

/* ============================================================
   LOTTIE ANIMATIONS - Per-Page Hero Loader
   ============================================================
   Every hero section's Lottie container looks like:

       <div id="lottieAnimation" data-lottie-page="cybersecurity"></div>

   The data-lottie-page value is rendered server-side from PHP's
   $currentPage, so it is automatically correct for every page:
   all 12 /services/*.php pages, plus the root pages (about,
   allservices, technologies, industries, portfolio, blog,
   careers, contact).

   FILE CONVENTION
   ----------------
   By default each page loads: assets/lottie/<page-slug>.json
   e.g. services/cybersecurity.php  -> assets/lottie/cybersecurity.json
        technologies.php            -> assets/lottie/technologies.json

   To give a page its own animation, just drop a JSON file into
   assets/lottie/ named after its slug - no JS changes needed.

   If that file doesn't exist yet (or fails to load), the page
   automatically falls back to DEFAULT_LOTTIE_FILE below, so
   nothing ever breaks while animations are still being added.

   OPTIONAL OVERRIDES
   -------------------
   If you want a page to use a different/shared file instead of
   its own slug (e.g. several services temporarily sharing one
   animation), add an entry to LOTTIE_PAGE_MAP.
   ============================================================ */

(function () {
    'use strict';

    // slug -> filename overrides. Anything NOT listed here falls back
    // to "<slug>.json" automatically (see resolveCandidates below).
    const LOTTIE_PAGE_MAP = {
        'ai-development': 'ai-development.json',
        'cybersecurity': 'cybersecurity.json'

        // Add more as dedicated animations are created, e.g.:
        // 'software-development': 'software-development.json',
        // 'mobile-development':   'mobile-development.json',
        // 'devops':                'devops.json',
        // 'data-analytics':        'data-analytics.json',
        // 'erp-crm':               'erp-crm.json',
        // 'cloud-solutions':       'cloud-solutions.json',
        // 'it-consulting':         'it-consulting.json',
        // 'managed-services':      'managed-services.json',
        // 'qa-testing':            'qa-testing.json',
        // 'ui-ux-design':          'ui-ux-design.json',
        // 'digital-marketing':     'digital-marketing.json',
        // 'about':                 'about.json',
        // 'allservices':           'allservices.json',
        // 'technologies':          'technologies.json',
        // 'industries':            'industries.json',
        // 'portfolio':             'portfolio.json',
        // 'blog':                  'blog.json',
        // 'careers':               'careers.json',
        // 'contact':               'contact.json'
    };

    // Used whenever a page has no dedicated animation (yet), or its
    // file fails to load for any reason.
    const DEFAULT_LOTTIE_FILE = 'ai-development.json';

    // /services/*.php pages sit one directory deeper than root pages,
    // so the relative path back to /assets/ differs.
    function getLottieBasePath() {
        return window.location.pathname.indexOf('/services/') !== -1
            ? '/assets/lottie/'
            : '/assets/lottie/';
    }

    // Build an ordered list of candidate URLs to try for this container:
    // 1) explicit override / slug-based file, 2) default fallback file.
    function resolveCandidates(container) {
        const basePath = getLottieBasePath();
        const pageSlug = container.getAttribute('data-lottie-page');
        const primaryFile = (pageSlug && (LOTTIE_PAGE_MAP[pageSlug] || `${pageSlug}.json`)) || DEFAULT_LOTTIE_FILE;

        const candidates = [basePath + primaryFile];
        if (primaryFile !== DEFAULT_LOTTIE_FILE) {
            candidates.push(basePath + DEFAULT_LOTTIE_FILE);
        }
        return candidates;
    }

    function loadLottieLibrary(callback) {
        if (typeof lottie !== 'undefined') {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.onload = callback;
        script.onerror = function () {
            console.error('Lottie: failed to load lottie-web library');
        };
        document.head.appendChild(script);
    }

    // Try each candidate URL in order (via fetch) until one parses as JSON.
    function fetchFirstAvailable(urls, index = 0) {
        if (index >= urls.length) {
            return Promise.reject(new Error('No Lottie animation could be loaded'));
        }
        return fetch(urls[index])
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                return { data, url: urls[index] };
            })
            .catch(function () {
                return fetchFirstAvailable(urls, index + 1);
            });
    }

    function renderLottie(container, animationData, sourceUrl) {
        const animation = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData
        });

        animation.setSpeed(0.8);

        animation.addEventListener('DOMLoaded', function () {
            console.log('Lottie animation loaded:', sourceUrl);
            // The hero's height can change once the animation actually renders
            // (its container is empty/collapsed until now), which shifts every
            // section below it. AOS calculated its scroll-trigger offsets before
            // this happened, so without a refresh those sections can be stuck
            // at their pre-animation state. Refresh once layout has settled.
            if (typeof AOS !== 'undefined') {
                requestAnimationFrame(function () {
                    setTimeout(function () { AOS.refresh(); }, 50);
                });
            }
        });

        // Handle resize
        window.addEventListener('resize', function () {
            animation.resize();
        });

        return animation;
    }

    function initLottieAnimation() {
        const container = document.getElementById('lottieAnimation');
        if (!container) return;

        const candidates = resolveCandidates(container);

        loadLottieLibrary(function () {
            fetchFirstAvailable(candidates)
                .then(function (result) {
                    renderLottie(container, result.data, result.url);
                })
                .catch(function (err) {
                    console.error('Lottie: unable to load any animation for this page', err);
                    container.setAttribute('data-lottie-failed', 'true');
                });
        });
    }

    document.addEventListener('DOMContentLoaded', initLottieAnimation);

})();



/* ============================================================
   VERCEL CONTACT FORM
   Sends the existing contact form to /api/contact.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form[data-vercel-contact="true"]');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    let status = form.querySelector('[data-contact-status]');
    if (!status) {
        status = document.createElement('div');
        status.setAttribute('data-contact-status', 'true');
        status.className = 'small mt-3';
        form.appendChild(status);
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());
        data.website = ''; // honeypot field reserved for future use

        if (!data.name || !data.email || !data.message) {
            status.className = 'small mt-3 text-danger';
            status.textContent = 'Please complete all required fields.';
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
        }
        status.className = 'small mt-3 text-secondary';
        status.textContent = 'Sending your message...';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || 'Unable to send your message.');
            }

            form.reset();
            status.className = 'small mt-3 text-success';
            status.textContent = result.message || 'Thank you. Your message has been sent successfully.';
        } catch (error) {
            status.className = 'small mt-3 text-danger';
            status.textContent = error.message || 'Something went wrong. Please try again.';
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Send Message';
            }
        }
    });
});
