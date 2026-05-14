// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Contact form submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Save to localStorage for admin panel
    const requests = JSON.parse(localStorage.getItem('accpro_requests') || '[]');
    const newRequest = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: data.name,
        phone: data.phone,
        email: data.email,
        service: data.service,
        message: data.message,
        date: new Date().toISOString(),
        status: 'pending'
    };
    requests.push(newRequest);
    localStorage.setItem('accpro_requests', JSON.stringify(requests));

    // Show success message
    alert('ขอบคุณที่ติดต่อเรา! เราจะติดต่อกลับโดยเร็วที่สุด');
    contactForm.reset();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 72; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Load contact info from localStorage (set by admin panel)
function loadContactInfo() {
    const data = localStorage.getItem('accpro_contact_info');
    if (!data) return;

    const info = JSON.parse(data);
    const contactItems = document.querySelectorAll('.contact-item');

    // Update address
    if (contactItems[0] && (info.address1 || info.address2 || info.address3)) {
        const p = contactItems[0].querySelector('p');
        if (p) {
            p.innerHTML = `${info.address1 || ''}<br>${info.address2 || ''}<br>${info.address3 || ''}`;
        }
    }

    // Update phone
    if (contactItems[1] && (info.phone1 || info.phone2)) {
        const p = contactItems[1].querySelector('p');
        if (p) {
            p.innerHTML = `${info.phone1 || ''}<br>${info.phone2 || ''}`;
        }
    }

    // Update email
    if (contactItems[2] && info.email) {
        const p = contactItems[2].querySelector('p');
        if (p) {
            p.textContent = info.email;
        }
    }

    // Update hours
    if (contactItems[3] && (info.hours1 || info.hours2)) {
        const p = contactItems[3].querySelector('p');
        if (p) {
            p.innerHTML = `จันทร์ - ศุกร์: ${info.hours1 || ''}<br>เสาร์: ${info.hours2 || ''}`;
        }
    }
}

loadContactInfo();

// Load website content from localStorage (set by admin panel)
function loadWebContent() {
    const data = localStorage.getItem('accpro_content');
    if (!data) return;

    const content = JSON.parse(data);

    // Hero section
    if (content.hero) {
        const h = content.hero;
        const heroH1 = document.querySelector('.hero h1');
        const heroSub = document.querySelector('.hero-subtitle');
        const stats = document.querySelectorAll('.stat');

        if (heroH1 && h.title) heroH1.innerHTML = h.title.replace(/\n/g, '<br>');
        if (heroSub && h.subtitle) heroSub.innerHTML = h.subtitle.replace(/\n/g, '<br>');

        if (stats[0]) {
            if (h.stat1Num) stats[0].querySelector('.stat-number').textContent = h.stat1Num;
            if (h.stat1Label) stats[0].querySelector('.stat-label').textContent = h.stat1Label;
        }
        if (stats[1]) {
            if (h.stat2Num) stats[1].querySelector('.stat-number').textContent = h.stat2Num;
            if (h.stat2Label) stats[1].querySelector('.stat-label').textContent = h.stat2Label;
        }
        if (stats[2]) {
            if (h.stat3Num) stats[2].querySelector('.stat-number').textContent = h.stat3Num;
            if (h.stat3Label) stats[2].querySelector('.stat-label').textContent = h.stat3Label;
        }
    }

    // Services section
    if (content.services) {
        const svc = content.services;
        const svcSection = document.querySelector('.services');
        if (svcSection) {
            const svcHeader = svcSection.querySelector('.section-header');
            if (svcHeader) {
                if (svc.title) svcHeader.querySelector('h2').textContent = svc.title;
                if (svc.desc) svcHeader.querySelector('p').textContent = svc.desc;
            }
            if (svc.items && svc.items.length > 0) {
                const grid = svcSection.querySelector('.services-grid');
                grid.innerHTML = svc.items.map(item => `
                    <div class="service-card">
                        <div class="service-icon">${item.icon}</div>
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                    </div>
                `).join('');
            }
        }
    }

    // Why Us section
    if (content.whyus) {
        const wu = content.whyus;
        const wuSection = document.querySelector('.why-us');
        if (wuSection) {
            const wuHeader = wuSection.querySelector('.section-header');
            if (wuHeader) {
                if (wu.title) wuHeader.querySelector('h2').textContent = wu.title;
                if (wu.desc) wuHeader.querySelector('p').textContent = wu.desc;
            }
            if (wu.items && wu.items.length > 0) {
                const grid = wuSection.querySelector('.why-us-grid');
                grid.innerHTML = wu.items.map((item, i) => `
                    <div class="why-us-card">
                        <div class="why-us-number">${String(i + 1).padStart(2, '0')}</div>
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                    </div>
                `).join('');
            }
        }
    }

    // Pricing section
    if (content.pricing) {
        const pr = content.pricing;
        const prSection = document.querySelector('.pricing');
        if (prSection) {
            const prHeader = prSection.querySelector('.section-header');
            if (prHeader) {
                if (pr.title) prHeader.querySelector('h2').textContent = pr.title;
                if (pr.desc) prHeader.querySelector('p').textContent = pr.desc;
            }
            if (pr.packages && pr.packages.length > 0) {
                const grid = prSection.querySelector('.pricing-grid');
                grid.innerHTML = pr.packages.map(pkg => {
                    const features = pkg.features.split('\n').filter(f => f.trim());
                    return `
                        <div class="pricing-card ${pkg.featured ? 'featured' : ''}">
                            ${pkg.featured ? '<div class="pricing-badge">แนะนำ</div>' : ''}
                            <div class="pricing-header">
                                <h3>${pkg.name}</h3>
                                <p class="pricing-desc">${pkg.desc}</p>
                                <div class="pricing-price">
                                    <span class="price">${pkg.price}</span>
                                    <span class="period">บาท/เดือน</span>
                                </div>
                            </div>
                            <ul class="pricing-features">
                                ${features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                            <a href="#contact" class="btn ${pkg.featured ? 'btn-primary' : 'btn-outline'} btn-block">เลือกแพ็กเกจนี้</a>
                        </div>
                    `;
                }).join('');
            }
        }
    }
}

loadWebContent();

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.service-card, .why-us-card, .pricing-card, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animation class styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);
