// Упрощённый загрузчик — использует только элементы, которые есть в index.html:
// #loading и .loading-progress
// Поведение:
// - при DOMContentLoaded запускается имитация прогресса
// - при window.load прогресс мгновенно завершается
// - через небольшой таймаут добавляется класс 'loaded' к body и скрывается #loading

window.addEventListener('DOMContentLoaded', () => {
	const loading = document.getElementById('loading')
	const progress = loading ? loading.querySelector('.loading-progress') : null

	// Если лоадер в разметке отсутствует — просто помечаем страницу как загруженную
	if (!loading) {
		document.body.classList.add('loaded')
		return
	}

	let value = 0
	let interval = null

	function setProgress(v) {
		value = Math.max(0, Math.min(100, v))
		if (progress) progress.style.width = value + '%'
	}

	function finish() {
		if (interval) clearInterval(interval)
		setProgress(100)
		// Небольшая задержка чтобы прогресс дойдёт до 100% и CSS-переходы сработали
		setTimeout(() => {
			document.body.classList.add('loaded')
			// Скрываем сам блок загрузки (оставим display:none, чтобы CSS не мешал)
			loading.style.display = 'none'
		}, 250)
	}

	// Медленный фейковый прогресс до 80-95%, докачается при финале
	interval = setInterval(() => {
		// Небольшая случайность, чтобы анимация выглядела естественнее
		const step = 2 + Math.random() * 6
		setProgress(Math.min(95, value + step))
	}, 80)

	// Если все ресурсы загрузились — завершаем
	window.addEventListener('load', finish, { once: true })

	// Защитный таймаут: если событие load не придёт (редкие случаи), завершаем через 3 секунды
	setTimeout(finish, 3000)
})
