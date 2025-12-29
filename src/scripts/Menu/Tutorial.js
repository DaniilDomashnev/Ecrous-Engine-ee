const tutorialsData = [
	{
		id: 1,
		title: 'Основы Ecrous Engine',
		description:
			'Узнай, как создавать проекты, управлять ресурсами и использовать интерфейс.',
		videoId: 'xvFZjo5PgG0',
		category: 'beginner',
		level: 'beginner',
		duration: '12:45',
		tags: ['основы', 'интерфейс'],
	},
	{
		id: 2,
		title: 'Скрипты NexLang для начинающих',
		description: 'Введение в NexLang, базовый синтаксис и запуск кода.',
		videoId: 'ysz5S6PUM-U',
		category: 'beginner',
		level: 'beginner',
		duration: '18:30',
		tags: ['скрипты', 'программирование'],
	},
	{
		id: 3,
		title: 'Работа со спрайтами и анимациями',
		description: 'Как создавать объекты, анимировать их и управлять сценой.',
		videoId: 'dQw4w9WgXcQ',
		category: 'graphics',
		level: 'beginner',
		duration: '22:15',
		tags: ['графика', 'анимация'],
	},
	{
		id: 4,
		title: 'Продвинутая оптимизация',
		description: 'Техники оптимизации производительности для больших проектов.',
		videoId: 'abc123def456',
		category: 'advanced',
		level: 'advanced',
		duration: '35:20',
		tags: ['оптимизация', 'производительность'],
	},
	{
		id: 5,
		title: 'Создание UI системы',
		description:
			'Разработка пользовательского интерфейса и элементов управления.',
		videoId: 'xyz789uvw012',
		category: 'ui',
		level: 'intermediate',
		duration: '28:45',
		tags: ['UI', 'интерфейс'],
	},
	{
		id: 6,
		title: 'Физика и коллизии',
		description: 'Настройка физического движка и обработка столкновений.',
		videoId: 'ghi345jkl678',
		category: 'physics',
		level: 'intermediate',
		duration: '25:10',
		tags: ['физика', 'коллизии'],
	},
]

let currentCategory = 'all'
let currentSort = 'default'

// Открыть панель туториалов
function openTutorials() {
	const panel = document.getElementById('tutorialsPanel')
	if (!panel) return

	try {
		const overlay = ensureModalOverlay()
		overlay.style.display = 'block'
		setTimeout(() => overlay.classList.add('visible'), 10)
		document.documentElement.style.overflow = 'hidden'
	} catch (e) {}

	panel.style.display = 'flex'
	renderTutorials()
}

// Закрыть панель
function closeTutorials() {
	const panel = document.getElementById('tutorialsPanel')
	if (panel) panel.style.display = 'none'

	try {
		const overlay = document.getElementById('modalOverlay')
		if (overlay) {
			overlay.classList.remove('visible')
			setTimeout(() => {
				overlay.style.display = 'none'
			}, 220)
		}
	} catch (e) {}

	document.documentElement.style.overflow = ''
}

// Рендеринг туториалов
function renderTutorials() {
	const container = document.getElementById('tutorialsContent')
	if (!container) return

	// Фильтрация
	let filteredTutorials = [...tutorialsData]

	if (currentCategory !== 'all') {
		filteredTutorials = filteredTutorials.filter(
			t => t.category === currentCategory
		)
	}

	// Сортировка
	if (currentSort === 'duration') {
		filteredTutorials.sort((a, b) => {
			const timeA = parseDuration(a.duration)
			const timeB = parseDuration(b.duration)
			return timeA - timeB
		})
	} else if (currentSort === 'level') {
		const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 }
		filteredTutorials.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
	}

	// Группировка по категориям
	const categories = {}
	filteredTutorials.forEach(tutorial => {
		if (!categories[tutorial.category]) {
			categories[tutorial.category] = []
		}
		categories[tutorial.category].push(tutorial)
	})

	// Рендеринг
	if (filteredTutorials.length === 0) {
		container.innerHTML = `
            <div class="empty-state">
                <h3>Туториалы не найдены</h3>
                <p>Попробуйте выбрать другую категорию</p>
            </div>
        `
		return
	}

	let html = ''

	// Если выбрана конкретная категория, показываем без групп
	if (currentCategory !== 'all') {
		html += '<div class="tutorials-list">'
		filteredTutorials.forEach(tutorial => {
			html += generateTutorialCard(tutorial)
		})
		html += '</div>'
	} else {
		// Показываем по группам
		Object.entries(categories).forEach(([category, tutorials]) => {
			const categoryName = getCategoryName(category)
			html += `
                <div class="category-section">
                    <h3 class="category-title">${categoryName}</h3>
                    <div class="tutorials-list">
                        ${tutorials.map(generateTutorialCard).join('')}
                    </div>
                </div>
            `
		})
	}

	container.innerHTML = html
}

