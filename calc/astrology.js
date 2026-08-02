// ========================= Astrology =============================
//
// Geocentric ecliptic longitudes for the Sun, Moon and planets, from the
// classical orbital-element method (Paul Schlyter's formulation) including the
// standard perturbation terms for the Moon, Jupiter, Saturn and Uranus, plus
// the periodic series for Pluto.
//
// Accuracy: roughly 1-2 arcminutes for the Sun and Moon and a few arcminutes
// for the planets. Signs, degrees and aspects are far inside that margin.
// Pluto's series is only valid 1800-2100, which is flagged in the UI.

var astroMenuOpened = false

var astroSigns = [
	{ name: "Aries",       glyph: "♈", el: "Fire"  },
	{ name: "Taurus",      glyph: "♉", el: "Earth" },
	{ name: "Gemini",      glyph: "♊", el: "Air"   },
	{ name: "Cancer",      glyph: "♋", el: "Water" },
	{ name: "Leo",         glyph: "♌", el: "Fire"  },
	{ name: "Virgo",       glyph: "♍", el: "Earth" },
	{ name: "Libra",       glyph: "♎", el: "Air"   },
	{ name: "Scorpio",     glyph: "♏", el: "Water" },
	{ name: "Sagittarius", glyph: "♐", el: "Fire"  },
	{ name: "Capricorn",   glyph: "♑", el: "Earth" },
	{ name: "Aquarius",    glyph: "♒", el: "Air"   },
	{ name: "Pisces",      glyph: "♓", el: "Water" }
]

var astroBodies = [
	{ key: "sun",     name: "Sun",     glyph: "☉" },
	{ key: "moon",    name: "Moon",    glyph: "☽" },
	{ key: "mercury", name: "Mercury", glyph: "☿" },
	{ key: "venus",   name: "Venus",   glyph: "♀" },
	{ key: "mars",    name: "Mars",    glyph: "♂" },
	{ key: "jupiter", name: "Jupiter", glyph: "♃" },
	{ key: "saturn",  name: "Saturn",  glyph: "♄" },
	{ key: "uranus",  name: "Uranus",  glyph: "♅" },
	{ key: "neptune", name: "Neptune", glyph: "♆" },
	{ key: "pluto",   name: "Pluto",   glyph: "♇" }
]

// aspect angle, name, glyph and orb in degrees
var astroAspects = [
	{ ang: 0,   name: "Conjunction", glyph: "☌", orb: 8 },
	{ ang: 60,  name: "Sextile",     glyph: "⚹", orb: 4 },
	{ ang: 90,  name: "Square",      glyph: "□", orb: 6 },
	{ ang: 120, name: "Trine",       glyph: "△", orb: 6 },
	{ ang: 180, name: "Opposition",  glyph: "☍", orb: 8 }
]

// ---- maths helpers ----------------------------------------------------

var DEG = Math.PI / 180
function aSin(x) { return Math.sin(x * DEG) }
function aCos(x) { return Math.cos(x * DEG) }
function aRev(x) { return x - Math.floor(x / 360) * 360 } // normalise to 0-360
function aAtan2(y, x) { return aRev(Math.atan2(y, x) / DEG) }

// day number counted from 2000 Jan 0.0 TDT, with fractional UT hours
function astroDayNumber(y, m, D, ut) {
	var d = 367 * y
		- Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
		+ Math.floor(275 * m / 9) + D - 730530
	return d + ut / 24.0
}

// solve Kepler's equation, iterating for the eccentric orbits (Moon)
function astroEccentricAnomaly(M, e) {
	var E = M + (180 / Math.PI) * e * aSin(M) * (1 + e * aCos(M))
	if (e < 0.06) return E
	var E0, i = 0
	do {
		E0 = E
		E = E0 - (E0 - (180 / Math.PI) * e * aSin(E0) - M) / (1 - e * aCos(E0))
		i++
	} while (Math.abs(E - E0) > 0.0005 && i < 30)
	return E
}

