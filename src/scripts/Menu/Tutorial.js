/* ===============================
   Tutorial.js
=============================== */
const tutorialsData = [
	{
		id: 1,
		title: 'Основы Ecrous Engine',
		description: 'Узнай, как создавать проекты...',
		videoId: 'xvFZjo5PgG0',
		category: 'beginner',
		level: 'beginner',
		duration: '12:45',
	},
	{
		id: 2,
		title: 'Скрипты NexLang',
		description: 'Введение в NexLang...',
		videoId: 'ysz5S6PUM-U',
		category: 'beginner',
		level: 'beginner',
		duration: '18:30',
	},
	{
		id: 3,
		title: 'Спрайты и анимации',
		description: 'Работа с объектами...',
		videoId: 'dQw4w9WgXcQ',
		category: 'graphics',
		level: 'beginner',
		duration: '22:15',
	},
	{
		id: 4,
		title: 'Оптимизация',
		description: 'Техники для больших проектов...',
		videoId: 'abc123def456',
		category: 'advanced',
		level: 'advanced',
		duration: '35:20',
	},
	{
		id: 5,
		title: 'UI система',
		description: 'Разработка интерфейса...',
		videoId: 'xyz789uvw012',
		category: 'ui',
		level: 'intermediate',
		duration: '28:45',
	},
	{
		id: 6,
		title: 'Физика',
		description: 'Физический движок...',
		videoId: 'ghi345jkl678',
		category: 'physics',
		level: 'intermediate',
		duration: '25:10',
	},
]

let currentCategory = 'all'
let currentSort = 'default'

// Общая логика оверлея (если ее нет в других файлах)
const getOverlay = () => {
	let ov = document.getElementById('modalOverlay')
	if (!ov) {
		ov = document.createElement('div')
		ov.id = 'modalOverlay'
		ov.className = 'modal-overlay'
		document.body.appendChild(ov)
	}
	return ov
}

window.openTutorials = function () {
	const panel = document.getElementById('tutorialsPanel')
	if (!panel) return

	const ov = getOverlay()
	ov.style.display = 'block'
	setTimeout(() => ov.classList.add('visible'), 10)
	document.documentElement.style.overflow = 'hidden'

	panel.style.display = 'flex'
	renderTutorials()
}

window.closeTutorials = function () {
	const panel = document.getElementById('tutorialsPanel')
	if (panel) panel.style.display = 'none'

	const ov = document.getElementById('modalOverlay')
	if (ov) {
		ov.classList.remove('visible')
		setTimeout(() => (ov.style.display = 'none'), 220)
	}
	document.documentElement.style.overflow = ''
}

function renderTutorials() {
	const container = document.getElementById('tutorialsContent')
	if (!container) return

	let filtered = tutorialsData
	if (currentCategory !== 'all') {
		filtered = filtered.filter(t => t.category === currentCategory)
	}

	if (currentSort === 'duration') {
		filtered.sort(
			(a, b) => parseDuration(a.duration) - parseDuration(b.duration)
		)
	} else if (currentSort === 'level') {
		const order = { beginner: 1, intermediate: 2, advanced: 3 }
		filtered.sort((a, b) => order[a.level] - order[b.level])
	}

	if (filtered.length === 0) {
		container.innerHTML = `<div class="empty-state"><h3>Туториалы не найдены</h3><p>Выберите другую категорию</p></div>`
		return
	}

	const generateCard = t => `
        <div class="tutorial-card">
            <div class="tutorial-card-header">
                <span class="tutorial-level ${t.level}">${getLevelName(
		t.level
	)}</span>
                <span class="tutorial-duration">⏱️ ${t.duration}</span>
            </div>
            <div class="tutorial-thumb-container">
                <img class="tutorial-thumb" src="https://img.youtube.com/vi/${
									t.videoId
								}/hqdefault.jpg" alt="${t.title}" loading="lazy">
                <div class="play-button"></div>
            </div>
            <div><h3>${t.title}</h3><p>${t.description}</p></div>
            <div class="tutorial-footer">
                <div class="tutorial-actions">
                    <button onclick="openTutorial('${t.videoId}', '${
		t.title
	}')">▶ Открыть</button>
                    <a class="open-new" href="https://www.youtube.com/watch?v=${
											t.videoId
										}" target="_blank" rel="noopener">🔗 YouTube</a>
                </div>
            </div>
        </div>`

	if (currentCategory !== 'all') {
		container.innerHTML = `<div class="tutorials-list">${filtered
			.map(generateCard)
			.join('')}</div>`
	} else {
		const categories = {}
		filtered.forEach(t => {
			;(categories[t.category] = categories[t.category] || []).push(t)
		})

		container.innerHTML = Object.entries(categories)
			.map(
				([cat, items]) => `
            <div class="category-section">
                <h3 class="category-title">${getCategoryName(cat)}</h3>
                <div class="tutorials-list">${items
									.map(generateCard)
									.join('')}</div>
            </div>
        `
			)
			.join('')
	}
}

// Helpers
const CAT_NAMES = {
	beginner: 'Для начинающих',
	graphics: 'Графика',
	advanced: 'Продвинутые',
	ui: 'Интерфейс',
	physics: 'Физика',
}
const LVL_NAMES = {
	beginner: 'Начальный',
	intermediate: 'Средний',
	advanced: 'Продвинутый',
}

function getCategoryName(c) {
	return CAT_NAMES[c] || c
}
function getLevelName(l) {
	return LVL_NAMES[l] || l
}
function parseDuration(d) {
	const p = d.split(':')
	return parseInt(p[0]) * 60 + parseInt(p[1])
}

window.changeCategory = val => {
	currentCategory = val
	renderTutorials()
}
window.changeSort = val => {
	currentSort = val
	renderTutorials()
}

window.openTutorial = function (videoId, title) {
	const container = document.getElementById('fullNewsContent')
	if (container) {
		container.innerHTML = `
            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
            </div>
            <h3 style="margin-top:20px;color:var(--text);">${title}</h3>`
	}
	const full = document.getElementById('fullNewsPanel')
	const tut = document.getElementById('tutorialsPanel')
	if (full) full.style.display = 'block'
	if (tut) tut.style.display = 'none'
}

document.addEventListener('DOMContentLoaded', () => {
	// Листенеры только если элементы существуют
	document
		.getElementById('categoryFilter')
		?.addEventListener('change', e => window.changeCategory(e.target.value))
	document
		.getElementById('sortFilter')
		?.addEventListener('change', e => window.changeSort(e.target.value))
})
