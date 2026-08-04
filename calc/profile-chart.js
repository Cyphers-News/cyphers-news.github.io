// ==================== Birth charts in the Profile ====================
//
// A self-contained chart tab: the birth details, the zodiac to read them in,
// the wheel, the planet list and today's transits, all in one place. It does
// not borrow the Astrology tab's inputs - reaching into another panel's DOM
// meant the tab only worked when that panel happened to be open, which is why
// saving quietly did nothing.
//
// Positions come from astrology.js. Sidereal is the same chart with the
// ayanamsa taken off, so both readings are always available from one set of
// inputs and there is nothing to keep in step.

// ---- zodiac ------------------------------------------------------------

// Lahiri, the standard Indian ayanamsa: 23°51'11" at J2000, drifting about
// 50.28 arcseconds a year.
function astroAyanamsa(d) {
	return 23.8531 + (d / 365.25) * 0.0139659
}

// Shifts a whole chart into the sidereal zodiac. Longitudes move, the
// relationships between them do not, so aspects are left exactly as they were.
function astroToSidereal(chart) {
	var ayan = astroAyanamsa(chart.d)
	var out = {
		d: chart.d, ayanamsa: ayan, phase: chart.phase,
		plutoOutOfRange: chart.plutoOutOfRange,
		bodies: [], aspects: chart.aspects, sidereal: true
	}
	for (var i = 0; i < chart.bodies.length; i++) {
		var b = chart.bodies[i]
		var lon = aRev(b.lon - ayan)
		var s = astroSignOf(lon)
		out.bodies.push({
			key: b.key, name: b.name, glyph: b.glyph, lon: lon,
			sign: s.sign, signIdx: s.idx, deg: s.deg, min: s.min,
			retro: b.retro, speed: b.speed, house: b.house
		})
	}
	if (chart.houses) {
		out.houses = { system: chart.houses.system, cusps: [] }
		for (var h = 0; h < chart.houses.cusps.length; h++) {
			out.houses.cusps.push(aRev(chart.houses.cusps[h] - ayan))
		}
		out.houses.asc = aRev(chart.houses.asc - ayan)
		out.houses.mc = aRev(chart.houses.mc - ayan)
		out.ascSign = astroSignOf(out.houses.asc)
		out.mcSign = astroSignOf(out.houses.mc)
	}
	return out
}

// ---- tab state ---------------------------------------------------------

var pcForm = null      // the details being edited
var pcZodiac = "tropical"
var pcEditingId = null // the saved row being edited, if any

function pcDefaultForm() {
	var now = new Date()
	return {
		name: "",
		y: now.getFullYear() - 30, m: 1, d: 1,
		hh: 12, mm: 0,
		timeKnown: true,
		usePlace: true,
		place: "", lat: 51.5074, lon: -0.1278, tz: 0
	}
}

function pcNum(id, fallback) {
	var e = document.getElementById(id)
	if (e === null) return fallback
	var v = Number(e.value)
	return isFinite(v) ? v : fallback
}

// Reads the form back out of the DOM into pcForm, so a redraw keeps what was
// typed.
function pcCapture() {
	if (pcForm === null) pcForm = pcDefaultForm()
	var nameEl = document.getElementById("pcName")
	if (nameEl !== null) pcForm.name = nameEl.value
	var placeEl = document.getElementById("pcPlace")
	if (placeEl !== null) pcForm.place = placeEl.value
	pcForm.y = pcNum("pcY", pcForm.y); pcForm.m = pcNum("pcM", pcForm.m); pcForm.d = pcNum("pcD", pcForm.d)
	pcForm.hh = pcNum("pcHH", pcForm.hh); pcForm.mm = pcNum("pcMM", pcForm.mm)
	pcForm.lat = pcNum("pcLat", pcForm.lat); pcForm.lon = pcNum("pcLon", pcForm.lon); pcForm.tz = pcNum("pcTZ", pcForm.tz)
	return pcForm
}

function pcSetZodiac(z) { pcCapture(); pcZodiac = z; renderProfileChart() }
function pcToggleTime() { pcCapture(); pcForm.timeKnown = !pcForm.timeKnown; renderProfileChart() }
function pcTogglePlace() { pcCapture(); pcForm.usePlace = !pcForm.usePlace; renderProfileChart() }
function pcRedraw() { pcCapture(); pcDraw() }

