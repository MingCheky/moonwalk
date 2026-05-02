/* ============================================================
   MOONWALKER — Shared JavaScript
   Stars, parallax, language, mobile menu, toast, animations
   ============================================================ */

(function() {
    'use strict';

    // ===== STARS GENERATION =====
    function createStars() {
        const layers = document.querySelectorAll('.stars-layer');
        if (!layers.length) return;

        layers.forEach(function(layer) {
            const count = parseInt(layer.dataset.count || '60', 10);
            const depth = parseFloat(layer.dataset.depth || '1');
            const frag = document.createDocumentFragment();
            for (let i = 0; i < count; i++) {
                const s = document.createElement('span');
                const size = Math.random() * 2 + (depth > 1 ? 1.2 : 0.4);
                const op = 0.3 + Math.random() * 0.7;
                s.className = 'star twinkle';
                s.style.cssText =
                    'left:' + (Math.random() * 100) + '%;' +
                    'top:'  + (Math.random() * 100) + '%;' +
                    'width:' + size + 'px;' +
                    'height:' + size + 'px;' +
                    'opacity:' + op + ';' +
                    '--max:' + op + ';' +
                    '--min:' + (op * 0.25) + ';' +
                    '--dur:' + (3 + Math.random() * 5) + 's;' +
                    'animation-delay:' + (Math.random() * 5) + 's;' +
                    (size > 2 ? 'box-shadow: 0 0 4px #fff;' : '');
                frag.appendChild(s);
            }
            layer.appendChild(frag);
        });
    }

    // ===== PARALLAX (mouse + scroll) =====
    function initParallax() {
        const layers = document.querySelectorAll('.stars-layer');
        if (!layers.length) return;

        let mouseX = 0, mouseY = 0;
        let scrollY = 0;
        let rafId = null;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        function update() {
            layers.forEach(function(layer) {
                const depth = parseFloat(layer.dataset.depth || '1');
                const tx = mouseX * depth * 12;
                const ty = mouseY * depth * 12 - (scrollY * depth * 0.08);
                layer.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
            });
            rafId = null;
        }
        function schedule() { if (!rafId) rafId = requestAnimationFrame(update); }

        window.addEventListener('mousemove', function(e) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            schedule();
        }, { passive: true });
        window.addEventListener('scroll', function() {
            scrollY = window.scrollY;
            schedule();
        }, { passive: true });

        // Cursor glow
        const glow = document.querySelector('.cursor-glow');
        if (glow && window.matchMedia('(hover: hover)').matches) {
            window.addEventListener('mousemove', function(e) {
                glow.style.left = e.clientX + 'px';
                glow.style.top  = e.clientY + 'px';
            }, { passive: true });
        }
    }

    // ===== HEADER SCROLL =====
    function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;
        let last = 0;
        function check() {
            const y = window.scrollY;
            if (y > 30) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
            last = y;
        }
        check();
        window.addEventListener('scroll', check, { passive: true });
    }

    // ===== LANGUAGE SWITCHER =====
    function initLang() {
        const btn = document.getElementById('langToggle');
        const dropdown = document.getElementById('langDropdown');
        if (!btn || !dropdown) return;

        const currentLang = btn.querySelector('.current-lang');
        const options = dropdown.querySelectorAll('.lang-option');

        // Restore saved language
        let saved = 'en';
        try { saved = localStorage.getItem('moonwalker-lang') || 'en'; } catch (e) {}
        applyLang(saved);

               function applyLang(lang) {
            document.body.classList.remove('lang-en', 'lang-ru');
            document.body.classList.add('lang-' + lang);
            if (currentLang) currentLang.textContent = lang.toUpperCase();
            options.forEach(function(o) {
                o.classList.toggle('active', o.dataset.lang === lang);
            });
            try { localStorage.setItem('moonwalker-lang', lang); } catch (e) {}

            document.querySelectorAll('[data-placeholder-en][data-placeholder-ru]').forEach(function(input) {
                var placeholder = input.getAttribute('data-placeholder-' + lang);
                if (placeholder) input.placeholder = placeholder;
            });
        }

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        options.forEach(function(opt) {
            opt.addEventListener('click', function() {
                applyLang(opt.dataset.lang);
                dropdown.classList.remove('open');
            });
        });
        document.addEventListener('click', function(e) {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // ===== MOBILE MENU =====
    function initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const nav = document.getElementById('mainNav');
        if (!btn || !nav) return;
        btn.addEventListener('click', function() {
            nav.classList.toggle('nav--open');
            btn.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';
        });
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('nav--open');
                btn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== SCROLL ANIMATIONS =====
    function initScrollReveal() {
        const elements = document.querySelectorAll('.fade-up, .fade-in');
        if (!elements.length || !('IntersectionObserver' in window)) {
            elements.forEach(function(el) { el.classList.add('visible'); });
            return;
        }
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        elements.forEach(function(el) { observer.observe(el); });
    }

    // ===== ANIMATED COUNTERS =====
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const decimals = parseInt(el.dataset.decimals || '0', 10);
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';
                const duration = parseInt(el.dataset.duration || '1600', 10);
                const start = performance.now();

                function frame(now) {
                    const t = Math.min((now - start) / duration, 1);
                    // ease-out-cubic
                    const eased = 1 - Math.pow(1 - t, 3);
                    const value = target * eased;
                    el.textContent = prefix + value.toFixed(decimals) + suffix;
                    if (t < 1) requestAnimationFrame(frame);
                    else el.textContent = prefix + target.toFixed(decimals) + suffix;
                }
                requestAnimationFrame(frame);
                observer.unobserve(el);
            });
        }, { threshold: 0.5 });
        counters.forEach(function(c) { observer.observe(c); });
    }

    // ===== FAQ ACCORDION =====
    function initFAQ() {
        document.querySelectorAll('.faq-question').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const item = btn.parentElement;
                const answer = item.querySelector('.faq-answer');
                if (!answer) return;
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(function(fi) {
                    fi.classList.remove('active');
                    const a = fi.querySelector('.faq-answer');
                    if (a) a.style.maxHeight = null;
                });
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    // ===== BLOG CARDS CLICKABLE =====
    function initBlogCards() {
        document.querySelectorAll('.blog-card[data-url]').forEach(function(card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function(e) {
                if (e.target.closest('a')) return;
                window.location.href = card.dataset.url;
            });
        });
    }

    // ===== TOAST =====
    function ensureToastContainer() {
        let c = document.querySelector('.toast-container');
        if (!c) {
            c = document.createElement('div');
            c.className = 'toast-container';
            document.body.appendChild(c);
        }
        return c;
    }
    window.toast = function(message, type) {
        type = type || 'info';
        const container = ensureToastContainer();
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
        const msg = document.createElement('span');
        msg.textContent = message;
        t.appendChild(icon); t.appendChild(msg);
        container.appendChild(t);
        // animate in
        requestAnimationFrame(function() {
            requestAnimationFrame(function() { t.classList.add('show'); });
        });
        setTimeout(function() {
            t.classList.remove('show');
            setTimeout(function() { t.remove(); }, 400);
        }, 4000);
    };


    // ===== COSMIC DUST =====
    function createDust() {
        const layer = document.querySelector('.dust-layer');
        if (!layer) return;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        const count = 35;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            const size = (Math.random() * 1.6 + 0.4).toFixed(2);
            const left = (Math.random() * 100).toFixed(1);
            const drift = (Math.random() * 80 - 40).toFixed(0);
            const dur = (18 + Math.random() * 22).toFixed(0);
            const delay = (Math.random() * -30).toFixed(1);
            const opacity = (0.25 + Math.random() * 0.35).toFixed(2);
            p.className = 'dust-particle';
            p.style.cssText =
                'left:' + left + '%;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                '--drift:' + drift + 'px;' +
                '--max-opacity:' + opacity + ';' +
                'animation-duration:' + dur + 's;' +
                'animation-delay:' + delay + 's;';
            frag.appendChild(p);
        }
        layer.appendChild(frag);
    }

    // ===== INIT =====
    function init() {
        createStars();
        createDust();
        initParallax();
        initHeader();
        initLang();
        initMobileMenu();
        initScrollReveal();
        initCounters();
        initFAQ();
        initBlogCards();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
