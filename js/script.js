// Board Games Codex - Extended Version (with cover images support)

let allGames = [];
let currentFilter = 'all';
let currentGameId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupEventListeners();
});

/**
 * Загружает игры из games.json
 */
async function loadGames() {
    try {
        const response = await fetch('js/games.json');
        if (!response.ok) throw new Error('Ошибка загрузки файла');

        const data = await response.json();
        allGames = Array.isArray(data) ? data : [data];

        renderGames(allGames);
    } catch (error) {
        console.error('Ошибка при загрузке игр:', error);
        document.getElementById('gamesList').innerHTML =
            '<p style="grid-column: 1/-1; text-align: center; color: #ff6b9d;">⚠️ Не удалось загрузить игры</p>';
    }
}

/**
 * Рендерит карточки игр
 */
function renderGames(games) {
    const gamesList = document.getElementById('gamesList');
    const emptyState = document.getElementById('emptyState');

    if (games.length === 0) {
        gamesList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    gamesList.innerHTML = games.map(game => createGameCard(game)).join('');

    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => openGameModal(card.dataset.id));
    });
}

/**
 * Создаёт HTML карточку игры (с поддержкой cover_image)
 */
function createGameCard(game) {
    const meta = game.meta || {};

    const coverBlock = game.cover_image
        ? `<img src="${game.cover_image}" alt="${game.name}">`
        : `<div class="game-card-cover--empty">🎲</div>`;

    return `
        <div class="game-card" data-id="${game.id}">
            <div class="game-card-cover">
                ${coverBlock}
            </div>

            <div class="game-card-header">
                <h2 class="game-title">${game.name}</h2>
            </div>

            <p class="game-description">${game.description || 'Описание отсутствует'}</p>

            <div class="game-meta">
                <div class="meta-item">👥 ${meta.players || '—'}</div>
                <div class="meta-item">⏱️ ${meta.duration || '—'}</div>
            </div>

            <button class="game-button">📖 Подробнее</button>
        </div>
    `;
}

/**
 * Открывает модальное окно с полной информацией об игре
 */
function openGameModal(gameId) {
    const game = allGames.find(g => g.id === parseInt(gameId));
    if (!game) return;

    currentGameId = game.id;
    const modal = document.getElementById('gameModal');

    document.getElementById('modalTitle').textContent = game.name;

    const meta = game.meta || {};
    document.getElementById('metaPlayers').textContent = meta.players || '—';
    document.getElementById('metaDuration').textContent = meta.duration || '—';
    document.getElementById('metaAge').textContent = meta.age || '—';
    document.getElementById('metaComponents').textContent = meta.components || '—';

    document.getElementById('gameDescription').textContent = game.description || '';

    fillRulesTab(game.basic_rules || {});
    fillComponentsTab(game.components || []);
    fillGameplayTab(game.gameplay || {});
    fillVictoryTab(game.victory || []);
    fillClarificationsTab(game.clarifications || []);
    fillGalleryTab(game.gallery || []);

    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('rules').classList.add('active');

    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.querySelector('[data-tab="rules"]').classList.add('active');

    modal.style.display = 'flex';
}

/**
 * Таб "Правила"
 */
function fillRulesTab(rules) {
    document.getElementById('ruleGoal').textContent = rules.goal || 'Не указано';
    document.getElementById('ruleHowToWin').textContent = rules.how_to_win || 'Не указано';
    document.getElementById('ruleKeyMechanics').textContent = rules.key_mechanics || 'Не указано';
}

/**
 * Таб "Компоненты"
 */
function fillComponentsTab(components) {
    const list = document.getElementById('componentsList');

    if (components.length === 0) {
        list.innerHTML = '<p style="color: #a080c0;">Компоненты не добавлены</p>';
        return;
    }

    list.innerHTML = components.map(comp => `
        <div class="component-card">
            <div class="component-image">
                ${comp.image_url ? `<img src="${comp.image_url}" alt="${comp.name}">` : '📦'}
            </div>
            <div class="component-name">${comp.name}</div>
            <div class="component-type">${comp.type}</div>
            <div class="component-quantity">Кол-во: ${comp.quantity || '1'}</div>
            ${comp.special ? '<div class="component-special">⭐ Специальная карта</div>' : ''}
            <div class="component-description">${comp.description || ''}</div>
        </div>
    `).join('');
}

/**
 * Таб "Ход игры"
 */