// ---- computing ---------------------------------------------------------

// An unknown birth time is treated as noon, which keeps every planet except
// the Moon within a fraction of a degree of the truth. Houses and the
// Ascendant are dropped entirely rather than drawn from a guess.
function pcBuildChart(f, zodiac) {
	var hh = f.timeKnown ? f.hh : 12
	var mm = f.timeKnown ? f.mm : 0
	var ut = hh + mm / 60 - (f.usePlace ? f.tz : 0)
	var loc = (f.usePlace && f.timeKnown) ? { lat: f.lat, lon: f.lon, system: "whole" } : null
	var chart = astroChart(f.y, f.m, f.d, ut, loc)
	return (zodiac === "sidereal") ? astroToSidereal(chart) : chart
}

// Today's sky against the birth chart. Only the slower bodies are worth
// listing: a Moon transit is over in hours, where an outer planet contact is
// the thing people actually want to know about.
var pcTransitBodies = ["jupiter", "saturn", "uranus", "neptune", "pluto", "mars"]

function pcTransits(natal, zodiac) {
	var now = new Date()
	var ut = now.getUTCHours() + now.getUTCMinutes() / 60
	var sky = astroChart(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), ut, null)
	if (zodiac === "sidereal") sky = astroToSidereal(sky)

	var hits = []
	for (var i = 0; i < sky.bodies.length; i++) {
		var t = sky.bodies[i]
		if (pcTransitBodies.indexOf(t.key) === -1) continue
		for (var j = 0; j < natal.bodies.length; j++) {
			var n = natal.bodies[j]
			var sep = Math.abs(aRev(t.lon - n.lon))
			if (sep > 180) sep = 360 - sep
			for (var k = 0; k < astroAspects.length; k++) {
				var asp = astroAspects[k]
				var delta = Math.abs(sep - asp.ang)
				if (delta <= Math.min(asp.orb, 3)) { // tight orbs, or everything hits
					hits.push({ t: t, n: n, aspect: asp, orb: delta })
					break
				}
			}
		}
	}
	hits.sort(function (a, b) { return a.orb - b.orb })
	return { hits: hits.slice(0, 10), when: now }
}

// ---- rendering ---------------------------------------------------------

