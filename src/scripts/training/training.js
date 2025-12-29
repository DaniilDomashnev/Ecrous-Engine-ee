// training.js — Логика туториала (ES6, модульный код)

// Массив шагов туториала (все тексты на русском)
const steps = [
	{
		target: null, // Нет подсветки для приветствия
		title: 'Добро пожаловать в Ecrous Engine!',
		text: 'Это ваш первый визит. Давайте проведём быстрый обзор интерфейса.',
	},
	{
		target: '.title',
		title: 'Заголовок движка',
		text: 'Это основной заголовок Ecrous Engine.',
	},
	{
		target: '.side-panel button:nth-child(1)', // My Projects
		title: 'Мои Проекты',
		text: 'Нажмите здесь, чтобы открыть ваши личные проекты.',
	},
	{
		target: '.side-panel button:nth-child(2)', // Community
		title: 'Community',
		text: 'Перейдите в раздел сообщества для общего контента.',
	},
	{
		target: '.side-panel button:nth-child(5)', // Profile
		title: 'Профиль',
		text: 'Управляйте профилем и настройками здесь.',
	},
	{
		target: '.side-panel button:nth-child(6)', // Thanks
		title: 'Благодарности',
		text: 'Просмотрите благодарности и кредиты.',
	},
	{
		target: '.social-links',
		title: 'Социальные сети',
		text: 'Свяжитесь с нами в социальных сетях.',
	},
	{
		target: '.ButtonsMenuSmall',
		title: 'Быстрое меню',
		text: 'Быстрый доступ к туториалам, достижениям, новостям и настройкам.',
	},
	{
		target: null, // Финальный шаг
		title: 'Готово!',
		text: 'Вы готовы. Наслаждайтесь созданием в Ecrous Engine!',
	},
]

let currentStep = 0
let overlay, tooltip, highlight

// Проверка и запуск туториала при загрузке
window.addEventListener('DOMContentLoaded', () => {
	if (!localStorage.getItem('tutorialCompleted')) {
		initTutorial()
	}
})

// Инициализация элементов туториала
function initTutorial() {
	// Проверка на существование (безопасность)
	if (!document.body) return

	// Создаем overlay
	overlay = document.createElement('div')
	overlay.classList.add('tutorial-overlay')
	document.body.appendChild(overlay)

	// Создаем tooltip
	tooltip = document.createElement('div')
	tooltip.classList.add('tutorial-tooltip')
	tooltip.innerHTML = `
        <h2></h2>
        <p></p>
        <div class="tutorial-buttons"></div>
        <button class="tutorial-btn tutorial-btn-skip">Пропустить обучение</button>
    `
	document.body.appendChild(tooltip)

	// Создаем highlight
	highlight = document.createElement('div')
	highlight.classList.add('tutorial-highlight')
	document.body.appendChild(highlight)

	// Обработчики кнопок
	tooltip
		.querySelector('.tutorial-btn-skip')
		.addEventListener('click', completeTutorial)
	overlay.addEventListener('click', e => {
		if (e.target === overlay) return // Игнор кликов вне тултипа
	})

	// Показываем первый шаг
	showStep(currentStep)
}

