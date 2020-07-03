function degToRad(deg) {
	return deg * Math.PI / 180
}

function radToDeg(rad) {
	return rad * 180 / Math.PI
}

function angleBetween0And2Pi(rad) {
	return (rad + 2*Math.PI) % (2*Math.PI)
}

function angleIsZero(rad) {
	return rad == 0 || rad == Math.PI
}

function angleCanBeRepresentedAsFraction(rad) {
	return angleBetween0And2Pi(rad) != Math.PI/2 &&
		angleBetween0And2Pi(rad) != 3*Math.PI/2
}

function isVector(v) {
	return Array.isArray(v) &&
		v.length == 2 &&
		typeof v[0] == 'number' &&
		typeof v[1] == 'number'
}

function isPoint(p) {
	return isVector(p)
}

function turnVector(v, rad) {
	let c = Math.cos(rad)
	let s = Math.sin(rad)

	return [
		v[0]*c - v[1]*s,
		v[0]*s + v[1]*c
	]
}

function turnVectorDeg(v, deg) {
	return turnVector(v, degToRad(deg))
}

function scaleVector(v, mult) {
	return [
		v[0] * mult,
		v[1] * mult
	]
}

function addVectors(v1, v2) {
	return [
		v1[0] + v2[0],
		v1[1] + v2[1]
	]
}

function getMiddlePoint(p1, p2) {
	return [
		(p1[0] + p2[0]) / 2,
		(p1[1] + p2[1]) / 2
	]
}

function getAngleBetweenPoints(p1, p2) {
	return Math.atan2(
		p2[1] - p1[1],
		p2[0] - p1[0]
	)
}

function getDirectionVector(rad) {
	return [
		Math.cos(rad),
		Math.sin(rad)
	]
}

function getDirectionVectorDeg(deg) {
	return getDirectionVector(degToRad(deg))
}

// Gives the point where two lines meet.
// Fails if the lines are parallel.
function getOverlapPoint(pointA, angleA, pointB, angleB) {
	let x = 0
	let y = 0

	if (angleA == angleB) {
		throw "Parallel lines never meet."
	}

	if (!angleCanBeRepresentedAsFraction(angleA)) {
		let mB = Math.tan(angleB)
		let tB = pointB[1] - mB*pointB[0]
		x = pointA[0]
		y = tB + mB*x
	} else if (!angleCanBeRepresentedAsFraction(angleB)) {
		let mA = Math.tan(angleA)
		let tA = pointA[1] - mA*pointA[0]
		x = pointB[0]
		y = tA + mA*x
	} else {
		let mA = Math.tan(angleA)
		let mB = Math.tan(angleB)
		let tA = pointA[1] - mA*pointA[0]
		let tB = pointB[1] - mB*pointB[0]
		x = (tA - tB) / (mB - mA)
		y = tA + mA*x
	}

	return [x, y]
}