// ---- element sets -----------------------------------------------------

function astroElements(body, d) {
	switch (body) {
		case "sun":     return { N: 0.0, i: 0.0, w: 282.9404 + 4.70935e-5 * d, a: 1.000000, e: 0.016709 - 1.151e-9 * d, M: 356.0470 + 0.9856002585 * d }
		case "moon":    return { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.054900, M: 115.3654 + 13.0649929509 * d }
		case "mercury": return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5.00e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d }
		case "venus":   return { N: 76.6799 + 2.46590e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.8910 + 1.38374e-5 * d, a: 0.723330, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d }
		case "mars":    return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d }
		case "jupiter": return { N: 100.4542 + 2.76854e-5 * d, i: 1.3030 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.8950 + 0.0830853001 * d }
		case "saturn":  return { N: 113.6634 + 2.38980e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.9670 + 0.0334442282 * d }
		case "uranus":  return { N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d }
		case "neptune": return { N: 131.7806 + 3.0173e-5 * d, i: 1.7700 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d }
	}
	return null
}

// heliocentric rectangular ecliptic coordinates
function astroHelio(body, d) {
	var o = astroElements(body, d)
	var M = aRev(o.M)
	var E = astroEccentricAnomaly(M, o.e)
	var xv = o.a * (aCos(E) - o.e)
	var yv = o.a * Math.sqrt(1 - o.e * o.e) * aSin(E)
	var v = aAtan2(yv, xv)
	var r = Math.sqrt(xv * xv + yv * yv)
	var l = v + o.w
	return {
		x: r * (aCos(o.N) * aCos(l) - aSin(o.N) * aSin(l) * aCos(o.i)),
		y: r * (aSin(o.N) * aCos(l) + aCos(o.N) * aSin(l) * aCos(o.i)),
		z: r * (aSin(l) * aSin(o.i)),
		r: r, v: v, N: o.N, w: o.w, i: o.i, M: M
	}
}

function astroSunRect(d) {
	var o = astroElements("sun", d)
	var M = aRev(o.M)
	var E = astroEccentricAnomaly(M, o.e)
	var xv = aCos(E) - o.e
	var yv = Math.sqrt(1 - o.e * o.e) * aSin(E)
	var v = aAtan2(yv, xv)
	var r = Math.sqrt(xv * xv + yv * yv)
	var lon = aRev(v + o.w)
	return { x: r * aCos(lon), y: r * aSin(lon), r: r, lon: lon, M: M, w: o.w }
}