// Показ шага
function showStep(stepIndex) {
	const step = steps[stepIndex]
	const buttonsContainer = tooltip.querySelector('.tutorial-buttons')
	buttonsContainer.innerHTML = '' // Очищаем кнопки

	// Обновляем контент (на русском)
	tooltip.querySelector('h2').textContent = step.title
	tooltip.querySelector('p').textContent = step.text

	// Кнопки навигации (на русском)
	if (stepIndex > 0) {
		const prevBtn = document.createElement('button')
		prevBtn.classList.add('tutorial-btn', 'tutorial-btn-prev')
		prevBtn.textContent = 'Назад'
		prevBtn.addEventListener('click', () => navigateStep(-1))
		buttonsContainer.appendChild(prevBtn)
	}

	if (stepIndex < steps.length - 1) {
		const nextBtn = document.createElement('button')
		nextBtn.classList.add('tutorial-btn', 'tutorial-btn-next')
		nextBtn.textContent = 'Далее'
		nextBtn.addEventListener('click', () => navigateStep(1))
		buttonsContainer.appendChild(nextBtn)
	} else {
		const doneBtn = document.createElement('button')
		doneBtn.classList.add('tutorial-btn', 'tutorial-btn-next')
		doneBtn.textContent = 'Завершить'
		doneBtn.addEventListener('click', completeTutorial)
		buttonsContainer.appendChild(doneBtn)
	}

	// Активируем overlay
	overlay.classList.add('active')

	// Подсветка
	if (step.target) {
		const targetElement = document.querySelector(step.target)
		if (targetElement) {
			const rect = targetElement.getBoundingClientRect()
			highlight.style.width = `${Math.min(
				rect.width + 20,
				window.innerWidth - 20
			)}px` // Ограничение по экрану
			highlight.style.height = `${Math.min(
				rect.height + 20,
				window.innerHeight - 20
			)}px`
			highlight.style.top = `${Math.max(10, rect.top - 10)}px` // Не выходит за топ
			highlight.style.left = `${Math.max(10, rect.left - 10)}px` // Не выходит за левый край
			highlight.classList.add('visible')
		}
	} else {
		highlight.classList.remove('visible')
	}

	// Позиционируем тултип (адаптивно)
	positionTooltip(step.target)

	// Анимация появления (fade + slide + scale)
	setTimeout(() => {
		tooltip.classList.add('visible')
	}, 100)
}

// Навигация по шагам
function navigateStep(direction) {
	currentStep += direction
	currentStep = Math.max(0, Math.min(steps.length - 1, currentStep))
	tooltip.classList.remove('visible')
	highlight.classList.remove('visible')
	setTimeout(() => showStep(currentStep), 300) // Задержка для анимации
}

// Позиционирование тултипа (не выходит за экран)
function positionTooltip(targetSelector) {
	if (window.innerWidth <= 768) {
		// Мобильный: фиксировано снизу, центрировано
		tooltip.style.top = 'auto'
		tooltip.style.left = '50%'
		tooltip.style.bottom = '20px'
		tooltip.style.transform = 'translateX(-50%)'
	} else {
		// Десктоп: рядом с target, но с проверкой границ
		if (targetSelector) {
			const target = document.querySelector(targetSelector)
			const rect = target.getBoundingClientRect()
			let top = rect.top + rect.height + 20
			let left = rect.left

			// Проверка границ
			if (top + 200 > window.innerHeight) top = rect.top - 200 // Перемещаем вверх если не помещается
			if (left + 320 > window.innerWidth) left = window.innerWidth - 340 // Сдвигаем влево

			tooltip.style.top = `${top}px`
			tooltip.style.left = `${left}px`
			tooltip.style.transform = 'none'
		} else {
			// Центр если нет target
			tooltip.style.top = '50%'
			tooltip.style.left = '50%'
			tooltip.style.transform = 'translate(-50%, -50%)'
		}
	}
}

// Завершение туториала
function completeTutorial() {
	localStorage.setItem('tutorialCompleted', 'true')
	overlay.classList.remove('active')
	tooltip.classList.remove('visible')
	highlight.classList.remove('visible')
	setTimeout(() => {
		if (overlay) document.body.removeChild(overlay)
		if (tooltip) document.body.removeChild(tooltip)
		if (highlight) document.body.removeChild(highlight)
		overlay = null
		tooltip = null
		highlight = null
	}, 300)
}

// Публичная функция для сброса и повторного запуска туториала (без перезагрузки страницы)
window.resetAndStartTraining = function () {
	// Защита от повторного запуска поверх активного туториала
	if (overlay && overlay.classList.contains('active')) {
		return // Уже запущен, игнорируем
	}

	// Сброс состояния в localStorage
	localStorage.removeItem('tutorialCompleted')

	// Сброс текущего шага
	currentStep = 0

	// Если элементы туториала уже существуют (например, от предыдущего запуска), удаляем их для чистого перезапуска
	if (overlay) {
		overlay.classList.remove('active')
		document.body.removeChild(overlay)
		overlay = null
	}
	if (tooltip) {
		tooltip.classList.remove('visible')
		document.body.removeChild(tooltip)
		tooltip = null
	}
	if (highlight) {
		highlight.classList.remove('visible')
		document.body.removeChild(highlight)
		highlight = null
	}

	// Запуск туториала заново (с плавной анимацией от initTutorial)
	initTutorial()
}
