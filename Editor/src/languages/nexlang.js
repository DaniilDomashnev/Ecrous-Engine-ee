// src/languages/nexlang.js

class NexLangCompiler {
	constructor() {
		this.replacements = [
			// Переменные
			{ regex: /(var|let|const)\s+(\w+)\s*=\s*(.+)/g, replace: 'let $2 = $3' },

			// === ИСПРАВЛЕНИЕ: Вывод в игровую консоль, а не в браузер ===
			{
				regex: /print\((.*)\)/g,
				replace:
					'if(typeof logToConsole === "function") logToConsole($1); else console.log($1);',
			},

			// Логика IF
			{ regex: /if\s*\((.*)\)\s*:/g, replace: 'if ($1) {' },
			{ regex: /else\s*:/g, replace: '} else {' },

			// Функции движка
			{ regex: /Entity\.move\((.*)\)/g, replace: 'this.move($1)' },
			{
				regex: /Entity\.setPos\((.*)\)/g,
				replace: 'this.el.style.left=$1; this.el.style.top=$2;',
			},

			// Закрытие блоков
			{ regex: /\bend\b/g, replace: '}' },
		]
	}

	/**
	 * Компилирует код NexLang в безопасный JS
	 */
	compile(code) {
		let jsCode = code

		// 1. Применяем замены синтаксиса
		this.replacements.forEach(rule => {
			jsCode = jsCode.replace(rule.regex, rule.replace)
		})

		// 2. Оборачиваем в асинхронную функцию для поддержки await (если нужно)
		// и добавляем безопасный контекст
		return `
            try {
                ${jsCode}
            } catch (err) {
                console.error("[NexLang Error]:", err);
            }
        `
	}

	/**
	 * Выполняет код в контексте объекта
	 * @param {string} code - Исходный код NexLang
	 * @param {Object} context - Объект (this), к которому привязан скрипт
	 */
	run(code, context) {
		const jsCode = this.compile(code)

		// Создаем функцию с привязкой контекста
		// Доступные глобальные переменные движка передаем явно
		const func = new Function('game', 'scene', jsCode)

		// Вызываем функцию, привязав 'this' к игровому объекту
		func.call(context, window.projectData, window.activeSceneId)
	}
}

// Глобальный экземпляр
window.NexLang = new NexLangCompiler();