function renderProfileChart() {
	var tok = profileRenderSeq
	if (pcForm === null) pcForm = pcDefaultForm()

	chartList().then(function (rows) {
		var f = pcForm
		var o = ''

		o += '<div class="pcZodiacRow">'
		o += '<button class="intBtn3 pcZodBtn' + (pcZodiac === "tropical" ? " pcZodOn" : "") + '" onclick="pcSetZodiac(&quot;tropical&quot;)">&#9711; Tropical</button>'
		o += '<button class="intBtn3 pcZodBtn' + (pcZodiac === "sidereal" ? " pcZodOn" : "") + '" onclick="pcSetZodiac(&quot;sidereal&quot;)">&#9633; Sidereal</button>'
		o += '<span class="profileWhen">' + (pcZodiac === "tropical" ? "Western, drawn as a wheel" : "Vedic (Lahiri), drawn as a square") + '</span>'
		o += '</div>'

		o += '<div class="pcFields">'
		o += '<div class="pcRow"><label class="pcLab">Born</label>'
		o += '<input type="number" id="pcY" class="pcIn pcInY" value="' + f.y + '" oninput="pcRedraw()" title="Year">'
		o += '<input type="number" id="pcM" class="pcIn" min="1" max="12" value="' + f.m + '" oninput="pcRedraw()" title="Month">'
		o += '<input type="number" id="pcD" class="pcIn" min="1" max="31" value="' + f.d + '" oninput="pcRedraw()" title="Day">'
		o += '</div>'

		o += '<div class="pcRow"><label class="pcLab">Time</label>'
		if (f.timeKnown) {
			o += '<input type="number" id="pcHH" class="pcIn" min="0" max="23" value="' + f.hh + '" oninput="pcRedraw()" title="Hour">'
			o += '<input type="number" id="pcMM" class="pcIn" min="0" max="59" value="' + f.mm + '" oninput="pcRedraw()" title="Minute">'
		} else {
			o += '<span class="profileWhen pcUnknown">Unknown &mdash; using noon, no houses</span>'
		}
		o += '<label class="pcChk"><input type="checkbox"' + (f.timeKnown ? '' : ' checked') + ' onchange="pcToggleTime()"> I don\'t know my birth time</label>'
		o += '</div>'

		o += '<div class="pcRow"><label class="pcLab">Place</label>'
		o += '<label class="pcChk"><input type="checkbox"' + (f.usePlace ? ' checked' : '') + ' onchange="pcTogglePlace()"> Use a birthplace</label>'
		o += '</div>'

		if (f.usePlace) {
			o += '<div class="pcRow"><label class="pcLab"></label>'
			o += '<input type="text" id="pcPlace" class="pcIn pcInPlace" value="' + authEsc(f.place) + '" placeholder="e.g. Brooklyn, New York" oninput="pcRedraw()">'
			o += '<button class="profileMiniBtn" onclick="pcLookupPlace()">Find</button>'
			o += '</div>'
			o += '<div id="pcGeo" class="pcGeo"></div>'
			o += '<div class="pcRow"><label class="pcLab">Lat / Lon</label>'
			o += '<input type="number" step="0.0001" id="pcLat" class="pcIn" value="' + f.lat + '" oninput="pcRedraw()" title="Degrees north">'
			o += '<input type="number" step="0.0001" id="pcLon" class="pcIn" value="' + f.lon + '" oninput="pcRedraw()" title="Degrees east">'
			o += '<input type="number" step="0.25" id="pcTZ" class="pcIn" value="' + f.tz + '" oninput="pcRedraw()" title="Hours ahead of UTC at birth">'
			o += '</div>'
		}
		o += '</div>'

		o += '<div class="pcCanvasWrap"><canvas id="pcCanvas"></canvas></div>'
		o += '<div id="pcPlanets"></div>'
		o += '<div id="pcTransits"></div>'

		o += '<div class="profileSearchRow">'
		o += '<input type="text" id="pcName" class="profileSearchInput" maxlength="60" placeholder="Whose chart is this?" value="' + authEsc(f.name) + '">'
		o += '<button class="profileMiniBtn" onclick="pcSave()">' + (pcEditingId ? "Update" : "Save chart") + '</button>'
		if (pcEditingId) o += '<button class="profileMiniBtn" onclick="pcNew()">New</button>'
		o += '</div>'

		if (rows.length) {
			o += '<div class="profileList">'
			rows.forEach(function (r) {
				var nm = authEsc(r.name).replace(/"/g, '&quot;')
				o += '<div class="profileRow">'
				o += '<span class="profileRowPhrase" onclick="pcOpen(&quot;' + r.id + '&quot;)">' + authEsc(r.name) + '</span>'
				o += '<span class="profileRowActions">'
				o += '<span class="profileWhen">' + authEsc(r.birth_date) + (r.time_known === false ? ' (no time)' : '') + '</span>'
				o += '<span class="profileBadge">' + authEsc(r.zodiac || "tropical") + '</span>'
				o += '<button class="profileMiniBtn" onclick="pcOpen(&quot;' + r.id + '&quot;)">Open</button>'
				o += '<button class="profileMiniBtn profileMiniDanger" onclick="pcDelete(&quot;' + r.id + '&quot;,&quot;' + nm + '&quot;)">&#215;</button>'
				o += '</span></div>'
			})
			o += '</div>'
		}

		profileBody(o, tok)
		pcDraw()
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

function pcDraw() {
	var cvs = document.getElementById("pcCanvas")
	if (cvs === null) return
	var f = pcForm
	var chart

	try { chart = pcBuildChart(f, pcZodiac) }
	catch (e) {
		document.getElementById("pcPlanets").innerHTML = '<div class="profileNote profileWarn">Check the date.</div>'
		return
	}

	var wrap = cvs.parentNode
	var size = Math.max(240, Math.min(wrap.clientWidth || 360, 420))
	var dpr = window.devicePixelRatio || 1
	cvs.style.width = size + "px"; cvs.style.height = size + "px"
	cvs.width = Math.floor(size * dpr); cvs.height = Math.floor(size * dpr)
	var c = cvs.getContext("2d")
	c.setTransform(dpr, 0, 0, dpr, 0, 0)
	c.clearRect(0, 0, size, size)

	if (pcZodiac === "sidereal") pcDrawSquare(c, size, chart)
	else pcDrawWheel(c, size, chart)

	pcListPlanets(chart)
	pcListTransits(chart)
}

function pcInk(v, fallback) { return astroCssVar(v, fallback) }

// Tropical: the familiar round wheel.
function pcDrawWheel(c, size, chart) {
	var cx = size / 2, cy = size / 2
	var rOuter = size * 0.46, rSign = size * 0.38, rInner = size * 0.30
	var line = pcInk("--border-accent", "#556")
	var text = pcInk("--font-white-2", "#ccc")
	var faint = pcInk("--font-white-4", "#889")

	// the Ascendant sits on the left horizon when there is one to place
	var rot = (chart.houses ? chart.houses.asc : 0)

	c.strokeStyle = line; c.lineWidth = 1
	;[rOuter, rSign, rInner].forEach(function (r) {
		c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke()
	})

	c.font = "13px " + (window.coderainFontStack || "sans-serif")
	c.textAlign = "center"; c.textBaseline = "middle"
	for (var i = 0; i < 12; i++) {
		var a0 = astroWheelAngle(i * 30, rot)
		var p0 = astroPolar(cx, cy, rInner, a0), p1 = astroPolar(cx, cy, rOuter, a0)
		c.strokeStyle = line
		c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke()

		var mid = astroPolar(cx, cy, (rSign + rOuter) / 2, astroWheelAngle(i * 30 + 15, rot))
		c.fillStyle = faint
		c.fillText(astroSigns[i].glyph, mid.x, mid.y)
	}

	for (var b = 0; b < chart.bodies.length; b++) {
		var body = chart.bodies[b]
		var pa = astroWheelAngle(body.lon, rot)
		var pt = astroPolar(cx, cy, rSign - 14, pa)
		c.fillStyle = astroPlanetColor(body.key)
		c.font = "15px " + (window.coderainFontStack || "sans-serif")
		c.fillText(body.glyph, pt.x, pt.y)
		var tick = astroPolar(cx, cy, rInner, pa), tick2 = astroPolar(cx, cy, rInner + 6, pa)
		c.strokeStyle = astroPlanetColor(body.key)
		c.beginPath(); c.moveTo(tick.x, tick.y); c.lineTo(tick2.x, tick2.y); c.stroke()
	}

	if (chart.houses) {
		c.fillStyle = text
		c.font = "11px " + (window.coderainFontStack || "sans-serif")
		c.textAlign = "left"
		c.fillText("ASC " + astroSigns[chart.ascSign.idx].name, 6, size - 16)
		c.textAlign = "right"
		c.fillText("MC " + astroSigns[chart.mcSign.idx].name, size - 6, size - 16)
	}
}

// Sidereal: the South Indian square, signs in fixed cells and planets written
// into whichever cell they fall in.
var pcSquareCells = [
	[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3],
	[2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]
]

function pcDrawSquare(c, size, chart) {
	var line = pcInk("--border-accent", "#556")
	var faint = pcInk("--font-white-4", "#889")
	var cell = size / 4

	c.strokeStyle = line; c.lineWidth = 1
	c.strokeRect(0.5, 0.5, size - 1, size - 1)

	// group the bodies by sign so each cell can list what it holds
	var inSign = {}
	for (var b = 0; b < chart.bodies.length; b++) {
		var s = chart.bodies[b].signIdx
		if (!inSign[s]) inSign[s] = []
		inSign[s].push(chart.bodies[b])
	}

	c.textAlign = "center"
	for (var i = 0; i < 12; i++) {
		var gx = pcSquareCells[i][0], gy = pcSquareCells[i][1]
		var x = gx * cell, y = gy * cell
		c.strokeStyle = line
		c.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1)

		c.fillStyle = faint
		c.font = "11px " + (window.coderainFontStack || "sans-serif")
		c.textBaseline = "top"
		c.fillText(astroSigns[i].glyph, x + cell / 2, y + 4)

		var here = inSign[i] || []
		c.font = "13px " + (window.coderainFontStack || "sans-serif")
		for (var k = 0; k < here.length; k++) {
			c.fillStyle = astroPlanetColor(here[k].key)
			c.fillText(here[k].glyph, x + cell / 2, y + 20 + k * 15)
		}

		// the rising sign is the one to start reading from
		if (chart.houses && chart.ascSign.idx === i) {
			c.strokeStyle = pcInk("--checkmark-accent", "#6c6")
			c.lineWidth = 2
			c.strokeRect(x + 2, y + 2, cell - 4, cell - 4)
			c.lineWidth = 1
		}
	}
}

function pcListPlanets(chart) {
	var host = document.getElementById("pcPlanets")
	if (host === null) return
	var o = '<div class="pcSectionTitle">Planets at birth</div>'
	o += '<div class="pcGrid">'
	for (var i = 0; i < chart.bodies.length; i++) {
		var b = chart.bodies[i]
		o += '<div class="pcCell">'
		o += '<span class="pcGlyph" style="color:' + astroPlanetColor(b.key) + '">' + b.glyph + '</span>'
		o += '<span class="pcBody">' + authEsc(b.name) + '</span>'
		o += '<span class="pcPos">' + b.deg + '&deg;' + (b.min < 10 ? "0" : "") + b.min + "' " + authEsc(astroSigns[b.signIdx].name) + '</span>'
		if (b.retro) o += '<span class="pcRetro" title="Retrograde">&#8479;</span>'
		if (b.house) o += '<span class="pcHouse">H' + b.house + '</span>'
		o += '</div>'
	}
	o += '</div>'
	if (!chart.houses) {
		o += '<div class="profileNote">No birth time or place, so there are no houses and no Ascendant. Everything above is still accurate to within a fraction of a degree, apart from the Moon.</div>'
	}
	if (chart.sidereal) {
		o += '<div class="profileNote">Sidereal, Lahiri ayanamsa &mdash; ' + chart.ayanamsa.toFixed(2) + '&deg; behind the tropical zodiac at this date.</div>'
	}
	host.innerHTML = o
}

function pcListTransits(chart) {
	var host = document.getElementById("pcTransits")
	if (host === null) return
	var t
	try { t = pcTransits(chart, pcZodiac) } catch (e) { host.innerHTML = ""; return }

	var o = '<div class="pcSectionTitle">Transits right now</div>'
	if (t.hits.length === 0) {
		o += '<div class="profileNote">Nothing tight enough to call out today.</div>'
		host.innerHTML = o; return
	}
	o += '<div class="pcTransitList">'
	for (var i = 0; i < t.hits.length; i++) {
		var h = t.hits[i]
		o += '<div class="pcTransit">'
		o += '<span class="pcGlyph" style="color:' + astroPlanetColor(h.t.key) + '">' + h.t.glyph + '</span>'
		o += '<span class="pcBody">' + authEsc(h.t.name) + '</span>'
		o += '<span class="pcAspect" style="color:' + astroAspectColor(h.aspect.ang) + '">' + authEsc(h.aspect.name) + '</span>'
		o += '<span class="pcGlyph" style="color:' + astroPlanetColor(h.n.key) + '">' + h.n.glyph + '</span>'
		o += '<span class="pcBody">natal ' + authEsc(h.n.name) + '</span>'
		o += '<span class="pcOrb">' + h.orb.toFixed(1) + '&deg;</span>'
		o += '</div>'
	}
	o += '</div>'
	o += '<div class="profileNote">Slow movers only, within 3&deg;. The Moon and Sun move too fast to be worth listing.</div>'
	host.innerHTML = o
}

// ---- place lookup ------------------------------------------------------

// Reuses the Astrology tab's geocoder rather than a second one: same URL
// builder, same parser, same OpenStreetMap attribution.
var pcGeoResults = []

function pcLookupPlace() {
	pcCapture()
	var host = document.getElementById("pcGeo")
	if (host === null) return
	var q = pcForm.place.trim()
	if (q === "") { host.innerHTML = ""; return }
	if (typeof astroGeoUrl !== "function") {
		host.innerHTML = '<div class="profileNote">Enter the coordinates below.</div>'
		return
	}

	host.innerHTML = '<div class="profileLoading">Searching&hellip;</div>'
	fetch(astroGeoUrl(q), { headers: { "Accept": "application/json" } })
		.then(function (r) { return r.json() })
		.then(function (data) {
			var hits = astroGeoParse(data)
			if (!hits.length) {
				host.innerHTML = '<div class="profileNote">No match. Try adding a country, or enter the coordinates below.</div>'
				return
			}
			pcGeoResults = hits
			var o = '<div class="profileList">'
			for (var i = 0; i < hits.length && i < 5; i++) {
				o += '<div class="profileRow"><span class="profileRowPhrase" onclick="pcPickPlace(' + i + ')">' + authEsc(hits[i].label)
				o += '<span class="profileWhen"> ' + hits[i].lat.toFixed(3) + ', ' + hits[i].lon.toFixed(3) + '</span></span></div>'
			}
			o += '</div><div class="profileNote">Search by OpenStreetMap / Nominatim</div>'
			host.innerHTML = o
		})
		.catch(function () {
			host.innerHTML = '<div class="profileNote profileWarn">Lookup failed. Enter the coordinates below.</div>'
		})
}

function pcPickPlace(i) {
	var r = pcGeoResults[i]
	if (!r) return
	pcCapture()
	pcForm.place = r.label
	pcForm.lat = r.lat
	pcForm.lon = r.lon
	renderProfileChart()
}

// ---- saving ------------------------------------------------------------

function pcSave() {
	pcCapture()
	var f = pcForm
	if (!f.name.trim()) { displayCalcNotification("Give the chart a name", 1800); return }

	var pad = function (n) { return (String(n).length < 2 ? "0" : "") + n }
	chartSave(f.name.trim(), {
		birth_date: f.y + "-" + pad(f.m) + "-" + pad(f.d),
		birth_time: f.timeKnown ? (pad(f.hh) + ":" + pad(f.mm)) : "",
		place: f.usePlace ? f.place : "",
		latitude: f.usePlace ? f.lat : null,
		longitude: f.usePlace ? f.lon : null,
		tz_offset: f.usePlace ? f.tz : null,
		zodiac: pcZodiac,
		time_known: f.timeKnown,
		use_place: f.usePlace
	}).then(function (what) {
		displayCalcNotification(what === "updated" ? "Chart updated" : "Chart saved", 1800)
		renderProfileChart()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not save the chart", 2600)
	})
}

function pcOpen(id) {
	chartList().then(function (rows) {
		var r = null
		for (var i = 0; i < rows.length; i++) if (rows[i].id === id) { r = rows[i]; break }
		if (r === null) throw new Error("That chart is gone")

		var parts = String(r.birth_date).split("-")
		var time = String(r.birth_time || "").split(":")
		pcForm = {
			name: r.name,
			y: Number(parts[0]) || 2000, m: Number(parts[1]) || 1, d: Number(parts[2]) || 1,
			hh: Number(time[0]) || 12, mm: Number(time[1]) || 0,
			timeKnown: r.time_known !== false,
			usePlace: r.use_place !== false,
			place: r.place || "",
			lat: (r.latitude === null || r.latitude === undefined) ? 51.5074 : r.latitude,
			lon: (r.longitude === null || r.longitude === undefined) ? -0.1278 : r.longitude,
			tz: (r.tz_offset === null || r.tz_offset === undefined) ? 0 : r.tz_offset
		}
		pcEditingId = r.id
		if (r.zodiac === "sidereal" || r.zodiac === "tropical") pcZodiac = r.zodiac
		renderProfileChart()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not open the chart", 2400)
	})
}

function pcNew() {
	pcForm = pcDefaultForm()
	pcEditingId = null
	renderProfileChart()
}

function pcDelete(id, name) {
	if (!window.confirm('Delete the saved chart "' + name + '"?')) return
	chartDelete(id).then(function () {
		if (pcEditingId === id) { pcEditingId = null }
		renderProfileChart()
	}).catch(function (err) { profileBody(profileErr(err)) })
}
