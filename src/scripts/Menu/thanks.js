/* ===============================
   thanks.js
================================= */

window.openThanks = function () {
	const panel = document.getElementById('thanksPanel')
	if (!panel) return

	const ov = document.getElementById('modalOverlay') || createOverlay() // Assuming createOverlay or manual check
	if (ov) {
		ov.style.display = 'block'
		setTimeout(() => ov.classList.add('visible'), 10)
	}
	document.documentElement.style.overflow = 'hidden'
	panel.style.display = 'block'
}

window.closeThanks = function () {
	const panel = document.getElementById('thanksPanel')
	if (!panel) return
	panel.style.display = 'none'

	const ov = document.getElementById('modalOverlay')
	if (ov) {
		ov.classList.remove('visible')
		setTimeout(() => (ov.style.display = 'none'), 220)
	}
	document.documentElement.style.overflow = ''
}

// Хелпер, если его нет в других файлах (безопасно дублировать такую мелочь)
function createOverlay() {
	const ov = document.createElement('div')
	ov.id = 'modalOverlay'
	ov.className = 'modal-overlay'
	document.body.appendChild(ov)
	return ov
}
