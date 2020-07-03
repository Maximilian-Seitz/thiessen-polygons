const plot = document.getElementById('plot')

const modeSelect = document.getElementById('mode')
const nextModeBtn = document.getElementById('nextMode')
const prevModeBtn = document.getElementById('prevMode')

const resetBtn = document.getElementById('reset')


const POINT_RADIUS = 6
const TRIANGLE_LINE_WIDTH = 1
const DIAGONAL_LENGTH = 20
const DIAGONAL_LINE_WIDTH = 3
const POLYGON_LINE_WIDTH = 2
const INFINITY_MULT = 10000000


let points = []
let neighbourhoods = []
let polygons = []


modeSelect.addEventListener('change', e => {
	update()
})

function getMode() {
	return modeSelect.value
}

prevModeBtn.addEventListener('click', e => {
	modeSelect.selectedIndex--

	if (modeSelect.selectedIndex < 0) {
		modeSelect.selectedIndex = 0
	}

	update()
})

nextModeBtn.addEventListener('click', e => {
	modeSelect.selectedIndex++

	if (modeSelect.selectedIndex < 0) {
		modeSelect.selectedIndex = modeSelect.length - 1
	}

	update()
})

resetBtn.addEventListener('click', e => {
	modeSelect.selectedIndex = 0
	points = []
	neighbourhoods = []
	update()
})

plot.addEventListener('click', e => {
	points.push([e.clientX, e.clientY])
	update()
})


function getPolygonLines(neighbourhood) {
	// Calculage polygon lines
	let lines = []

	for (neighbour of neighbourhood.neighbours) {
		lines.push({
			point: getMiddlePoint(neighbourhood.point, neighbour),
			angle: getAngleBetweenPoints(neighbourhood.point, neighbour) - Math.PI/2
		})
	}

	return lines
}

function getPolygon(neighbourhood) {
	let lines = getPolygonLines(neighbourhood, neighbourhood)

	// Sort lines (by angle)
	lines = lines.sort((lineA, lineB) => {
		return lineA.angle - lineB.angle
	})

	// Calculage polygon edge points
	let dataPoints = []
	for (let i = 0; i < lines.length; i++) {
		let lineA = lines[i]
		let lineB = lines[(i + 1) % lines.length]
		
		// Check if the two lines create an open or closed triangle
		if (angleBetween0And2Pi(lineB.angle - lineA.angle) < Math.PI) {
			// If the triangle is closed,
			// store the meeting point
			// (which represents a corner of the polygon)
			dataPoints.push(getOverlapPoint(lineA.point, lineA.angle, lineB.point, lineB.angle))
		} else {
			// If the triangle is open,
			// store the lines, since the polygon has an opening here,
			// and the lines represent the direction it goes into infinity
			dataPoints.push({
				lineA: lineA,
				lineB: lineB
			})
		}
	}

	return dataPoints
}

function getPolygons(neighbourhoods) {
	return neighbourhoods.map((neighbourhood) => {
		return getPolygon(neighbourhood)
	})
}

function getNeighbourhoods(points, triangles) {
	let neighbourhoods = points.map((point) => {
		return {
			point: point,
			neighbours: new Set()
		}
	})

	for (let i = 0; i < triangles.length; i += 3) {
		for (let j = 0; j < 3; j++) {
			let pointId = triangles[i + j]
			let otherPointAId = triangles[i + (j+1) % 3]
			let otherPointBId = triangles[i + (j+2) % 3]

			neighbourhoods[pointId].neighbours.add(points[otherPointAId])
			neighbourhoods[pointId].neighbours.add(points[otherPointBId])
		}
	}

	return neighbourhoods
}

function update() {
	let triangles = Delaunator.from(points).triangles
	
	neighbourhoods = getNeighbourhoods(points, triangles)

	polygons = getPolygons(neighbourhoods)

	plot.draw()
}


plot.onDraw = (ctx) => {
	let mode = getMode()

	if (mode.includes('polygons')) {
		for (polygon of polygons) {
			drawPolygon(ctx, polygon)
		}
	}

	if (mode.includes('triangles')) {
		for (neighbourhood of neighbourhoods) {
			drawConnections(ctx, neighbourhood)
		}
	}

	if (mode.includes('lines')) {
		for (neighbourhood of neighbourhoods) {
			drawDiagonals(ctx, neighbourhood)
		}
	}

	if (mode.includes('points')) {
		for (point of points) {
			ctx.drawPoint(point, POINT_RADIUS)
		}
	}
}

function drawConnections(ctx, neighbourhood) {
	for (neighbour of neighbourhood.neighbours) {
		let middlePoint = getMiddlePoint(neighbourhood.point, neighbour)
		ctx.drawLine(neighbourhood.point, middlePoint, TRIANGLE_LINE_WIDTH)
	}
}

function drawDiagonals(ctx, neighbourhood) {
	for (neighbour of neighbourhood.neighbours) {
		let middlePoint = getMiddlePoint(neighbourhood.point, neighbour)
		let angle = getAngleBetweenPoints(neighbourhood.point, neighbour) - Math.PI/2

		let directionVector = getDirectionVector(angle)
		let scaledDirectionVector = scaleVector(directionVector, DIAGONAL_LENGTH)
		
		let secondPoint = addVectors(middlePoint, scaledDirectionVector)

		ctx.drawLine(middlePoint, secondPoint, DIAGONAL_LINE_WIDTH)
	}
}

function drawPolygon(ctx, polygon) {
	// Construct polygon (from corners, and lines to infinity)
	let polygonPoints = []

	polygon.forEach((dataPoint) => {
		// Check if dataPoint is point
		if (isPoint(dataPoint)) {
			polygonPoints.push(dataPoint)
		} else {
			// DataPoint is two lines to infinity (open section of polygon)
			// Generate two points far outside the draw area
			let lineA = dataPoint.lineA
			polygonPoints.push(addVectors(lineA.point, scaleVector(getDirectionVector(lineA.angle + Math.PI), INFINITY_MULT)))

			let lineB = dataPoint.lineB
			polygonPoints.push(addVectors(lineB.point, scaleVector(getDirectionVector(lineB.angle), INFINITY_MULT)))
		}
	})

	ctx.drawPolygon(polygonPoints, POLYGON_LINE_WIDTH)
}