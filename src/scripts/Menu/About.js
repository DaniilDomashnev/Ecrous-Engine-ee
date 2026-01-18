/* ==========================================
   About.js
========================================== */

window.openAbout = function () {
	const panel = document.getElementById('aboutPanel')
	if (!panel) return
	document.documentElement.style.overflow = 'hidden'
	panel.style.display = 'flex'
	// Сброс анимации закрытия, если она была
	panel.style.animation =
		'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
}

window.closeAbout = function () {
	const panel = document.getElementById('aboutPanel')
	if (!panel) return

	panel.style.animation = 'fadeOut 0.3s forwards'
	setTimeout(() => {
		panel.style.display = 'none'
		panel.style.animation = ''
		document.documentElement.style.overflow = ''
	}, 300)
}

// CSS для fadeOut лучше добавить в main.css, но если нужно тут:
if (!document.getElementById('js-anim-styles')) {
	const styleSheet = document.createElement('style')
	styleSheet.id = 'js-anim-styles'
	styleSheet.innerText = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
    }`
	document.head.appendChild(styleSheet)
}
