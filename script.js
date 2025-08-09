document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONFIG ---
    // MODIFIED: Removed 'theme' from the state. It's no longer needed.
    let state = {
        language: localStorage.getItem('language') || 'en',
        currentPage: 'home',
        pageId: null,
    };
    const docElement = document.documentElement;

    // --- DOM ELEMENTS ---
    const app = document.getElementById('app');
    const headerEl = document.getElementById('main-header');
    const footerEl = document.getElementById('main-footer');
    const dynamicHeaderContent = document.getElementById('dynamic-header-content');
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    // --- TRANSLATIONS (Unchanged) ---
    const translations = {
        en: { siteName: "AI Tools Hub", discover: "Discover, Compare & Master AI Tools", heroSubtitle: "Your ultimate guide to the best AI tools.", searchPlaceholder: "Search over 70 AI tools...", tools: "Tools", totalReviews: "Total Reviews", totalCategories: "Total Categories", sponsored: "Sponsored", reviews: "Reviews", tryFree: "Try Free", features: "Features", limitations: "Limitations", backToHome: "Back to All Tools", similarTools: "Similar Tools", toolNotFound: "Tool not found!" },
        ar: { siteName: "مركز أدوات الذكاء الاصطناعي", discover: "اكتشف، قارن، وأتقن أدوات الذكاء الاصطناعي", heroSubtitle: "دليلك الشامل لأفضل أدوات الذكاء الاصطناعي.", searchPlaceholder: "ابحث في أكثر من 70 أداة...", tools: "أداة", totalReviews: "مراجعة", totalCategories: "فئة", sponsored: "ممَوَّل", reviews: "مراجعة", tryFree: "جرّب مجانًا", features: "المميزات", limitations: "العيوب", backToHome: "العودة لكل الأدوات", similarTools: "أدوات مشابهة", toolNotFound: "الأداة غير موجودة!" }
    };
    const t = (key) => translations[state.language][key] || key;
    const tCat = (key) => {
        const catMap = { writing: "الكتابة", image: "إنشاء الصور", video: "إنشاء الفيديو", audio: "الصوت", productivity: "الإنتاجية", developer: "المطورين", '3d': "ثلاثي الأبعاد", design: "التصميم", marketing: "التسويق" };
        const enCat = key.charAt(0).toUpperCase() + key.slice(1);
        return state.language === 'ar' ? (catMap[key] || key) : enCat;
    };
    const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toString());

    // --- RANKING LOGIC (Unchanged) ---
    const getRankedTools = () => {
        const groupedTools = {};
        toolsData.forEach(tool => {
            if (!groupedTools[tool.category]) groupedTools[tool.category] = [];
            tool.score = (tool.rating * 5) + Math.log10(tool.reviewCount + 1) + (tool.isSponsored ? 2 : 0);
            groupedTools[tool.category].push(tool);
        });
        for (const category in groupedTools) {
            groupedTools[category].sort((a, b) => b.score - a.score);
            groupedTools[category].forEach((tool, index) => { tool.rank = index + 1; });
        }
        return groupedTools;
    };

    // --- RENDER FUNCTIONS ---

    // MODIFIED: renderHeader no longer includes the theme toggle button.
    const renderHeader = () => {
        headerEl.innerHTML = `
            <div class="container mx-auto px-4 h-16 flex justify-between items-center">
                <a href="#" class="flex items-center gap-3 text-2xl font-bold">
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-bolt text-white"></i>
                    </div>
                    <span>${t('siteName')}</span>
                </a>
                <div class="flex items-center gap-5">
                    <button id="lang-switcher" class="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-2">
                        <i class="fas fa-globe"></i>
                        <span>${state.language === 'en' ? 'العربية' : 'English'}</span>
                    </button>
                    <!-- REMOVED: Theme toggle button was here. -->
                </div>
            </div>`;
    };
    
    // ADDED: New function to render the category navigation buttons.
    const renderCategoryNav = () => {
        const rankedTools = getRankedTools();
        const orderedCategories = Object.keys(rankedTools).sort((a,b) => rankedTools[b].length - rankedTools[a].length);

        const buttonsHTML = orderedCategories.map(category => `
            <button class="category-nav-btn" data-target-id="category-${category}" aria-label="Scroll to ${tCat(category)} category">
                ${tCat(category)}
            </button>
        `).join('');

        return `
            <div class="py-4 overflow-x-auto">
                <div id="category-nav-container" class="flex items-center gap-3 w-max mx-auto px-4">
                    ${buttonsHTML}
                </div>
            </div>`;
    };

    const renderHomePage = () => {
        // Render Hero
        dynamicHeaderContent.innerHTML = `<section id="hero-section"><div class="text-center py-20 px-4 text-white relative z-10"><h1 class="text-5xl md:text-6xl font-extrabold">${t('siteName')}</h1><h2 class="text-2xl md:text-3xl font-bold text-primary mt-2">${t('discover')}</h2><p class="max-w-2xl mx-auto mt-4 text-lg text-text-muted">${t('heroSubtitle')}</p></div></section>`;
        
        const rankedToolsByCategory = getRankedTools();
        const orderedCategories = Object.keys(rankedToolsByCategory).sort((a,b) => rankedToolsByCategory[b].length - rankedToolsByCategory[a].length);

        // Render Search, Category Nav, and Tool Lists
        let content = `
            <div class="sticky top-[65px] z-40 bg-background/80 backdrop-blur-md py-4">
                <div class="relative max-w-2xl mx-auto">
                    <i class="fas fa-search absolute top-1/2 left-4 -translate-y-1/2 text-text-muted"></i>
                    <input id="search-input" type="text" placeholder="${t('searchPlaceholder')}" class="w-full pl-12 pr-4 py-2.5 rounded-lg border bg-card border-gray-700 focus:ring-2 focus:ring-primary">
                </div>
                ${renderCategoryNav()}
            </div>`;
        
        orderedCategories.forEach(category => {
            // ADDED: Each category section now has a unique ID for scrolling.
            content += `
                <div id="category-${category}" class="category-section mb-12 pt-4">
                    <h2 class="category-header">${tCat(category)}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        ${rankedToolsByCategory[category].map(renderToolCard).join('')}
                    </div>
                </div>`;
        });
        app.innerHTML = content;
        addHomePageListeners();
    };

    // Unchanged from previous version
    const renderReviewPage = (toolId) => {
        dynamicHeaderContent.innerHTML = '';
        const tool = toolsData.find(t => t.id === toolId);
        if (!tool) { app.innerHTML = `<div class="text-center py-20"><h2>${t('toolNotFound')}</h2><a href="#" class="text-primary mt-4 inline-block">${t('backToHome')}</a></div>`; return; }
        
        const lang = state.language;
        const featuresList = tool.features[lang].map(f => `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-green-500 mt-1"></i><span>${f}</span></li>`).join('');
        const limitationsList = tool.limitations[lang].map(l => `<li class="flex items-start gap-3"><i class="fas fa-times-circle text-red-500 mt-1"></i><span>${l}</span></li>`).join('');
        const similarTools = toolsData.filter(st => st.category === tool.category && st.id !== tool.id).sort((a,b) => b.rating - a.rating).slice(0, 3);

        app.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <a href="#" class="text-primary hover:underline mb-8 inline-block">&larr; ${t('backToHome')}</a>
                <div class="bg-card rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center mb-8">
                    <img src="${tool.logo}" alt="${tool.name[lang]}" class="w-32 h-32 p-2 bg-gray-800 rounded-2xl object-contain flex-shrink-0" />
                    <div class="${lang === 'ar' ? 'md:text-right' : 'md:text-left'} text-center md:text-start">
                        <h1 class="text-4xl font-bold mb-2">${tool.name[lang]}</h1><p class="text-lg text-text-muted">${tool.short_description[lang]}</p>
                        <a href="${tool.website}" target="_blank" rel="noopener noreferrer" class="mt-4 inline-block bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary/90">${t('tryFree')}</a>
                    </div>
                </div>
                <div class="grid md:grid-cols-2 gap-8 mb-12">
                    <div class="glass-card"><h3 class="text-2xl font-bold mb-4 text-green-400">${t('features')}</h3><ul class="space-y-3">${featuresList}</ul></div>
                    <div class="glass-card"><h3 class="text-2xl font-bold mb-4 text-red-500">${t('limitations')}</h3><ul class="space-y-3">${limitationsList}</ul></div>
                </div>
                ${similarTools.length > 0 ? `<h2 class="text-3xl font-bold mt-16 mb-6 text-center">${t('similarTools')}</h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${similarTools.map(renderToolCard).join('')}</div>` : ''}
            </div>`;
    };

    // --- ROUTER & MAIN RENDER ---
    const router = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#reviews/')) {
            state.currentPage = 'reviews';
            state.pageId = hash.substring(9);
        } else {
            state.currentPage = 'home';
            state.pageId = null;
        }
        render();
    };

    const render = () => {
        docElement.lang = state.language;
        docElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
        renderHeader();
        footerEl.innerHTML = `&copy; ${new Date().getFullYear()} ${t('siteName')}. All rights reserved.`;
        if (state.currentPage === 'home') renderHomePage();
        else if (state.currentPage === 'reviews') renderReviewPage(state.pageId);
        window.scrollTo(0, 0);
        addGlobalEventListeners();
    };

    // --- EVENT LISTENERS ---
    const addHomePageListeners = () => {
        // Search input listener
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.category-section').forEach(section => {
                    let hasVisibleCard = false;
                    section.querySelectorAll('.tool-card').forEach(card => {
                        const nameEn = card.dataset.nameEn || '';
                        const nameAr = card.dataset.nameAr || '';
                        if (nameEn.includes(searchTerm) || nameAr.includes(searchTerm)) {
                            card.style.display = 'flex';
                            hasVisibleCard = true;
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    section.style.display = hasVisibleCard ? 'block' : 'none';
                });
            });
        }

        // ADDED: Event listener for category navigation buttons using event delegation.
        const navContainer = document.getElementById('category-nav-container');
        if (navContainer) {
            navContainer.addEventListener('click', (e) => {
                const button = e.target.closest('.category-nav-btn');
                if (!button) return;

                const targetId = button.dataset.targetId;
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Calculate the position of the target element, accounting for the sticky header
                    const headerOffset = 70; // Height of the sticky header + some margin
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        }
    };
    
    // MODIFIED: Removed theme toggle listener.
    const addGlobalEventListeners = () => {
        headerEl.addEventListener('click', (e) => {
            if (e.target.closest('#lang-switcher')) {
                state.language = state.language === 'en' ? 'ar' : 'en';
                localStorage.setItem('language', state.language);
                router();
            }
        });
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => { window.scrollY > 400 ? scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none') : scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none'); });
    };

    // --- INITIALIZATION ---
    window.addEventListener('hashchange', router);
    router();
});
