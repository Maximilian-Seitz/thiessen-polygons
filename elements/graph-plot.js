class Graph extends HTMLElement {
	
	#shadowRoot = this.attachShadow({mode: 'closed'})
	#canvas = document.createElement('canvas')
	#ctx = this.#canvas.getContext("2d")

	#drawHelper = {}

	constructor(onDraw) {
		super()

		this.#shadowRoot.appendChild(this.#canvas)

		new ResizeObserver(() => this.updateSize()).observe(this)

		this.onDraw = onDraw

		this.#drawHelper.drawPolygon = (polygon, lineWidth) => {
			if (polygon.length > 1) {
				let oldLineWidth = this.#ctx.lineWidth

				if (typeof lineWidth == 'number') {
					this.#ctx.lineWidth = lineWidth
				}

				this.#ctx.beginPath()
				
				let firstPoint = polygon[0]
				this.#ctx.moveTo(firstPoint[0], firstPoint[1])
				
				polygon.forEach((point) => {
					this.#ctx.lineTo(point[0], point[1])
				})

				this.#ctx.closePath()
				this.#ctx.stroke()

				this.#ctx.lineWidth = oldLineWidth
			}
		}

		this.#drawHelper.drawLine = (startPoint, endPoint, lineWidth) => {
			let oldLineWidth = this.#ctx.lineWidth

			if (typeof lineWidth == 'number') {
				this.#ctx.lineWidth = lineWidth
			}

			this.#ctx.beginPath()
			this.#ctx.moveTo(startPoint[0], startPoint[1])
			this.#ctx.lineTo(endPoint[0], endPoint[1])
			this.#ctx.stroke()

			this.#ctx.lineWidth = oldLineWidth
		}

		this.#drawHelper.drawPoint = (point, radius) => {
			this.#ctx.beginPath()
			this.#ctx.arc(point[0], point[1], radius, 0, 2 * Math.PI)
			this.#ctx.fill()
		}

		this.#drawHelper.drawText = (point, text, font) => {
			let oldFont = this.#ctx.font

			if (font) {
				this.#ctx.font = font
			}

			this.#ctx.fillText(text, point[0], point[1])

			this.#ctx.font = oldFont
		}
	}
	
	connectedCallback() {
		this.style.display = 'block'
		this.updateSize()
	}

	draw() {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

		if (typeof this.onDraw === 'function') {
			this.onDraw(this.#drawHelper)
		}
	}

	updateSize() {
		this.#canvas.width = this.clientWidth
		this.#canvas.height = this.clientHeight

		this.draw()
	}
}

customElements.define('graph-plot', Graph)