// geocentric ecliptic longitude of one body, degrees 0-360
function astroLongitude(body, d) {

	if (body === "sun") return astroSunRect(d).lon

	if (body === "moon") {
		var o = astroElements("moon", d)
		var Mm = aRev(o.M), Nm = aRev(o.N), wm = aRev(o.w)
		var E = astroEccentricAnomaly(Mm, o.e)
		var xv = o.a * (aCos(E) - o.e)
		var yv = o.a * Math.sqrt(1 - o.e * o.e) * aSin(E)
		var v = aAtan2(yv, xv)
		var r = Math.sqrt(xv * xv + yv * yv)
		var l = v + wm
		var xh = r * (aCos(Nm) * aCos(l) - aSin(Nm) * aSin(l) * aCos(o.i))
		var yh = r * (aSin(Nm) * aCos(l) + aCos(Nm) * aSin(l) * aCos(o.i))
		var lon = aAtan2(yh, xh)

		// perturbations: without these the Moon can be off by half a degree
		var sun = astroSunRect(d)
		var Ms = sun.M
		var Ls = aRev(Ms + sun.w)
		var Lm = aRev(Mm + wm + Nm)
		var Dm = aRev(Lm - Ls)          // mean elongation
		var F = aRev(Lm - Nm)           // argument of latitude

		lon += -1.274 * aSin(Mm - 2 * Dm)      // evection
		lon += +0.658 * aSin(2 * Dm)           // variation
		lon += -0.186 * aSin(Ms)               // yearly equation
		lon += -0.059 * aSin(2 * Mm - 2 * Dm)
		lon += -0.057 * aSin(Mm - 2 * Dm + Ms)
		lon += +0.053 * aSin(Mm + 2 * Dm)
		lon += +0.046 * aSin(2 * Dm - Ms)
		lon += +0.041 * aSin(Mm - Ms)
		lon += -0.035 * aSin(Dm)               // parallactic equation
		lon += -0.031 * aSin(Mm + Ms)
		lon += -0.015 * aSin(2 * F - 2 * Dm)
		lon += +0.011 * aSin(Mm - 4 * Dm)
		return aRev(lon)
	}

	if (body === "pluto") {
		// periodic series, heliocentric; only valid roughly 1800-2100
		var S = 50.03 + 0.033459652 * d
		var P = 238.95 + 0.003968789 * d
		var lonecl = 238.9508 + 0.00400703 * d
			- 19.799 * aSin(P) + 19.848 * aCos(P)
			+ 0.897 * aSin(2 * P) - 4.956 * aCos(2 * P)
			+ 0.610 * aSin(3 * P) + 1.211 * aCos(3 * P)
			- 0.341 * aSin(4 * P) - 0.190 * aCos(4 * P)
			+ 0.128 * aSin(5 * P) - 0.034 * aCos(5 * P)
			- 0.038 * aSin(6 * P) + 0.031 * aCos(6 * P)
			+ 0.020 * aSin(P - S) - 0.010 * aCos(P - S)
		var latecl = -3.9082
			- 5.453 * aSin(P) - 14.975 * aCos(P)
			+ 3.527 * aSin(2 * P) + 1.673 * aCos(2 * P)
			- 1.051 * aSin(3 * P) + 0.328 * aCos(3 * P)
			+ 0.179 * aSin(4 * P) - 0.292 * aCos(4 * P)
			+ 0.019 * aSin(5 * P) + 0.100 * aCos(5 * P)
			- 0.031 * aSin(6 * P) - 0.026 * aCos(6 * P)
			+ 0.011 * aCos(P - S)
		var rp = 40.72
			+ 6.68 * aSin(P) + 6.90 * aCos(P)
			- 1.18 * aSin(2 * P) - 0.03 * aCos(2 * P)
			+ 0.15 * aSin(3 * P) - 0.14 * aCos(3 * P)

		var xh = rp * aCos(lonecl) * aCos(latecl)
		var yh = rp * aSin(lonecl) * aCos(latecl)
		var s = astroSunRect(d)
		return aAtan2(yh + s.y, xh + s.x)
	}

	// remaining planets: heliocentric, then shifted to geocentric
	var p = astroHelio(body, d)
	var lonH = aAtan2(p.y, p.x)
	var latH = aAtan2(p.z, Math.sqrt(p.x * p.x + p.y * p.y))
	var rH = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)

	// giant-planet perturbations
	if (body === "jupiter" || body === "saturn" || body === "uranus") {
		var Mj = aRev(astroElements("jupiter", d).M)
		var Msa = aRev(astroElements("saturn", d).M)
		var Mu = aRev(astroElements("uranus", d).M)
		if (body === "jupiter") {
			lonH += -0.332 * aSin(2 * Mj - 5 * Msa - 67.6)
			lonH += -0.056 * aSin(2 * Mj - 2 * Msa + 21)
			lonH += +0.042 * aSin(3 * Mj - 5 * Msa + 21)
			lonH += -0.036 * aSin(Mj - 2 * Msa)
			lonH += +0.022 * aCos(Mj - Msa)
			lonH += +0.023 * aSin(2 * Mj - 3 * Msa + 52)
			lonH += -0.016 * aSin(Mj - 5 * Msa - 69)
		} else if (body === "saturn") {
			lonH += +0.812 * aSin(2 * Mj - 5 * Msa - 67.6)
			lonH += -0.229 * aCos(2 * Mj - 4 * Msa - 2)
			lonH += +0.119 * aSin(Mj - 2 * Msa - 3)
			lonH += +0.046 * aSin(2 * Mj - 6 * Msa - 69)
			lonH += +0.014 * aSin(Mj - 3 * Msa + 32)
			latH += -0.020 * aCos(2 * Mj - 4 * Msa - 2)
			latH += +0.018 * aSin(2 * Mj - 6 * Msa - 49)
		} else {
			lonH += +0.040 * aSin(Msa - 2 * Mu + 6)
			lonH += +0.035 * aSin(Msa - 3 * Mu + 33)
			lonH += -0.015 * aSin(Mj - Mu + 20)
		}
	}

	var xh2 = rH * aCos(lonH) * aCos(latH)
	var yh2 = rH * aSin(lonH) * aCos(latH)
	var sun2 = astroSunRect(d)
	return aAtan2(yh2 + sun2.y, xh2 + sun2.x)
}