// Генерация карточки туториала
function generateTutorialCard(tutorial) {
	return `
        <div class="tutorial-card" data-video-id="${tutorial.videoId}">
            <div class="tutorial-card-header">
                <span class="tutorial-level ${tutorial.level}">
                    ${getLevelName(tutorial.level)}
                </span>
                <span class="tutorial-duration">
                    ⏱️ ${tutorial.duration}
                </span>
            </div>
            <div class="tutorial-thumb-container">
                <img class="tutorial-thumb" 
                     src="https://img.youtube.com/vi/${
												tutorial.videoId
											}/hqdefault.jpg" 
                     alt="${tutorial.title}">
                <div class="play-button"></div>
            </div>
            <div>
                <h3>${tutorial.title}</h3>
                <p>${tutorial.description}</p>
            </div>
            <div class="tutorial-footer">
                <div class="tutorial-actions">
                    <button onclick="openTutorial('${tutorial.videoId}', '${
		tutorial.title
	}')">
                        ▶ Открыть
                    </button>
                    <a class="open-new" 
                       href="https://www.youtube.com/watch?v=${
													tutorial.videoId
												}" 
                       target="_blank" 
                       rel="noopener">
                        🔗 YouTube
                    </a>
                </div>
            </div>
        </div>
    `
}

// Получение названия категории
function getCategoryName(category) {
	const names = {
		beginner: 'Для начинающих',
		graphics: 'Графика и анимация',
		advanced: 'Продвинутые темы',
		ui: 'Пользовательский интерфейс',
		physics: 'Физика и взаимодействия',
	}
	return names[category] || category
}

// Получение названия уровня
function getLevelName(level) {
	const names = {
		beginner: 'Начальный',
		intermediate: 'Средний',
		advanced: 'Продвинутый',
	}
	return names[level] || level
}

// Парсинг времени
function parseDuration(duration) {
	const parts = duration.split(':')
	if (parts.length === 2) {
		return parseInt(parts[0]) * 60 + parseInt(parts[1])
	}
	return 0
}

// Изменение категории
function changeCategory(category) {
	currentCategory = category
	renderTutorials()
}

// Изменение сортировки
function changeSort(sort) {
	currentSort = sort
	renderTutorials()
}

// Открытие туториала
function openTutorial(videoId, title) {
	// Построим iframe с автозапуском
	var container = document.getElementById('fullNewsContent')
	var embedUrl =
		'https://www.youtube.com/embed/' +
		encodeURIComponent(videoId) +
		'?autoplay=1&rel=0'
	var html = ''
	html +=
		'<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">'
	html +=
		'<iframe src="' +
		embedUrl +
		'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>'
	html += '</div>'
	html +=
		'<h3 style="margin-top:20px;color:var(--text);">' + (title || '') + '</h3>'
	html +=
		'<p style="margin-top:10px;"><a href="https://www.youtube.com/watch?v=' +
		encodeURIComponent(videoId) +
		'" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-weight:600;">▶ Открыть в YouTube</a></p>'

	container.innerHTML = html

	// Показать панель полной новости и скрыть панель туториалов
	var full = document.getElementById('fullNewsPanel')
	if (full) full.style.display = 'block'
	var tut = document.getElementById('tutorialsPanel')
	if (tut) tut.style.display = 'none'
}

// Закрыть панель полного просмотра видео
function closeFullNews() {
	var full = document.getElementById('fullNewsPanel')
	if (full) full.style.display = 'none'
	var container = document.getElementById('fullNewsContent')
	if (container) container.innerHTML = ''
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function () {
	// Добавляем обработчики для фильтров
	const categorySelect = document.getElementById('categoryFilter')
	const sortSelect = document.getElementById('sortFilter')

	if (categorySelect) {
		categorySelect.addEventListener('change', e =>
			changeCategory(e.target.value)
		)
	}

	if (sortSelect) {
		sortSelect.addEventListener('change', e => changeSort(e.target.value))
	}
})
