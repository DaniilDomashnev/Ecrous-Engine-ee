function openThanks() {
	const panel = document.getElementById('thanksPanel')
	if (!panel) return

	try {
		const overlay = ensureModalOverlay()
		overlay.style.display = 'block'
		setTimeout(() => overlay.classList.add('visible'), 10)
		document.documentElement.style.overflow = 'hidden'
	} catch (e) {}

	panel.style.display = 'block'
}

function closeThanks() {
	const panel = document.getElementById('thanksPanel')
	if (!panel) return
	panel.style.display = 'none'

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