// ---- chart assembly ---------------------------------------------------

function astroSignOf(lon) {
	var idx = Math.floor(aRev(lon) / 30)
	var within = aRev(lon) - idx * 30
	var deg = Math.floor(within)
	var min = Math.floor((within - deg) * 60)
	return { idx: idx, sign: astroSigns[idx], deg: deg, min: min, within: within }
}

function astroMoonPhase(sunLon, moonLon) {
	var elong = aRev(moonLon - sunLon)
	var illum = (1 - aCos(elong)) / 2 // 0 new, 1 full
	var name
	if (elong < 22.5 || elong >= 337.5) name = "New Moon"
	else if (elong < 67.5) name = "Waxing Crescent"
	else if (elong < 112.5) name = "First Quarter"
	else if (elong < 157.5) name = "Waxing Gibbous"
	else if (elong < 202.5) name = "Full Moon"
	else if (elong < 247.5) name = "Waning Gibbous"
	else if (elong < 292.5) name = "Last Quarter"
	else name = "Waning Crescent"
	return { name: name, elong: elong, illum: illum }
}

// full chart for a UTC moment
function astroChart(y, m, D, ut) {
	var d = astroDayNumber(y, m, D, ut)
	var step = 0.5 // half a day, enough to see direction of motion
	var out = { d: d, bodies: [], aspects: [], plutoOutOfRange: (y < 1800 || y > 2100) }

	for (var i = 0; i < astroBodies.length; i++) {
		var b = astroBodies[i]
		var lon = astroLongitude(b.key, d)
		var lonNext = astroLongitude(b.key, d + step)
		var motion = aRev(lonNext - lon)
		if (motion > 180) motion -= 360 // signed daily motion
		var s = astroSignOf(lon)
		out.bodies.push({
			key: b.key, name: b.name, glyph: b.glyph,
			lon: lon, sign: s.sign, signIdx: s.idx, deg: s.deg, min: s.min,
			retro: (motion < 0), speed: motion / step
		})
	}

	out.phase = astroMoonPhase(out.bodies[0].lon, out.bodies[1].lon)

	// aspect grid
	for (var a = 0; a < out.bodies.length; a++) {
		for (var b2 = a + 1; b2 < out.bodies.length; b2++) {
			var sep = Math.abs(aRev(out.bodies[a].lon - out.bodies[b2].lon))
			if (sep > 180) sep = 360 - sep
			for (var k = 0; k < astroAspects.length; k++) {
				var asp = astroAspects[k]
				var delta = Math.abs(sep - asp.ang)
				if (delta <= asp.orb) {
					out.aspects.push({
						a: out.bodies[a], b: out.bodies[b2],
						aspect: asp, orb: delta, exact: (delta < 1)
					})
					break
				}
			}
		}
	}
	out.aspects.sort(function (x, y2) { return x.orb - y2.orb })
	return out
}

