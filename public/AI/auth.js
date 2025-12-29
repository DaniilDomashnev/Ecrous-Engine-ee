// auth.js - Логика авторизации и приветствия

document.addEventListener('DOMContentLoaded', () => {
	const authOverlay = document.getElementById('auth-overlay')
	const nameInput = document.getElementById('auth-name-input')
	const startBtn = document.getElementById('auth-start-btn')
	const welcomeTitle = document.querySelector('#welcome-message h1') // Заголовок на главном экране

	// 1. Проверяем, есть ли имя в памяти
	const savedName = localStorage.getItem('tabby-user-name')

	if (savedName) {
		// Если имя есть, сразу скрываем экран и обновляем приветствие
		authOverlay.style.display = 'none'
		updateWelcomeMessage(savedName)
	} else {
		// Если имени нет, показываем экран (убираем класс hidden, если он был)
		authOverlay.classList.remove('hidden')
		nameInput.focus()
	}

	// 2. Обработчик кнопки "Начать"
	startBtn.addEventListener('click', saveNameAndStart)

	// 3. Обработчик нажатия Enter
	nameInput.addEventListener('keydown', e => {
		if (e.key === 'Enter') saveNameAndStart()
	})

	function saveNameAndStart() {
		const name = nameInput.value.trim()

		if (name) {
			// Сохраняем имя
			localStorage.setItem('tabby-user-name', name)

			// Обновляем приветствие на главном экране
			updateWelcomeMessage(name)

			// Красиво скрываем оверлей
			authOverlay.style.opacity = '0'
			authOverlay.style.transform = 'scale(1.1)' // Эффект приближения при исчезновении

			setTimeout(() => {
				authOverlay.style.display = 'none'
			}, 500) // Ждем окончания анимации CSS
		} else {
			// Трясем поле ввода, если пусто
			nameInput.style.borderColor = 'var(--danger)'
			nameInput.classList.add('shake')
			setTimeout(() => {
				nameInput.classList.remove('shake')
				nameInput.style.borderColor = 'var(--border-light)'
			}, 500)
		}
	}

	function updateWelcomeMessage(name) {
		if (welcomeTitle) {
			// Выбираем приветствие в зависимости от времени суток (опционально)
			const hour = new Date().getHours()
			let greeting = 'Привет'
			if (hour >= 6 && hour < 12) greeting = 'Доброе утро'
			else if (hour >= 12 && hour < 18) greeting = 'Добрый день'
			else if (hour >= 18 && hour < 23) greeting = 'Добрый вечер'

			welcomeTitle.innerHTML = `${greeting}, <span class="text-gradient">${name}</span>!<br>Что обсудим?`
		}
	}
})
