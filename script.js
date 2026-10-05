// Inicializar Iconos Lucide
lucide.createIcons();

// Lógica del Menú Móvil
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('translate-x-full');
        menuIcon.setAttribute('data-lucide', 'x');
        document.body.style.overflow = 'hidden'; // Previene el scroll del fondo
    } else {
        mobileMenu.classList.add('translate-x-full');
        menuIcon.setAttribute('data-lucide', 'menu');
        document.body.style.overflow = ''; // Restaura el scroll
    }
    lucide.createIcons(); // Refresca el icono X / Menu
}

mobileMenuBtn.addEventListener('click', toggleMenu);

// Cierra el menú al hacer clic en un enlace
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        if(isMenuOpen) toggleMenu();
    });
});

// Efecto Navbar en Scroll
const navbar = document.getElementById('navbar');
// Barra de Progreso de Lectura
window.addEventListener('scroll', () => {
    // Para el navbar
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-md', 'py-1');
        navbar.classList.replace('bg-white/90', 'bg-white/98');
    } else {
        navbar.classList.remove('shadow-md', 'py-1');
        navbar.classList.replace('bg-white/98', 'bg-white/90');
    }

    // Para la barra de progreso
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("scroll-progress").style.width = scrolled + "%";
});

// Animaciones Reveal Cinemáticas
const revealOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
});

// Asesor IA Script
const iaForm = document.getElementById('ia-form');
const submitBtn = document.getElementById('ia-submit');
const resultContainer = document.getElementById('ia-result-container');
const resultText = document.getElementById('ia-result-text');

async function callGeminiAPI(prompt, retries = 5, delay = 1000) {
    const apiKey = ""; // API Key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { 
                        parts: [{ text: "Eres un asesor de salud experto y empático de la marca CQPharma en Perú. Tu objetivo es explicar cómo Kolflex (nuestra fórmula de Colágeno Hidrolizado, Cúrcuma y Glucosamina) ayuda al usuario. Responde en 1 solo párrafo corto y persuasivo (máximo 4 líneas) basándote en la edad y el objetivo principal del usuario. Sé directo, menciona cómo los ingredientes actúan en su cuerpo y termina motivándolo a tomar acción. No uses saludos largos ni viñetas." }] 
                    }
                })
            });

            if (!response.ok) throw new Error('Error en la API');
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No pudimos generar tu plan. Inténtalo de nuevo.";
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

iaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const age = document.getElementById('ia-age').value;
    const goal = document.getElementById('ia-goal').value;
    
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loader"></span> Analizando tu perfil...';
    resultContainer.classList.add('hidden');
    resultContainer.classList.remove('opacity-100');
    
    const prompt = `Hola, tengo ${age} años y mi objetivo principal es: ${goal}. ¿Cómo me ayudará Kolflex?`;

    try {
        let aiResponse = await callGeminiAPI(prompt);
        aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        resultText.innerHTML = aiResponse;
        resultContainer.classList.remove('hidden');
        
        setTimeout(() => {
            resultContainer.classList.add('opacity-100');
        }, 100);

    } catch (error) {
        console.error("Error:", error);
        resultText.innerHTML = "<em>Hubo un problema de conexión. Por favor, asegúrate de tener internet e intenta de nuevo.</em>";
        resultContainer.classList.remove('hidden');
        setTimeout(() => resultContainer.classList.add('opacity-100'), 100);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});
// Solo un video reproduciéndose a la vez en toda la página
document.addEventListener('play', (event) => {
    document.querySelectorAll('video').forEach(v => {
        if (v !== event.target && !v.paused) v.pause();
    });
}, true);

// Tarjetas de testimonios: el video se reproduce dentro de su tarjeta
document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    const playButton = card.querySelector('.play-button-overlay');
    if (!video || !playButton) return;

    const showVideo = () => {
        card.classList.add('is-active');
        video.controls = true;
    };
    const showCover = () => {
        card.classList.remove('is-active');
        video.controls = false;
    };

    // Sin JS los controles nativos quedan visibles; con JS se muestran al reproducir
    video.controls = false;

    playButton.addEventListener('click', () => {
        showVideo();
        video.play().catch(showVideo); // Si el navegador bloquea play(), quedan los controles nativos
    });
    video.addEventListener('play', showVideo);
    video.addEventListener('pause', () => {
        if (!video.seeking) showCover();
    });
    video.addEventListener('ended', () => video.load()); // Vuelve al póster
});

// Demostración clínica: play/pausa con el botón superpuesto (videos muted + loop)
const clinicCards = document.querySelectorAll('.clinic-card');

// Pausa los videos que salen de pantalla para no consumir batería en bucle
const clinicObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) entry.target.querySelector('video')?.pause();
    });
}, { threshold: 0.25 });

clinicCards.forEach(card => {
    const video = card.querySelector('video');
    const toggle = card.querySelector('.clinic-toggle');
    if (!video || !toggle) return;

    const title = card.querySelector('h4')?.textContent.trim() || 'video';
    const syncState = () => {
        const playing = !video.paused;
        card.classList.toggle('is-playing', playing);
        toggle.setAttribute('aria-label', `${playing ? 'Pausar' : 'Reproducir'} video: ${title}`);
    };

    toggle.addEventListener('click', () => {
        if (!video.paused) {
            video.pause();
            return;
        }
        video.play().catch(() => {
            // Si el navegador bloquea play(), se muestran los controles nativos como respaldo
            video.controls = true;
            toggle.hidden = true;
        });
    });
    video.addEventListener('play', syncState);
    video.addEventListener('pause', syncState);
    clinicObserver.observe(card);
});