// ---- UI ---------------------------------------------------------------

// send a planet or sign name into the phrase box so it runs through the ciphers
function astroSendToPhraseBox(txt) {
	var box = document.getElementById("phraseBox")
	if (box === null) return
	box.value = txt
	updateEnabledCipherTable()
	updateWordBreakdown(breakCipher, false, false)
	box.focus()
}

function astroPad(n) { return (n < 10 ? "0" : "") + n }

function astroReadInputs() {
	var g = function (id, fb) {
		var el = document.getElementById(id)
		if (el === null || el.value === "") return fb
		var v = Number(el.value)
		return isNaN(v) ? fb : v
	}
	var now = new Date()
	return {
		y: g("astroY", now.getUTCFullYear()),
		m: g("astroM", now.getUTCMonth() + 1),
		d: g("astroD", now.getUTCDate()),
		hh: g("astroHH", now.getUTCHours()),
		mm: g("astroMM", now.getUTCMinutes())
	}
}

function astroSetNow() {
	var n = new Date()
	document.getElementById("astroY").value = n.getUTCFullYear()
	document.getElementById("astroM").value = n.getUTCMonth() + 1
	document.getElementById("astroD").value = n.getUTCDate()
	document.getElementById("astroHH").value = n.getUTCHours()
	document.getElementById("astroMM").value = n.getUTCMinutes()
	updateAstroChart()
}

function updateAstroChart() {
	var spot = document.getElementById("astroResults")
	if (spot === null) return

	var v = astroReadInputs()
	var chart = astroChart(v.y, v.m, v.d, v.hh + v.mm / 60)

	var o = ""

	// positions
	o += '<table class="astroTable"><tbody>'
	o += '<tr class="astroHeadRow"><td>Body</td><td>Position</td><td>Sign</td><td>Element</td><td>Motion</td></tr>'
	for (var i = 0; i < chart.bodies.length; i++) {
		var b = chart.bodies[i]
		var col = astroSignColor(b.signIdx)
		o += '<tr>'
		o += '<td class="astroBody" onclick="astroSendToPhraseBox(&quot;'+b.name+'&quot;)" title="Send &quot;'+b.name+'&quot; to the phrase box">'
		o += '<span class="astroGlyph">'+b.glyph+'</span>'+b.name+'</td>'
		o += '<td class="astroDeg">'+astroPad(b.deg)+'&deg; '+astroPad(b.min)+"'"+'</td>'
		o += '<td class="astroSign" style="color: '+col+';" onclick="astroSendToPhraseBox(&quot;'+b.sign.name+'&quot;)" title="Send &quot;'+b.sign.name+'&quot; to the phrase box">'
		o += '<span class="astroGlyph">'+b.sign.glyph+'</span>'+b.sign.name+'</td>'
		o += '<td class="astroEl">'+b.sign.el+'</td>'
		o += '<td class="astroMotion">'+(b.retro ? '<span class="astroRetro">Rx</span>' : '&mdash;')+'</td>'
		o += '</tr>'
	}
	o += '</tbody></table>'

	// moon phase
	o += '<div class="astroPhase">'
	o += '<span class="astroPhaseName" onclick="astroSendToPhraseBox(&quot;'+chart.phase.name+'&quot;)">'+chart.phase.name+'</span>'
	o += '<span class="astroPhaseNum">'+(chart.phase.illum * 100).toFixed(1)+'% illuminated</span>'
	// an exact new moon lands on 359.99..., which would print as "360.00"
	var elongDisp = (chart.phase.elong >= 359.995) ? 0 : chart.phase.elong
	o += '<span class="astroPhaseNum">'+elongDisp.toFixed(2)+'&deg; from Sun</span>'
	o += '</div>'

	// aspects
	o += '<div class="astroStep">Aspects</div>'
	if (chart.aspects.length === 0) {
		o += '<div class="astroNote">No aspects within orb at this moment.</div>'
	} else {
		o += '<table class="astroTable"><tbody>'
		o += '<tr class="astroHeadRow"><td>Between</td><td>Aspect</td><td>Orb</td></tr>'
		for (var k = 0; k < chart.aspects.length; k++) {
			var asp = chart.aspects[k]
			o += '<tr'+(asp.exact ? ' class="astroExact"' : '')+'>'
			o += '<td class="astroBody">'+asp.a.glyph+' '+asp.a.name+' &nbsp;'+asp.b.glyph+' '+asp.b.name+'</td>'
			o += '<td class="astroAspName" onclick="astroSendToPhraseBox(&quot;'+asp.aspect.name+'&quot;)" title="Send &quot;'+asp.aspect.name+'&quot; to the phrase box">'
			o += '<span class="astroGlyph">'+asp.aspect.glyph+'</span>'+asp.aspect.name+'</td>'
			o += '<td class="astroDeg">'+asp.orb.toFixed(2)+'&deg;</td>'
			o += '</tr>'
		}
		o += '</tbody></table>'
	}

	if (chart.plutoOutOfRange) {
		o += '<div class="astroNote astroWarn">Pluto’s series is only accurate between 1800 and 2100; its position above is unreliable for this date.</div>'
	}

	spot.innerHTML = o
}