function fillGameplayTab(gameplay) {
    const setupSteps = document.getElementById('setupSteps');
    if (gameplay.setup && gameplay.setup.steps) {
        setupSteps.innerHTML = gameplay.setup.steps.map(step => `<li>${step}</li>`).join('');
    } else {
        setupSteps.innerHTML = '<li>Не указаны</li>';
    }

    const phasesList = document.getElementById('phasesList');
    if (gameplay.phases && gameplay.phases.length > 0) {
        phasesList.innerHTML = gameplay.phases.map(phase => `
            <div class="phase-card">
                <div class="phase-name">${phase.name}</div>
                <div class="phase-description">${phase.description}</div>
            </div>
        `).join('');
    } else {
        phasesList.innerHTML = '<p style="color: #a080c0;">Фазы не указаны</p>';
    }

    const strategiesList = document.getElementById('strategiesList');
    if (gameplay.strategies && gameplay.strategies.length > 0) {
        strategiesList.innerHTML = gameplay.strategies.map(strat => `<li>${strat}</li>`).join('');
    } else {
        strategiesList.innerHTML = '<li>Не указаны</li>';
    }
}

/**
 * Таб "Победа"
 */
function fillVictoryTab(victories) {
    const list = document.getElementById('victoryList');

    if (victories.length === 0) {
        list.innerHTML = '<p style="color: #a080c0;">Условия победы не указаны</p>';
        return;
    }

    list.innerHTML = victories.map(victory => `
        <div class="victory-condition">
            <div class="victory-condition-title">${victory.condition}</div>
            <div class="victory-condition-desc">${victory.description}</div>
        </div>
    `).join('');
}

/**
 * Таб "Дополнения"
 */
function fillClarificationsTab(clarifications) {
    const list = document.getElementById('clarificationsList');

    if (clarifications.length === 0) {
        list.innerHTML = '<p style="color: #a080c0;">Дополнения не добавлены</p>';
        return;
    }

    list.innerHTML = clarifications.map(item => `
        <div class="clarification-item">
            <div class="clarification-question">❓ ${item.question}</div>
            <div class="clarification-answer">${item.answer}</div>
            ${item.image_url ? `
                <div class="clarification-image" onclick="openLightbox('${item.image_url}', '${item.question}')">
                    <img src="${item.image_url}" alt="${item.question}">
                </div>
            ` : ''}
            <div class="clarification-solution">✓ Решение: ${item.solution}</div>
        </div>
    `).join('');
}

/**
 * Таб "Галерея"
 */
function fillGalleryTab(gallery) {
    const grid = document.getElementById('galleryGrid');
    const empty = document.getElementById('emptyGallery');

    if (gallery.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = gallery.map(item => `
        <div class="gallery-item" onclick="openLightbox('${item.image_url}', '${item.title}')">
            <div class="gallery-image">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : '📸'}
            </div>
            <div class="gallery-info">
                <div class="gallery-title">${item.title}</div>
                <div class="gallery-description">${item.description || ''}</div>
                <div class="gallery-date">${item.date || ''}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Лайтбокс
 */
function openLightbox(imageSrc, caption) {
    if (!imageSrc) return;
    document.getElementById('lightboxImage').src = imageSrc;
    document.getElementById('lightboxCaption').textContent = caption;
    document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

/**
 * Закрытие модалки
 */
function closeGameModal() {
    document.getElementById('gameModal').style.display = 'none';
    currentGameId = null;
}

/**
 * Фильтрация по сложности
 */
function filterGames(complexity) {
    if (complexity === 'all') return allGames;
    return allGames.filter(game => game.meta?.complexity === complexity);
}

/**
 * Фильтры + поиск
 */
function applyFiltersAndSearch() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    let filtered = filterGames(currentFilter);

    if (searchQuery) {
        filtered = filtered.filter(game =>
            game.name.toLowerCase().includes(searchQuery) ||
            (game.description || '').toLowerCase().includes(searchQuery)
        );
    }

    renderGames(filtered);
}

/**
 * События
 */
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', applyFiltersAndSearch);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            applyFiltersAndSearch();
        });
    });

    document.getElementById('gameModal').addEventListener('click', e => {
        if (e.target.id === 'gameModal') closeGameModal();
    });

    document.querySelector('.modal-close').addEventListener('click', closeGameModal);

    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeGameModal();
            closeLightbox();
        }
    });
}
