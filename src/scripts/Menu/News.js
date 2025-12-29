/* =============================
      НОВОСТИ (ДАННЫЕ)
============================= */

const NEWS = [
    {
        title: 'Ecrous Engine — UI Update',
        date: '31.12.2025',
        short:
            'Глобальное обновление интерфейса редактора: визуальный UI-редактор, drag-and-drop, темы, анимации и тестирование.',
        image:
            'https://s4.iimage.su/s/07/th_uCEAPoIx89mg3d5bKt8ZnhqnzolrvKefBstN9GT0.png',
        full: `
        <h2>Ecrous Engine - UI Update</h2>
        <p>Новые возможности и улучшения в редакторе!</p>
        <p>Подробнее см. релиз в документации.</p>
        `,
        link: 'https://daniildomashnev.github.io/UI-Update-EE/',
    },
]

/* =============================
      ФУНКЦИИ ОТКРЫТИЯ
============================= */

function openNews() {
    const panel = document.getElementById('newsPanel')
    if (!panel) return

    try {
        const overlay = ensureModalOverlay()
        overlay.style.display = 'block'
        setTimeout(() => overlay.classList.add('visible'), 10)
        document.documentElement.style.overflow = 'hidden'
    } catch (e) {}

    panel.style.display = 'block'
    renderNews()
}

function closeNews() {
    const panel = document.getElementById('newsPanel')
    if (panel) panel.style.display = 'none'

    try {
        const overlay = document.getElementById('modalOverlay')
        if (overlay) {
            overlay.classList.remove('visible')
            setTimeout(() => { overlay.style.display = 'none' }, 220)
        }
    } catch (e) {}

    document.documentElement.style.overflow = ''
}

function openFullNews(index) {
    const panel = document.getElementById('fullNewsPanel')
    const content = document.getElementById('fullNewsContent')
    if (!panel || !content) return

    const item = NEWS[index]
    const img = item && item.image ? `<img class="full-news-image" src="${item.image}" alt="${item.title}">` : ''
    const external = item && item.link ? `<p style="margin-top:12px"><a class="external-link" href="${item.link}" target="_blank">Открыть на сайте</a></p>` : ''

    content.innerHTML = img + (item ? item.full : '') + external

    try {
        const overlay = ensureModalOverlay()
        overlay.style.display = 'block'
        setTimeout(() => overlay.classList.add('visible'), 10)
        document.documentElement.style.overflow = 'hidden'
    } catch (e) {}

    panel.style.display = 'block'
}

function closeFullNews() {
    const panel = document.getElementById('fullNewsPanel')
    if (panel) panel.style.display = 'none'

    try {
        const overlay = document.getElementById('modalOverlay')
        if (overlay) {
            overlay.classList.remove('visible')
            setTimeout(() => { overlay.style.display = 'none' }, 220)
        }
    } catch (e) {}

    document.documentElement.style.overflow = ''
}

/* =============================
      ОТРИСОВКА СПИСКА НОВОСТЕЙ
============================= */

function renderNews() {
    const list = document.getElementById('newsList')
    if (!list) return
    list.innerHTML = ''

    NEWS.forEach((n, index) => {
        const card = document.createElement('div')
        card.className = 'news-item'

        const thumb = n.image ? `<img class="news-thumb" src="${n.image}" alt="${n.title}">` : ''

        card.innerHTML = `
            ${thumb}
            <div class="news-meta">
                <h3>${n.title}</h3>
                <div class="date">${n.date}</div>
                <p>${n.short}</p>
                <div class="news-actions">
                    <button class="news-button" onclick="openFullNews(${index})">Читать полностью</button>
                    ${n.link ? `<a class="external-link" href="${n.link}" target="_blank">Сайт</a>` : ''}
                </div>
            </div>
        `

        list.appendChild(card)
    })
}
