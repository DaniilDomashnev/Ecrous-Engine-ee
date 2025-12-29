/* ===============================
      СИСТЕМА УРОВНЕЙ
================================= */

const LEVEL_CONFIG = {
	baseXP: 100, // XP для 1 уровня
	growth: 1.35, // Рост XP для каждого следующего уровня (1.35 = +35%)
	timeXP: 1, // XP каждые N секунд
	timeInterval: 10, // Каждые 10 секунд = +1 XP
}

let playerData = {
	level: 1,
	xp: 0,
	xpToNext: LEVEL_CONFIG.baseXP,
}

/* === Загрузка данных === */
function loadLevelData() {
	const saved = localStorage.getItem('playerLevelData')
	if (saved) {
		playerData = JSON.parse(saved)
	}
}

/* === Сохранение данных === */
function saveLevelData() {
	localStorage.setItem('playerLevelData', JSON.stringify(playerData))
}

/* === Вычисление XP для следующего уровня === */
function calculateXpToNext(level) {
	return Math.floor(
		LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.growth, level - 1)
	)
}

/* === Добавление XP === */
function addXP(amount) {
	playerData.xp += amount

	while (playerData.xp >= playerData.xpToNext) {
		playerData.xp -= playerData.xpToNext
		playerData.level++
		playerData.xpToNext = calculateXpToNext(playerData.level)
	}

	saveLevelData()
	updateUI()
}

/* === XP за время на сайте === */
function startTimeXP() {
	setInterval(() => {
		addXP(LEVEL_CONFIG.timeXP)
	}, LEVEL_CONFIG.timeInterval * 1000)
}

/* === Обновление UI === */
function updateUI() {
	const badge = document.querySelector('.level-badge')
	const text = document.querySelector('.level-text')
	const bar = document.querySelector('.level-progress')

	// Defensive checks: if elements are missing don't throw
	if (!badge || !text || !bar) return

	badge.textContent = playerData.level
	text.textContent = `Уровень ${playerData.level} • ${playerData.xp} / ${playerData.xpToNext} XP`

	// Ensure we use the correct xpToNext property and avoid divide-by-zero
	const xpToNext =
		playerData.xpToNext || calculateXpToNext(playerData.level) || 1
	let progress = (playerData.xp / xpToNext) * 100
	// clamp to [0,100]
	progress = Math.max(0, Math.min(100, progress))

	bar.style.width = progress + '%'
	// accessibility: expose progress via ARIA
	bar.setAttribute('role', 'progressbar')
	bar.setAttribute('aria-valuemin', '0')
	bar.setAttribute('aria-valuemax', '100')
	bar.setAttribute('aria-valuenow', Math.round(progress))
}

/* === Старт системы === */
window.addEventListener('load', () => {
	loadLevelData()
	updateUI()
	startTimeXP()
})
