// ===== ЭЛЕМЕНТЫ и ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
	const uploadBtn = document.getElementById('uploadMusicBtn')
	const fileInput = document.getElementById('musicFileInput')

	const player = document.getElementById('musicPlayer')
	const playPauseBtn = document.getElementById('playPauseBtn')
	const currentTimeElem = document.getElementById('currentTime')
	const durationElem = document.getElementById('duration')
	const seekBar = document.getElementById('seekBar')
	const volumeBar = document.getElementById('volumeBar')

	// guard: if core controls are missing, skip attaching handlers
	if (!uploadBtn || !fileInput || !playPauseBtn) return

	// Аудио объект (local to this module)
	let audio = new Audio()
	audio.volume = 1

	// Make player hidden initially if exists
	if (player) player.style.display = player.style.display || 'none'

	// ===== ОТКРЫТИЕ ФАЙЛА =====
	uploadBtn.addEventListener('click', () => fileInput.click())

	fileInput.addEventListener('change', () => {
		const file = fileInput.files && fileInput.files[0]
		if (!file) return

		const url = URL.createObjectURL(file)
		audio.src = url
		audio.play().catch(() => {})

		if (player) player.style.display = 'flex'
		playPauseBtn.textContent = '⏸ Пауза'
	})

	// ===== ИГРА / ПАУЗА =====
	playPauseBtn.addEventListener('click', () => {
		if (audio.paused) {
			audio.play().catch(() => {})
			playPauseBtn.textContent = '⏸ Пауза'
		} else {
			audio.pause()
			playPauseBtn.textContent = '▶ Играть'
		}
	})

	// ===== ОБНОВЛЕНИЕ ПОЛЗУНКА =====
	audio.addEventListener('loadedmetadata', () => {
		if (seekBar) seekBar.max = audio.duration
		if (durationElem) durationElem.textContent = formatTime(audio.duration)
	})

	audio.addEventListener('timeupdate', () => {
		if (seekBar) seekBar.value = audio.currentTime
		if (currentTimeElem)
			currentTimeElem.textContent = formatTime(audio.currentTime)
	})

	// ===== ПЕРЕМОТКА =====
	if (seekBar) {
		// use input and pointer events for improved mobile responsiveness
		seekBar.addEventListener('input', () => {
			audio.currentTime = seekBar.value
		})
	}

	// ===== ГРОМКОСТЬ =====
	if (volumeBar) {
		volumeBar.addEventListener('input', () => {
			audio.volume = Math.max(0, Math.min(1, parseFloat(volumeBar.value)))
		})
	}

	// quick keyboard support: space toggles play/pause when focus on playPauseBtn
	playPauseBtn.addEventListener('keydown', e => {
		if (e.code === 'Space' || e.key === ' ') {
			e.preventDefault()
			playPauseBtn.click()
		}
	})

	// Expose a small API on the player element for other scripts if needed
	if (player) player._audio = audio
})

// ===== ФОРМАТ ВРЕМЕНИ =====
function formatTime(sec) {
	sec = Math.floor(sec || 0)
	let m = Math.floor(sec / 60)
	let s = sec % 60
	if (s < 10) s = '0' + s
	return `${m}:${s}`
}