// tint each sign by element so the table scans quickly
function astroSignColor(idx) {
	var el = astroSigns[idx].el
	if (el === "Fire") return "hsl(10 70% 66%)"
	if (el === "Earth") return "hsl(95 45% 60%)"
	if (el === "Air") return "hsl(50 75% 66%)"
	return "hsl(205 70% 68%)" // Water
}

function toggleAstroMenu() {
	if (!astroMenuOpened) {
		closeAllOpenedMenus()
		astroMenuOpened = true

		var n = new Date()
		var o = '<div class="colorControlsBG astroBG">'
		o += '<input class="closeMenuBtn" type="button" value="&#215;" onclick="closeAllOpenedMenus()">'

		o += '<div class="astroIntro">Geocentric positions for any moment in <b>UTC</b>. Click any planet, sign or aspect name to send it to the phrase box and run it through your ciphers.</div>'

		o += '<div class="astroStep">Date &amp; time (UTC)</div>'
		o += '<table class="astroInputTable"><tbody><tr>'
		o += '<td><span class="colLabelSmall">Year</span><input type="number" id="astroY" class="astroInput" value="'+n.getUTCFullYear()+'" oninput="updateAstroChart()"></td>'
		o += '<td><span class="colLabelSmall">Month</span><input type="number" min="1" max="12" id="astroM" class="astroInput" value="'+(n.getUTCMonth()+1)+'" oninput="updateAstroChart()"></td>'
		o += '<td><span class="colLabelSmall">Day</span><input type="number" min="1" max="31" id="astroD" class="astroInput" value="'+n.getUTCDate()+'" oninput="updateAstroChart()"></td>'
		o += '<td><span class="colLabelSmall">Hour</span><input type="number" min="0" max="23" id="astroHH" class="astroInput" value="'+n.getUTCHours()+'" oninput="updateAstroChart()"></td>'
		o += '<td><span class="colLabelSmall">Min</span><input type="number" min="0" max="59" id="astroMM" class="astroInput" value="'+n.getUTCMinutes()+'" oninput="updateAstroChart()"></td>'
		o += '<td><input class="intBtn3" type="button" value="Now" style="width: auto; margin-left: 0.6em;" onclick="astroSetNow()"></td>'
		o += '</tr></tbody></table>'

		o += '<div class="astroStep">Positions</div>'
		o += '<div id="astroResults"></div>'

		o += '</div>'

		document.getElementById("astroMenuArea").innerHTML = o
		updateAstroChart()
	} else {
		document.getElementById("astroMenuArea").innerHTML = ""
		astroMenuOpened = false
	}
}
