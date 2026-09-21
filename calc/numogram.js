// ===================== Numogram (Decimal Labyrinth) =====================
//
// The CCRU Numogram, drawn as the original diagram and made interactive.
//
// EVERYTHING IS GENERATED FROM THE DATA BELOW. The six structures - zones,
// syzygies, currents, gates, channels, timeSystems - are the only place a
// number or a position is written down. The SVG, the highlighting, the
// annotations and the arithmetic all read from them, so the picture cannot
// disagree with the model.
//
// ---- the model, and where it comes from -------------------------------
//
// Three rules from CCRU material define the whole figure:
//
//   "zones are grouped into five pairs (syzygies) by nine-sum twinning"
//   "the arithmetical difference of each syzygy defines a current
//    (or connection to a tractor zone)"
//   "each zone number when digitally cumulated defines the value of a gate,
//    whose reduction sets the course of a corresponding channel"
//
// Digital cumulation of n is 1+2+...+n, the triangular number n(n+1)/2, which
// is where the gate values 1, 3, 6, 10, 15, 21, 28, 36, 45 come from.
//
// "Reduction" is ambiguous in the sources between a single pass of digit
// summing and a repeated one (digital root). Gate 28 decides it: the sourced
// channel table runs 7 -> 1, which is the digital root (2+8=10, 1+0=1), not
// the single pass (10). numReduce() is therefore the digital root, and that
// one choice is the only place the ambiguity lands.
//
// Sources are community transcriptions of CCRU: Writings 1997-2003, not the
// book itself. The three rules above are quoted consistently across them; the
// gate/channel table was re-derived from the rules here and matched. Treat the
// structure as solid, the provenance as second-hand.
//
// ---- which reference image is canonical -------------------------------
//
// Two were supplied and they disagree, so one had to be chosen and the choice
// recorded.
//
//   3.jpg  The CCRU 1997-2003 cover: black figure on the green field. Its
//          gate labels read 1, 3, 6, 10, 15, 21, 28, 36, 45 - every one the
//          correct triangular number. CANONICAL.
//
//   4.webp A redrawing. It is horizontally MIRRORED relative to the cover,
//          and two of its gate labels are wrong: 16 where the cover has 15
//          (the cumulation of 5 is 15), and 8 where the cover has 3 (the
//          cumulation of 2 is 3). Not used for values.
//
// The arrangement here follows the written brief - Zone-6 upper-left, Zone-3
// upper-right - which matches 4.webp's orientation rather than the cover's.
// The cover has that pair the other way round. The brief has specified it
// twice and asked for it to be preserved, so it is preserved; the geometry is
// data-driven, so mirroring the figure later is x -> width - x and nothing
// else. Everything other than that one pair follows the cover.
var NUM_REFERENCE = Object.freeze({
	canonical: "3.jpg - CCRU 1997-2003 cover",
	secondary: "4.webp - redrawing, mirrored, gate labels 16 and 8 incorrect",
	orientationFollows: "written brief (6 upper-left, 3 upper-right)",
	orientationNote: "the cover shows 3 upper-left and 6 upper-right"
})

// ---- on the earlier reference image -----------------------------------
//
// The visual reference supplied for this build is a degraded reproduction: it
// carries nine zone circles rather than ten, labels two of them "1", omits
// Zone-7, and repeats the Gt-28 annotation while omitting Gt-15 and Gt-21.
// Its composition, line weights, circle treatment and annotation style are
// followed closely. Its content is not - the structure below comes from the
// rules above. numogramCorrections() states this in the panel rather than
// leaving it implicit.

// ------------------------------------------------------- provenance
//
// Every claim this feature displays carries one of three statuses, and the
// interface prints it. The distinction matters more than the feature does:
// none of the interpretive or experimental material is Nick Land's, and a
// reader must never have to guess which is which.
//
//   canonical    - follows from rules stated in CCRU material
//   attested     - a real practice of the CCRU circle, but its own system,
//                  with no stated relationship to the Numogram
//   experimental - this application's own operation. Nobody's doctrine.
var NUM_SOURCES = {
	structure: {
		status: "canonical",
		claim: "Ten zones, nine-sum syzygies, currents as arithmetical difference, " +
			"gates as digital cumulation, channels as the reduction of a gate.",
		source: "CCRU material (Decimal Labyrinth / Pandemonium Matrix), via community " +
			"transcriptions of CCRU: Writings 1997-2003. Rules quoted consistently across " +
			"sources; the gate and channel table was re-derived from those rules and matched."
	},
	reduction: {
		status: "canonical",
		claim: "Reduction is the digital root.",
		source: "Fixed by the sourced channel table: Gate 28 runs to Zone-1, which is " +
			"2+8=10, 1+0=1. A single pass would give 10. The sources do not state which " +
			"is meant, so this is the reading the table forces rather than a free choice."
	},
	aq: {
		status: "attested",
		claim: "Anglossic / Alphanumeric Qabbala: 0-9 take their own value, A=10 through " +
			"Z=35, and a string's value is the sum of its characters.",
		source: "Nick Land, 'Qabbala 101', Collapse I (2007); used across CCRU writings. " +
			"A genuine practice of that circle - but a separate system. No source " +
			"establishes any formal relationship between AQ and the Numogram."
	},
	planetwork: {
		status: "canonical",
		claim: "The Lemurian Planetwork: Zone n is Sol-n, the nth body outward from the " +
			"Sun, with the Sun itself at Zone-0 and Pluto at Zone-9.",
		source: "CCRU zone pages, which write Jupiter as 'Sol-5' at Zone-5 and give the " +
			"astrozygonomous pairings - Mercury with Neptune, Earth with Saturn, Jupiter " +
			"with Mars, Pluto with the Sun. Those pairings are the same 1::8, 3::6, 4::5 " +
			"and 0::9 the arithmetic already produces, which is an independent check."
	},
	ptolemy: {
		status: "historical",
		claim: "Earth at the centre, then Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn, " +
			"then the sphere of the fixed stars. Mercury and Venus are the inferior planets, " +
			"Mars, Jupiter and Saturn the superior, divided by the Sun's sphere. Retrograde " +
			"motion is accounted for by an epicycle riding a deferent.",
		source: "The Ptolemaic tradition, following the Almagest, with the ordering argued " +
			"from apparent speed rather than measured distance. Uranus, Neptune and Pluto " +
			"are not part of it and are not placed in it here - they appear only in the " +
			"extended set, as the post-Ptolemaic extension they are. The epicycle drawn " +
			"is schematic geometry: no radius, period or equant is claimed as Ptolemy's."
	},
	crossmap: {
		status: "experimental",
		claim: "Placing the Planetwork's bodies at their classical geocentric positions, " +
			"and striking the spheres from Zone-3 because the Planetwork puts Earth there.",
		source: "This application's own cross-mapping. Ptolemy did not anticipate the CCRU; " +
			"the CCRU was not Ptolemaic; Nick Land did not design a geocentric Numogram. " +
			"The Planetwork counts outward from the Sun, so its ordering is solar-centred - " +
			"that much is demonstrable from the Sol-n notation. What is NOT established is " +
			"any CCRU discussion of heliocentrism as such, and none is claimed here. " +
			"Changing the cosmological frame changes nothing about the Numogram's " +
			"arithmetic: no geocentric syzygies, currents or gates have been invented."
	},
	bridge: {
		status: "experimental",
		claim: "Reducing an arbitrary number - or an AQ total - to a zone, and reading " +
			"that zone's relationships.",
		source: "This application's own operation. Digital reduction is canonical inside " +
			"the Numogram, where it carries a gate to its channel. Applying it to a number " +
			"from outside the figure is not something the source material does."
	}
}

var NUM_STATUS_LABEL = {
	canonical: "CANONICAL",
	historical: "HISTORICAL \u00b7 PTOLEMAIC TRADITION",
	attested: "ATTESTED · NOT NUMOGRAMMATIC",
	experimental: "EXPERIMENTAL · NOT A CCRU PROCEDURE"
}

var numogramMenuOpened = false

// ---------------------------------------------------------------- geometry
//
// ===================== CANONICAL GEOMETRY ================================
//
// The one place a zone position is written down. Frozen: the cosmological
// layers read it and never write to it, so no overlay can push the canonical
// figure out of shape. That happened once - the geocentric work distorted the
// diagram - and freezing is what stops it happening again silently.
//
// The arrangement is the Numogram's own, and it is deliberately awkward:
//
//          [6]        [3]          the Warp pair, across the top
//     [5]      [2]        [7]      Hold and the middle band
//   [4]                            Sink's far-left anchor
//                  [1]             the spine begins
//                  [8]
//                  [9]             Plex, adjacent to 0
//                  [0]             the figure terminates
//
// Zone-9 sits directly above Zone-0 because they are the Plex syzygy and the
// figure ends on that pair. An earlier build had Zone-8 between them, which
// split the pair - that was wrong and is corrected here.
var CANONICAL_GEOMETRY = Object.freeze({
	width: 800,
	height: 1200,
	zones: Object.freeze({
		6: Object.freeze({ x: 245, y: 175,  r: 54 }),
		3: Object.freeze({ x: 455, y: 165,  r: 52 }),
		5: Object.freeze({ x: 165, y: 420,  r: 48 }),
		2: Object.freeze({ x: 420, y: 395,  r: 46 }),
		7: Object.freeze({ x: 620, y: 470,  r: 46 }),
		4: Object.freeze({ x: 130, y: 600,  r: 48 }),
		1: Object.freeze({ x: 430, y: 700,  r: 50 }),
		8: Object.freeze({ x: 430, y: 850,  r: 48 }),
		9: Object.freeze({ x: 430, y: 985,  r: 46 }),
		0: Object.freeze({ x: 430, y: 1115, r: 46 })
	})
})

var NUM_W = CANONICAL_GEOMETRY.width, NUM_H = CANONICAL_GEOMETRY.height

// The zone list the renderer walks, built from the geometry above and from the
// syzygy each zone belongs to. Positions are copied out, never referenced, so
// nothing downstream can reach back and mutate the canonical record.
var NUM_ZONES = (function () {
	var sy = { 0: "0::9", 9: "0::9", 1: "1::8", 8: "1::8", 2: "2::7", 7: "2::7",
	           3: "3::6", 6: "3::6", 4: "4::5", 5: "4::5" }
	var out = []
	for (var n = 0; n <= 9; n++) {
		var g = CANONICAL_GEOMETRY.zones[n]
		out.push({ n: n, x: g.x, y: g.y, r: g.r, sy: sy[n] })
	}
	return out
})()

// --------------------------------------------------------------- syzygies
//
// Nine-sum twinning. The current is the arithmetical difference, and it runs
// to the zone of that value - the tractor. Two of the five land back inside
// themselves (0::9 -> 9, and 3::6 -> 3); those are the two closed loops, Plex
// and Warp. The other three close into a single cycle, which is the Torque:
//
//     1::8 -current 7-> 2::7 -current 5-> 4::5 -current 1-> 1::8
//
// That the remainder closes exactly is the model checking itself; the test
// suite asserts it rather than trusting the comment.
// The current names are CCRU's own, taken from the zone pages, which state
// them as "Tractor-Zone of the 8-1 (or 'Surge') Current" and so on for each.
// All five are attested; none is inferred from the arithmetic.
var NUM_SYZYGIES = Object.freeze([
	Object.freeze({ key: "0::9", a: 0, b: 9, demon: "Uttunul", sys: "plex",   current: "PLEX"  }),
	Object.freeze({ key: "1::8", a: 1, b: 8, demon: "Murmur",  sys: "torque", current: "SURGE" }),
	Object.freeze({ key: "2::7", a: 2, b: 7, demon: "Oddubb",  sys: "torque", current: "HOLD"  }),
	Object.freeze({ key: "3::6", a: 3, b: 6, demon: "Djynxx",  sys: "warp",   current: "WARP"  }),
	Object.freeze({ key: "4::5", a: 4, b: 5, demon: "Katak",   sys: "torque", current: "SINK"  })
])

var NUM_TIME_SYSTEMS = [
	{ key: "torque", label: "TORQUE", syzygies: ["1::8", "2::7", "4::5"] },
	{ key: "warp",   label: "WARP",   syzygies: ["3::6"] },
	{ key: "plex",   label: "PLEX",   syzygies: ["0::9"] }
]

// ============ COSMOLOGY: three datasets, deliberately not merged ==========
//
// canonicalPlanetwork   what CCRU says
// historicalGeocentric  what Ptolemy says
// crossMap              what this application does with the two
//
// They are kept apart because merging them is exactly how an experiment turns
// into a false claim. Nothing below derives a zone from a geocentric position
// or a geocentric position from a zone: each body carries both, independently,
// and where one of them does not exist it is null rather than invented.

// ---- canonical: the Lemurian Planetwork ---------------------------------
//
// CCRU's own zone pages write Jupiter as "Sol-5" and place it at Zone-5, which
// fixes the whole sequence: Zone n is Sol-n, the nth body outward from the Sun,
// with the Sun itself at 0. The syzygetic pairings the zone pages give -
// Mercury with Neptune, Earth with Saturn, Jupiter with Mars, Pluto with the
// Sun - are the same 1::8, 3::6, 4::5 and 0::9 the arithmetic produces, which
// is a useful independent check on the model rather than a second source of it.
var NUM_PLANETWORK = [
	{ zone: 0, body: "SUN",     sol: 0 },
	{ zone: 1, body: "MERCURY", sol: 1 },
	{ zone: 2, body: "VENUS",   sol: 2 },
	{ zone: 3, body: "EARTH",   sol: 3 },
	{ zone: 4, body: "MARS",    sol: 4 },
	{ zone: 5, body: "JUPITER", sol: 5 },
	{ zone: 6, body: "SATURN",  sol: 6 },
	{ zone: 7, body: "URANUS",  sol: 7 },
	{ zone: 8, body: "NEPTUNE", sol: 8 },
	{ zone: 9, body: "PLUTO",   sol: 9 }
]

// ---- historical: the Ptolemaic order ------------------------------------
//
// Earth at the centre, then the seven wandering stars in the order the
// tradition gives them, then the sphere of the fixed stars. The ordering is
// Ptolemy's; the reasoning behind it - the Moon nearest because it eclipses
// everything and moves fastest, Saturn furthest because it moves slowest - is
// the classical argument from apparent speed, not from measured distance.
//
// "inferior" and "superior" are Ptolemy's own division, taken relative to the
// Sun's sphere: the two bodies that never stray far from the Sun sit below it,
// the three that can appear anywhere sit above.
//
// Uranus, Neptune and Pluto are NOT in this list. Ptolemy did not know of
// them, and back-dating them into his cosmos would be the exact anachronism
// this mode is supposed to avoid. They appear only in the extended set, marked
// as the post-Ptolemaic extension they are.
var NUM_GEOCENTRIC = [
	{ body: "EARTH",   order: 0, sphere: "CENTRE",   klass: "reference", set: "classical" },
	{ body: "MOON",    order: 1, sphere: "1st",      klass: "luminary",  set: "classical" },
	{ body: "MERCURY", order: 2, sphere: "2nd",      klass: "inferior",  set: "classical" },
	{ body: "VENUS",   order: 3, sphere: "3rd",      klass: "inferior",  set: "classical" },
	{ body: "SUN",     order: 4, sphere: "4th",      klass: "luminary",  set: "classical" },
	{ body: "MARS",    order: 5, sphere: "5th",      klass: "superior",  set: "classical" },
	{ body: "JUPITER", order: 6, sphere: "6th",      klass: "superior",  set: "classical" },
	{ body: "SATURN",  order: 7, sphere: "7th",      klass: "superior",  set: "classical" },
	{ body: "STARS",   order: 8, sphere: "8th",      klass: "fixed",     set: "classical" },
	{ body: "URANUS",  order: 9,  sphere: "beyond",  klass: "extension", set: "extended" },
	{ body: "NEPTUNE", order: 10, sphere: "beyond",  klass: "extension", set: "extended" },
	{ body: "PLUTO",   order: 11, sphere: "beyond",  klass: "extension", set: "extended" }
]

function numPlanetwork(body) {
	for (var i = 0; i < NUM_PLANETWORK.length; i++) if (NUM_PLANETWORK[i].body === body) return NUM_PLANETWORK[i]
	return null
}
function numPlanetworkZone(z) {
	for (var i = 0; i < NUM_PLANETWORK.length; i++) if (NUM_PLANETWORK[i].zone === z) return NUM_PLANETWORK[i]
	return null
}
function numGeo(body) {
	for (var i = 0; i < NUM_GEOCENTRIC.length; i++) if (NUM_GEOCENTRIC[i].body === body) return NUM_GEOCENTRIC[i]
	return null
}

// ---- the cross-map ------------------------------------------------------
//
// Joins the two by body name and by nothing else. Two facts fall out of that
// join and both are worth having in front of the reader rather than smoothed
// over:
//
//   the MOON has a place in the Ptolemaic cosmos and no zone in the
//   Planetwork, because the Planetwork counts outward from the Sun and the
//   Moon is not on that list;
//
//   URANUS, NEPTUNE and PLUTO have zones 7, 8 and 9 and no classical place
//   at all.
//
// Those are the seams where the two systems do not meet. They are the point.
function numCrossMap(body) {
	var pw = numPlanetwork(body), geo = numGeo(body)
	return {
		body: body,
		zone: pw ? pw.zone : null,          // never inferred from `order`
		sol: pw ? pw.sol : null,
		order: geo ? geo.order : null,      // never inferred from `zone`
		sphere: geo ? geo.sphere : null,
		klass: geo ? geo.klass : null,
		set: geo ? geo.set : null,
		onlyGeocentric: !!(geo && !pw),
		onlyPlanetwork: !!(pw && !geo)
	}
}

function numCosmoBodies(set) {
	var out = []
	for (var i = 0; i < NUM_GEOCENTRIC.length; i++) {
		var g = NUM_GEOCENTRIC[i]
		if (set === "classical" && g.set !== "classical") continue
		out.push(numCrossMap(g.body))
	}
	return out
}

// ------------------------------------------------------------- arithmetic

// Digital root: sum the digits, repeatedly, until one digit is left. This is
// the "reduction" that sets a channel's course.
function numReduce(n) {
	n = Math.abs(Math.floor(n))
	while (n > 9) {
		var s = 0
		while (n > 0) { s += n % 10; n = Math.floor(n / 10) }
		n = s
	}
	return n
}

// Digital cumulation: 1+2+...+n. The triangular number.
function numCumulate(n) { n = Math.abs(Math.floor(n)); return n * (n + 1) / 2 }

function numZone(n) {
	for (var i = 0; i < NUM_ZONES.length; i++) if (NUM_ZONES[i].n === n) return NUM_ZONES[i]
	return null
}

function numSyzygy(key) {
	for (var i = 0; i < NUM_SYZYGIES.length; i++) if (NUM_SYZYGIES[i].key === key) return NUM_SYZYGIES[i]
	return null
}

function numSyzygyOf(n) { var z = numZone(n); return z === null ? null : numSyzygy(z.sy) }

// The current of a syzygy, and the zone it runs to.
function numCurrent(sz) { return Math.abs(sz.b - sz.a) }

// --------------------------------------------------- gates and channels
//
// Built, not listed: one gate per zone, its value the cumulation of the zone
// number, its channel running to the reduction of that value.
var NUM_GATES = (function () {
	var out = []
	for (var i = 0; i < NUM_ZONES.length; i++) {
		var n = NUM_ZONES[i].n
		var v = numCumulate(n)
		out.push({ zone: n, value: v, to: numReduce(v) })
	}
	out.sort(function (a, b) { return a.zone - b.zone })
	return out
})()

function numGate(n) {
	for (var i = 0; i < NUM_GATES.length; i++) if (NUM_GATES[i].zone === n) return NUM_GATES[i]
	return null
}

// A channel is a gate seen as a path: zone -> reduction of its gate value.
var NUM_CHANNELS = NUM_GATES.map(function (g) {
	return { from: g.zone, to: g.to, gate: g.value, self: g.from === g.to }
})

// ------------------------------------------------- gate label placement
//
// The reference puts every gate circle ON its own channel, about half way
// along, drawn opaque so the line passes behind it. That is why nothing in the
// original ever collides: the gate is not a label parked near its zone, it is
// a bead on the thread it names.
//
// This used to pin each gate at an angle beside its zone, which is what put
// the 45, 0 and 9 marks across the zone circles. Riding the path removes the
// class of bug rather than tuning individual coordinates.
//
// Zone-0's gate is not drawn. Its cumulation is 0 and its channel runs 0 -> 0,
// which is degenerate; the reference omits it, and so does this.
// The small solid triangle inside each zone, read off the cover. On the
// vertical spine it sits above or below the numeral; on the rest it sits
// beside it. The 3 and 6 marks are swapped with the pair itself, so each still
// points at its twin.
var NUM_ZONE_MARK = {
	0: "up", 1: "down", 2: "left", 3: "left", 4: "left",
	5: "right", 6: "right", 7: "right", 8: "up", 9: "down"
}

function numMarkPath(z, dir) {
	var t = z.r * 0.30                       // half-width of the triangle
	var off = z.r * 0.52                     // how far off centre it sits
	var cx = z.x, cy = z.y
	if (dir === "up")    { cy -= off; return "M" + numR(cx) + " " + numR(cy - t) + "L" + numR(cx + t) + " " + numR(cy + t * 0.75) + "L" + numR(cx - t) + " " + numR(cy + t * 0.75) + "Z" }
	if (dir === "down")  { cy += off; return "M" + numR(cx) + " " + numR(cy + t) + "L" + numR(cx + t) + " " + numR(cy - t * 0.75) + "L" + numR(cx - t) + " " + numR(cy - t * 0.75) + "Z" }
	if (dir === "left")  { cx -= off; return "M" + numR(cx - t) + " " + numR(cy) + "L" + numR(cx + t * 0.75) + " " + numR(cy - t) + "L" + numR(cx + t * 0.75) + " " + numR(cy + t) + "Z" }
	cx += off;             return "M" + numR(cx + t) + " " + numR(cy) + "L" + numR(cx - t * 0.75) + " " + numR(cy - t) + "L" + numR(cx - t * 0.75) + " " + numR(cy + t) + "Z"
}

// Where the numeral sits, given the marker has taken one side.
function numNumeralOffset(z, dir) {
	var off = z.r * 0.40
	if (dir === "up") return { x: z.x, y: z.y + off }
	if (dir === "down") return { x: z.x, y: z.y - off }
	return { x: z.x, y: z.y }
}

var NUM_GATE_R = 23
var NUM_GATE_DRAWN = { 0: false, 1: true, 2: true, 3: true, 4: true,
                       5: true, 6: true, 7: true, 8: true, 9: true }

// How far along its channel each gate sits. Hand-set: the midpoint is right
// for most, but a couple read better pulled toward one end.
var NUM_GATE_T = { 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.42, 6: 0.5, 7: 0.5, 8: 0.5, 9: 0.5 }

// The two self-returning channels, 1 -> 1 and 9 -> 9, leave their zone and come
// back to it. These are the directions they swing out in - Gt-1 above Zone-1,
// Gt-45 to the left of Zone-9, both as the reference has them.
// Gt-1 sits directly above Zone-1 and Gt-45 directly to the left of Zone-9,
// which is where the reference puts them - and both hold full clearance.
var NUM_LOOP_ANGLE = { gate1: 270, gate9: 180 }

// A point on a quadratic, by parameter.
function numAt(p, t) {
	var mt = 1 - t
	return { x: mt * mt * p.x0 + 2 * mt * t * p.cx + t * t * p.x3,
	         y: mt * mt * p.y0 + 2 * mt * t * p.cy + t * t * p.y3 }
}

// The path a zone's own channel takes - the line its gate rides.
function numChannelPath(n) {
	var g = numGate(n)
	var zf = numZone(n)
	if (g.to === n) return { loop: numLoop(zf, NUM_LOOP_ANGLE["gate" + n], 30) }
	var zt = numZone(g.to)
	return { cubic: numCubic(zf.x, zf.y, zf.r, zt.x, zt.y, zt.r, NUM_CHANNEL_BEND[n] || 0) }
}

function numGatePos(n) {
	var path = numChannelPath(n)
	if (path.loop) return { x: path.loop.lx, y: path.loop.ly }
	return numAt(path.cubic, NUM_GATE_T[n] !== undefined ? NUM_GATE_T[n] : 0.5)
}

// ------------------------------------------------------------ path maths
//
// Every connector is one cubic, bowed sideways by `bend`, trimmed to the rim
// of the circle at each end so nothing runs under a zone.

function numCubic(ax, ay, ar, bx, by, br, bend) {
	var dx = bx - ax, dy = by - ay
	var len = Math.sqrt(dx * dx + dy * dy) || 1
	var ux = dx / len, uy = dy / len
	var x0 = ax + ux * ar, y0 = ay + uy * ar          // leave the rim
	var x3 = bx - ux * br, y3 = by - uy * br          // stop at the rim
	var nx = -uy, ny = ux                             // sideways
	var mx = (x0 + x3) / 2, my = (y0 + y3) / 2
	var cx = mx + nx * bend, cy = my + ny * bend
	// one control point used twice: a quadratic in cubic clothing, which keeps
	// the curve's belly where `bend` says it is
	return { x0: x0, y0: y0, cx: cx, cy: cy, x3: x3, y3: y3,
	         d: "M" + numR(x0) + " " + numR(y0) + " Q" + numR(cx) + " " + numR(cy) + " " + numR(x3) + " " + numR(y3) }
}

function numR(v) { return Math.round(v * 10) / 10 }

// Arrowhead as its own path, so a class on the parent group restyles the line
// and its head together - an SVG marker would not inherit the highlight.
function numHead(p, size) {
	size = size || 13
	var ax = p.x3 - p.cx, ay = p.y3 - p.cy            // tangent at the end
	var l = Math.sqrt(ax * ax + ay * ay) || 1
	ax /= l; ay /= l
	var bx = -ay, by = ax
	var tipx = p.x3, tipy = p.y3
	var b1x = tipx - ax * size + bx * size * 0.42, b1y = tipy - ay * size + by * size * 0.42
	var b2x = tipx - ax * size - bx * size * 0.42, b2y = tipy - ay * size - by * size * 0.42
	return "M" + numR(tipx) + " " + numR(tipy) + "L" + numR(b1x) + " " + numR(b1y) +
	       "L" + numR(b2x) + " " + numR(b2y) + "Z"
}

// A tapered ribbon along the same curve, for the heavy currents. The reference
// draws these as broad forms that swell along their length rather than as
// thick strokes, so this builds an outline and fills it.
//
// The profile is the whole character of the thing: hairline at the tail,
// swelling to full width around three-quarters along, easing back at the head
// so the arrowhead sits on a stem rather than on a blunt end. A linear taper
// reads as a wedge, which is what the first attempt looked like.
function numRibbon(p, w0, w1) {
	var N = 40, up = [], dn = []
	for (var i = 0; i <= N; i++) {
		var t = i / N, mt = 1 - t
		var x = mt * mt * p.x0 + 2 * mt * t * p.cx + t * t * p.x3
		var y = mt * mt * p.y0 + 2 * mt * t * p.cy + t * t * p.y3
		var dx = 2 * mt * (p.cx - p.x0) + 2 * t * (p.x3 - p.cx)
		var dy = 2 * mt * (p.cy - p.y0) + 2 * t * (p.y3 - p.cy)
		var l = Math.sqrt(dx * dx + dy * dy) || 1
		var nx = -dy / l, ny = dx / l
		// swell peaking at t=0.78, never quite reaching zero at the head
		var swell = Math.pow(Math.sin(Math.min(t / 0.78, 1) * Math.PI / 2), 1.35)
		if (t > 0.78) swell = 1 - (t - 0.78) / 0.22 * 0.45
		var w = (w0 + (w1 - w0) * swell) / 2
		up.push(numR(x + nx * w) + " " + numR(y + ny * w))
		dn.unshift(numR(x - nx * w) + " " + numR(y - ny * w))
	}
	return "M" + up.join("L") + "L" + dn.join("L") + "Z"
}

// A self-loop: the little circle-and-back a zone makes when its channel or
// current returns to itself. Drawn off the zone's rim at the given angle.
// A self-returning channel: out from the rim, round, and back. The loop's
// centre sits a full radius plus the loop's own size clear of the zone, so the
// arc is tangent to the rim rather than cutting into the circle. It used to be
// placed at r + size*0.55, which put a third of the loop inside the zone.
function numLoop(z, angleDeg, size) {
	var a = angleDeg * Math.PI / 180
	var cx = z.x + Math.cos(a) * (z.r + size + 4)
	var cy = z.y + Math.sin(a) * (z.r + size + 4)
	var s = size
	var sx = cx - Math.sin(a) * s, sy = cy + Math.cos(a) * s
	var ex = cx + Math.sin(a) * s, ey = cy - Math.cos(a) * s
	return { d: "M" + numR(sx) + " " + numR(sy) +
	            " A" + s + " " + s + " 0 1 1 " + numR(ex) + " " + numR(ey),
	         x3: ex, y3: ey, cx: ex + Math.sin(a) * s * 0.6, cy: ey + Math.cos(a) * s * 0.6,
	         // the loop's own centre, pushed a little further out: where a label
	         // belongs, clear of both the loop and the zone it hangs off
	         // the gate rides the far point of its own loop
	         lx: z.x + Math.cos(a) * (z.r + size + 4),
	         ly: z.y + Math.sin(a) * (z.r + size + 4) }
}

// --------------------------------------------------------- bend per path
//
// Hand-set so the figure reads the way the reference does: long channels sweep
// wide around the empty field rather than cutting across the middle.
// Struck so the channels sweep round the field rather than cutting across the
// middle. 3->6 and 6->3 run between the same pair in opposite directions, so
// they are bowed opposite ways and do not lie on top of each other.
// 3 -> 6 arcs over the top and 6 -> 3 dips under, so Gt-6 and Gt-21 sit on
// opposite sides of that pair, as the reference has them. The 8 -> 9 run is
// short - 41 units of clear span between two big circles - so it bows well out
// or its gate cannot clear either zone.
var NUM_CHANNEL_BEND = { 0: 0, 1: 0, 2: -60, 3: 110, 4: 70, 5: -60, 6: 40, 7: 80, 8: 120, 9: 0 }

// A current links the two zones of its syzygy. The bend throws it out into the
// empty field rather than letting it run straight down the middle - which is
// what gives the reference its sweep.
// The current links its syzygy's two zones. 3::6 is bowed well clear of the
// two channels already running between those zones.
var NUM_CURRENT_BEND = { "0::9": -122, "1::8": -132, "2::7": 62, "3::6": -125, "4::5": -58 }

// The tractor line: a thin arrow off the belly of the current, running to the
// zone the current's value names. For 0::9 and 3::6 that zone is one of the
// pair itself, so it returns as a loop instead - those are the two closed
// systems, Plex and Warp.
// The thin arrow from a current's belly to the zone its value names.
var NUM_TRACTOR_BEND = { "0::9": 0, "1::8": 85, "2::7": -110, "3::6": 0, "4::5": 40 }

// ============ THE GEOCENTRIC MODEL, IN ITS OWN PANEL =====================
//
// This used to be drawn straight through the Numogram: concentric spheres
// struck from Zone-3, with ties crossing the whole figure. It was unreadable,
// and worse, it made the canonical diagram look like it had been redesigned.
//
// It now has its own composition beside the Numogram. Radial bands rather than
// concentric rings: each body gets a band of its own, so two labels can never
// land on the same circle, and the Ptolemaic order reads top to bottom without
// anything to untangle. Earth is the ground of the figure, at the foot, and
// the spheres rise from it in order.
//
// The canonical Numogram is untouched by any of this. It renders exactly as it
// does with the cosmology off.

var NUM_BAND_W = 420, NUM_BAND_H = 980
var NUM_BAND_TOP = 70, NUM_BAND_GAP = 96

// Bottom-up: Earth sits on the floor of the panel and the spheres rise.
function numBandY(order, n) {
	return NUM_BAND_H - NUM_BAND_TOP - order * NUM_BAND_GAP
}

function numogramGeoPanel() {
	if (numCosmo !== "geo" && numCosmo !== "cross") return ""
	var bodies = numCosmoBodies(numGeoSet)
	var n = bodies.length
	var h = NUM_BAND_TOP * 2 + (n - 1) * NUM_BAND_GAP
	var bandY = function (order) { return h - NUM_BAND_TOP - order * NUM_BAND_GAP }

	var o = '<svg class="numGeoSvg" id="numGeoSvg" viewBox="0 0 ' + NUM_BAND_W + ' ' + numR(h) + '" '
	o += 'role="img" aria-label="The classical geocentric order, Earth at the centre and the spheres rising outward." '
	o += 'preserveAspectRatio="xMidYMid meet">'

	var x0 = 40, x1 = NUM_BAND_W - 40, mid = NUM_BAND_W / 2

	for (var i = 0; i < n; i++) {
		var b = bodies[i]
		var y = bandY(b.order)
		var sel = (numBody === b.body)
		var isEarth = (b.order === 0)

		var g = '<g class="numBand' + (sel ? " numOn" : "") + (isEarth ? " numBandEarth" : "") +
			'" data-body="' + b.body + '" data-set="' + b.set + '" data-role="' + b.klass + '"' +
			' tabindex="0" role="button" aria-label="' + b.body + ', ' +
			(isEarth ? "the observational centre" : b.sphere + " sphere from Earth") +
			(b.zone === null ? ", no Planetwork zone" : ", Planetwork zone " + b.zone) + '">'

		// the band itself
		g += '<line class="numBandLine" x1="' + x0 + '" y1="' + numR(y) + '" x2="' + x1 + '" y2="' + numR(y) + '"/>'

		if (isEarth) {
			g += '<circle class="numBandEarthDot" cx="' + mid + '" cy="' + numR(y) + '" r="9"/>'
		} else {
			g += '<circle class="numBandMark" cx="' + mid + '" cy="' + numR(y) + '" r="7"/>'
		}

		g += '<text class="numBandName" x="' + x0 + '" y="' + numR(y - 13) + '">' + b.body + '</text>'
		g += '<text class="numBandRole" x="' + x1 + '" y="' + numR(y - 13) + '">' +
			(isEarth ? "CENTRE" : b.sphere) + '</text>'

		// In cross-map, only the selected body carries its tie, and it points
		// back toward the Numogram panel rather than crossing it.
		if (numCosmo === "cross" && sel && b.zone !== null) {
			g += '<path class="numBandTie" d="M' + (x0 - 6) + ' ' + numR(y) + 'L' + (x0 - 26) + ' ' + numR(y) + '"/>'
			g += '<text class="numBandTieText" x="' + (x0 - 32) + '" y="' + numR(y + 5) + '">ZONE ' + b.zone + '</text>'
		}

		g += '<rect class="numHit" x="' + x0 + '" y="' + numR(y - 34) + '" width="' + (x1 - x0) + '" height="68"/>'
		g += '</g>'
		o += g
	}

	o += '<text class="numBandNote" x="' + mid + '" y="' + numR(h - 16) + '">SCHEMATIC PTOLEMAIC REPRESENTATION</text>'
	o += '</svg>'
	return o
}

// ------------------------------------------------- measuring the drawing// ------------------------------------------------- measuring the drawing
//
// The viewBox used to be the nominal 800x1200 the positions were authored in,
// which left the figure sitting right of centre with dead field down one side.
// Everything drawn now reports its extent, and the viewBox is that extent plus
// one even margin - so the diagram is framed evenly however the geometry moves,
// and none of the panel's height is spent on empty canvas.

// ------------------------------------------------- gate label clearance
//
// The small gate numbers are only legible if nothing runs through them. Rather
// than eyeballing it, the routing is measured: every current, channel and
// tractor path is sampled and checked against every gate's exclusion disc.
// The test suite fails if anything crosses the line.
//
// The paths are authored by hand through the bend tables - no automatic
// routing - so when this reports a collision the fix is a bend, not a solver.

// The margin every numeral must keep from anything that is not its own line.
// Ten rather than something larger because the 8 - 9 run is intrinsically
// tight: 41 units of clear span between two big circles, and it is tight in
// the reference too. The measured worst case is 11.
var NUM_GATE_CLEAR = 10

function numSamplePath(p, n) {
	var out = []
	for (var i = 0; i <= n; i++) {
		var t = i / n, mt = 1 - t
		out.push({
			x: mt * mt * p.x0 + 2 * mt * t * p.cx + t * t * p.x3,
			y: mt * mt * p.y0 + 2 * mt * t * p.cy + t * t * p.y3
		})
	}
	return out
}

// Every path the figure draws, sampled, with what drew it.
function numogramPathSamples() {
	var out = [], i, sz, za, zb, zt, p, ch, zf, zt2
	for (i = 0; i < NUM_SYZYGIES.length; i++) {
		sz = NUM_SYZYGIES[i]
		za = numZone(sz.a); zb = numZone(sz.b); zt = numZone(numCurrent(sz))
		p = numCubic(za.x, za.y, za.r, zb.x, zb.y, zb.r, NUM_CURRENT_BEND[sz.key] || 0)
		out.push({ id: "current-" + sz.key, pts: numSamplePath(p, 48), ends: [sz.a, sz.b] })
		if (!(numCurrent(sz) === sz.a || numCurrent(sz) === sz.b)) {
			var bx = 0.25 * p.x0 + 0.5 * p.cx + 0.25 * p.x3
			var by = 0.25 * p.y0 + 0.5 * p.cy + 0.25 * p.y3
			var tp = numCubic(bx, by, 0, zt.x, zt.y, zt.r, NUM_TRACTOR_BEND[sz.key] || 0)
			// a tractor line starts on its current's belly and ends on the tractor
			// zone's rim - that zone is not named in the id, which is what made
			// the clearance check report a false collision there
			out.push({ id: "tractor-" + sz.key, pts: numSamplePath(tp, 48), ends: [numCurrent(sz)] })
		}
	}
	for (i = 0; i < NUM_CHANNELS.length; i++) {
		ch = NUM_CHANNELS[i]
		if (ch.from === ch.to) continue          // a loop stays beside its own zone
		zf = numZone(ch.from); zt2 = numZone(ch.to)
		p = numCubic(zf.x, zf.y, zf.r, zt2.x, zt2.y, zt2.r, NUM_CHANNEL_BEND[ch.from] || 0)
		out.push({ id: "channel-" + ch.from + "-" + ch.to, pts: numSamplePath(p, 48), ends: [ch.from, ch.to] })
	}
	return out
}

// Every annotated circle the figure actually draws: the nine gates. There are
// no current-value circles - the reference has none - and Zone-0's gate is not
// drawn. Each gate rides its own channel, so the check that matters is that no
// gate sits on a zone, on another gate, or on a path that is not its own.
function numogramAnnotations() {
	var out = []
	for (var i = 0; i < NUM_GATES.length; i++) {
		var z = NUM_GATES[i].zone
		if (!NUM_GATE_DRAWN[z]) continue
		out.push({ kind: "gate", zone: z, value: NUM_GATES[i].value,
		           pos: numGatePos(z), r: NUM_GATE_R })
	}
	return out
}

// The closest approach of anything to any gate numeral: paths, zone circles
// and the other gates. A gate's own channel is skipped - it rides that line by
// design, and is drawn opaque over it, exactly as the reference does.
function numogramGateClearance() {
	var paths = numogramPathSamples()
	var ann = numogramAnnotations()
	var worst = { d: 1e9, gate: null, path: null }
	var i, k, a, b
	for (a = 0; a < ann.length; a++) {
		var it = ann[a], gp = it.pos
		for (i = 0; i < paths.length; i++) {
			if (paths[i].id.indexOf("channel-" + it.zone + "-") === 0) continue
			for (k = 0; k < paths[i].pts.length; k++) {
				var dx = paths[i].pts[k].x - gp.x, dy = paths[i].pts[k].y - gp.y
				var d = Math.sqrt(dx * dx + dy * dy)
				if (d < worst.d) worst = { d: d, gate: it.value, path: paths[i].id }
			}
		}
		for (b = 0; b < ann.length; b++) {
			if (b === a) continue
			var od = Math.sqrt(Math.pow(ann[b].pos.x - gp.x, 2) + Math.pow(ann[b].pos.y - gp.y, 2)) - it.r - ann[b].r
			if (od < worst.d) worst = { d: od, gate: it.value, path: "gate-" + ann[b].value }
		}
		// and it must clear every zone circle - this is the one that was failing,
		// with 45, 0 and 9 sitting across their own zones
		for (i = 0; i < NUM_ZONES.length; i++) {
			var zd = Math.sqrt(Math.pow(NUM_ZONES[i].x - gp.x, 2) + Math.pow(NUM_ZONES[i].y - gp.y, 2)) - NUM_ZONES[i].r - it.r
			if (zd < worst.d) worst = { d: zd, gate: it.value, path: "zone-" + NUM_ZONES[i].n }
		}
	}
	return worst
}

// No drawn line may cut through a zone circle either. Paths are trimmed to the
// rim at each end, so an intrusion means a bend is carrying the curve back
// across a circle it already left.
function numogramPathZoneClearance() {
	var paths = numogramPathSamples()
	var worst = { d: 1e9, path: null, zone: null }
	for (var i = 0; i < paths.length; i++) {
		for (var z = 0; z < NUM_ZONES.length; z++) {
			var zz = NUM_ZONES[z]
			// the ends of a path legitimately touch the zones it joins
			var ends = paths[i].ends.indexOf(zz.n) !== -1
			for (var k = 0; k < paths[i].pts.length; k++) {
				if (ends && (k < 6 || k > paths[i].pts.length - 7)) continue
				var d = Math.sqrt(Math.pow(paths[i].pts[k].x - zz.x, 2) + Math.pow(paths[i].pts[k].y - zz.y, 2)) - zz.r
				if (d < worst.d) worst = { d: d, path: paths[i].id, zone: zz.n }
			}
		}
	}
	return worst
}

var numBB = null

function numBBReset() { numBB = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 } }

function numBBPt(x, y, pad) {
	if (!isFinite(x) || !isFinite(y)) return
	pad = pad || 0
	if (x - pad < numBB.x0) numBB.x0 = x - pad
	if (y - pad < numBB.y0) numBB.y0 = y - pad
	if (x + pad > numBB.x1) numBB.x1 = x + pad
	if (y + pad > numBB.y1) numBB.y1 = y + pad
}

// Sampled, not taken from the control point: a quadratic's control point sits
// well outside the curve, and using it would put slack on one side only -
// which is the very thing being fixed.
function numBBPath(p, pad) {
	for (var i = 0; i <= 8; i++) {
		var t = i / 8, mt = 1 - t
		numBBPt(mt * mt * p.x0 + 2 * mt * t * p.cx + t * t * p.x3,
		        mt * mt * p.y0 + 2 * mt * t * p.cy + t * t * p.y3, pad)
	}
}

// A loop is a circle of radius `size` centred off the zone's rim.
function numBBLoop(z, angleDeg, size, pad) {
	var a = angleDeg * Math.PI / 180
	numBBPt(z.x + Math.cos(a) * (z.r + size * 0.55),
	        z.y + Math.sin(a) * (z.r + size * 0.55), size + (pad || 0))
}

// ------------------------------------------- Anglossic Qabbala (attested)
//
// Land's mapping, unchanged: digits are themselves, A=10 ... Z=35, and a
// string is the sum of its characters. Deterministic - the same input always
// gives the same total, and nothing here is generated or guessed.
//
// What this does NOT do is claim AQ has anything to do with the Numogram.
// It computes an AQ total, and then - separately, and labelled as this
// application's own step - reduces that total to a zone.
function numAqValue(ch) {
	var c = ch.toUpperCase()
	if (c >= "0" && c <= "9") return c.charCodeAt(0) - 48
	if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55      // 'A' -> 10
	return null
}

// Strips accents so that CAFE and CAFÉ agree, which is a decision this
// application makes - AQ is defined over the 36 unaccented literals only.
function numAqNormalise(word) {
	var out = word
	if (typeof out.normalize === "function") {
		out = out.normalize("NFD").replace(/[̀-ͯ]/g, "")
	}
	return out.toUpperCase()
}

function numAqTrace(word) {
	var norm = numAqNormalise(word)
	var chars = [], total = 0, dropped = 0
	for (var i = 0; i < norm.length; i++) {
		var v = numAqValue(norm.charAt(i))
		if (v === null) { if (norm.charAt(i).trim() !== "") dropped++; continue }
		chars.push({ ch: norm.charAt(i), v: v })
		total += v
	}
	return { word: norm, chars: chars, total: total, dropped: dropped }
}

// ------------------------------------------------------------- rendering

function numogramSvg() {
	numBBReset()
	var o = ''

	// -- currents, under everything.
	//
	// Each one links the two zones of its syzygy, and carries a thin tractor
	// arrow off its belly to the zone its value names, with that value set in
	// a small circle - the 1, 3, 5, 7, 9 annotations. The Torque's three are
	// the broad forms; Warp and Plex are drawn fine, since both are closed.
	o += '<g class="numLayer numLayerCurrents">'
	for (var s = 0; s < NUM_SYZYGIES.length; s++) {
		var sz = NUM_SYZYGIES[s]
		var cur = numCurrent(sz)
		var za = numZone(sz.a), zb = numZone(sz.b), zt = numZone(cur)
		var closed = (cur === sz.a || cur === sz.b)
		var heavy = (sz.sys === "torque")
		var g = '<g class="numCurrent' + (heavy ? ' numHeavy' : '') + '" data-syzygy="' + sz.key +
			'" data-sys="' + sz.sys + '" data-current="' + cur + '">'

		// the link between the pair
		var p = numCubic(za.x, za.y, za.r, zb.x, zb.y, zb.r, NUM_CURRENT_BEND[sz.key] || 0)
		numBBPath(p, heavy ? 12 : 4)
		// a forgiving invisible stroke under the visible one
		g += '<path class="numHitLine" d="' + p.d + '"/>'
		if (heavy) {
			g += '<path class="numCurBody" d="' + numRibbon(p, 2.5, 21) + '"/>'
			g += '<path class="numCurHead" d="' + numHead(p, 20) + '"/>'
		} else {
			g += '<path class="numCurLine" d="' + p.d + '"/>'
			g += '<path class="numCurHead" d="' + numHead(p, 13) + '"/>'
		}

		// The reference labels no current, and draws a closed one as a plain link
		// between its pair with the head at the tractor end - not as a loop. The
		// value circles this used to place are not in the original at all, and
		// they were the other half of the overlap problem.

		g += '</g>'
		o += g
	}
	o += '</g>'

	// -- channels, each one a gate's course
	o += '<g class="numLayer numLayerChannels">'
	for (var c = 0; c < NUM_CHANNELS.length; c++) {
		var ch = NUM_CHANNELS[c]
		var zf = numZone(ch.from), zt2 = numZone(ch.to)
		var gg = '<g class="numChannel" data-from="' + ch.from + '" data-to="' + ch.to +
			'" data-gate="' + ch.gate + '" data-sys="' + numSyzygyOf(ch.from).sys + '">'
		if (ch.from === ch.to) {
			if (!NUM_GATE_DRAWN[ch.from]) continue     // 0 -> 0 is not drawn either
			var lp2 = numLoop(zf, NUM_LOOP_ANGLE["gate" + ch.from], 30)
			numBBLoop(zf, NUM_LOOP_ANGLE["gate" + ch.from], 30, 3)
			gg += '<path class="numHitLine" d="' + lp2.d + '"/>'
			gg += '<path class="numChLine" d="' + lp2.d + '"/>'
			gg += '<path class="numChHead" d="' + numHead(lp2, 11) + '"/>'
		} else {
			var p2 = numCubic(zf.x, zf.y, zf.r, zt2.x, zt2.y, zt2.r, NUM_CHANNEL_BEND[ch.from] || 0)
			numBBPath(p2, 4)
			gg += '<path class="numHitLine" d="' + p2.d + '"/>'
			gg += '<path class="numChLine" d="' + p2.d + '"/>'
			gg += '<path class="numChHead" d="' + numHead(p2, 12) + '"/>'
		}
		gg += '</g>'
		o += gg
	}
	o += '</g>'

	// -- gates: the small annotated circles
	o += '<g class="numLayer numLayerGates">'
	for (var gi = 0; gi < NUM_GATES.length; gi++) {
		var ga = NUM_GATES[gi]
		if (!NUM_GATE_DRAWN[ga.zone]) continue     // Gt-0 is degenerate; the reference omits it
		var gp = numGatePos(ga.zone)
		numBBPt(gp.x, gp.y, NUM_GATE_R)
		o += '<g class="numGate" data-zone="' + ga.zone + '" data-gate="' + ga.value +
			'" data-sys="' + numSyzygyOf(ga.zone).sys + '">'
		o += '<circle class="numGateRing" cx="' + numR(gp.x) + '" cy="' + numR(gp.y) + '" r="' + NUM_GATE_R + '"/>'
		o += '<text class="numGateText" x="' + numR(gp.x) + '" y="' + numR(gp.y) + '">' + ga.value + '</text>'
		o += '<circle class="numHit" cx="' + numR(gp.x) + '" cy="' + numR(gp.y) + '" r="' + (NUM_GATE_R + 7) + '"/>'
		o += '</g>'
	}
	o += '</g>'

	// Nothing cosmological is drawn here any more: the geocentric model has its
	// own panel, so the canonical viewBox is the canonical viewBox in every mode.

	// -- zones, on top, the only focusable things in the figure
	o += '<g class="numLayer numLayerZones">'
	for (var z2 = 0; z2 < NUM_ZONES.length; z2++) {
		var zz = NUM_ZONES[z2], sz2 = numSyzygy(zz.sy)
		numBBPt(zz.x, zz.y, zz.r + 3)
		var twin = (sz2.a === zz.n) ? sz2.b : sz2.a
		var dir = NUM_ZONE_MARK[zz.n]
		var np = numNumeralOffset(zz, dir)
		o += '<g class="numZone" id="numZone' + zz.n + '" data-zone="' + zz.n + '" data-sys="' + sz2.sys + '" ' +
			'tabindex="0" role="button" aria-pressed="false" ' +
			'aria-label="Zone ' + zz.n + ', syzygy ' + zz.n + ' with ' + twin + ', ' + sz2.sys + '">'
		o += '<circle class="numZoneRing" cx="' + zz.x + '" cy="' + zz.y + '" r="' + zz.r + '"/>'
		o += '<path class="numZoneMark" d="' + numMarkPath(zz, dir) + '"/>'
		o += '<text class="numZoneText" x="' + numR(np.x) + '" y="' + numR(np.y) + '" style="font-size:' + Math.round(zz.r * 0.82) + 'px">' + zz.n + '</text>'
		// The whole disc is the target, not the stroke. Transparent and drawn
		// last so it sits over the ring, the mark and the numeral; a little
		// wider than the ring for touch, but never wide enough to reach a
		// neighbour - the closest pair are 130 apart and the radii are under 55.
		o += '<circle class="numHit" cx="' + zz.x + '" cy="' + zz.y + '" r="' + (zz.r + 8) + '"/>'
		o += '</g>'
	}
	o += '</g>'

	// one even margin on every side
	var m = 18
	var vx = numR(numBB.x0 - m), vy = numR(numBB.y0 - m)
	var vw = numR(numBB.x1 - numBB.x0 + m * 2), vh = numR(numBB.y1 - numBB.y0 + m * 2)

	var head = '<svg class="numSvg" id="numSvg" viewBox="' + vx + ' ' + vy + ' ' + vw + ' ' + vh + '" '
	head += 'role="img" aria-label="The CCRU Numogram: ten zones, five syzygies, their currents, gates and channels." '
	head += 'preserveAspectRatio="xMidYMid meet">'
	return head + o + '</svg>'
}

// ------------------------------------------------------------ annotation
//
// Typography, not a panel. Four short lines in the diagram's own hand.

// One place for every piece of interaction state. Everything visible is
// derived from these by numogramApply(), so a state cannot survive a reset by
// hiding in the DOM.
var numSelected = null          // zone number, or null
var numMode = "all"             // all | torque | warp | plex
var numExplore = -1             // -1 off, else 0..3 along ZONE/SYZYGY/CURRENT/GATE
var numLayers = { zones: true, currents: true, gates: true, syzygies: true }

// How the current selection was arrived at. null when a zone was simply
// clicked; otherwise the whole derivation, so the reading can show its work.
var numDeriv = null             // {kind:"number"|"word", ...}
var numInputMode = "number"     // number | word | planet
// The five things the selector offers. "off" is the canonical Numogram and is
// the default: opening the feature shows the diagram and nothing else.
var NUM_MODELS = Object.freeze([
	Object.freeze({ key: "off",       label: "Numogram",              cosmo: "off",   set: null }),
	Object.freeze({ key: "planetwork", label: "Planetwork",           cosmo: "pw",    set: null }),
	Object.freeze({ key: "geo-classical", label: "Geocentric \u2014 Classical", cosmo: "geo", set: "classical" }),
	Object.freeze({ key: "geo-extended",  label: "Geocentric \u2014 Extended",  cosmo: "geo", set: "extended" }),
	Object.freeze({ key: "cross",     label: "Cross-map",             cosmo: "cross", set: null })
])

var numModel = "off"            // the selector's own value
var numCosmo = "off"            // off | pw | geo | cross - off is the canonical diagram
var numGeoSet = "classical"     // classical | extended
var numBody = null              // the selected celestial body, by name
var numHistory = []
var NUM_HISTORY_MAX = 8
var NUM_HISTORY_KEY = "numogramTraces"

var NUM_EXPLORE_STEPS = ["ZONE", "SYZYGY", "CURRENT", "GATE"]

// The reading. Context-sensitive: it shows what is actually being traced and
// nothing else, and every block that is not plain Numogram structure carries
// its provenance. Values come from the model; none of this is templated prose.

function numRow(k, v) {
	return '<div class="numAnnotRow"><span>' + k + '</span><span>' + v + '</span></div>'
}

// A container, not a card: one hairline rule, a small label and the values.
// No radius, no fill, no shadow - it reads as a section of a research sheet.
function numGroup(label, body, cls) {
	return '<section class="numBox' + (cls ? " " + cls : "") + '">' +
		'<h4 class="numBoxLabel">' + label + '</h4>' + body + '</section>'
}

function numStatusTag(status) {
	return '<div class="numStatus numStatus-' + status + '">' + NUM_STATUS_LABEL[status] + '</div>'
}

// The structures a zone sits in - shared by every kind of trace, because every
// trace ends at a zone.
function numZoneReading(n) {
	var sz = numSyzygyOf(n), twin = (sz.a === n) ? sz.b : sz.a
	var cur = numCurrent(sz), g = numGate(n)
	var hi = Math.max(n, twin), lo = Math.min(n, twin)
	var o = ""
	o += numGroup("ZONE", '<div class="numAnnotBig">' + n + '</div>')
	o += numGroup("SYZYGY", '<div class="numAnnotLine">' + n + " : " + twin + '</div>' +
		'<div class="numAnnotLine numAnnotFoot">' + sz.demon.toUpperCase() + " · " + sz.sys.toUpperCase() + '</div>')
	o += numGroup("ARITHMETIC",
		'<div class="numAnnotLine">' + n + " + " + twin + " = " + (n + twin) + '</div>' +
		'<div class="numAnnotLine">' + hi + " − " + lo + " = " + cur + '</div>')
	o += numGroup("STRUCTURES",
		numRow("CURRENT", sz.current + " · " + cur + " → ZONE " + cur) +
		numRow("GATE", String(g.value)) +
		numRow("CHANNEL", n + " → " + g.to))

	// The reverse direction, so the map is navigable both ways: the zone back
	// out to the body the Planetwork gives it, and - only while a cosmological
	// layer is on - that body's classical place.
	var pw = numPlanetworkZone(n)
	if (pw !== null) {
		var pbody = numRow("PLANET", pw.body) + numRow("SOL", String(pw.sol))
		if (numCosmo !== "off") {
			var pg = numGeo(pw.body)
			pbody += numRow("GEOCENTRIC", pg ? (pg.sphere + " SPHERE") : "NO CLASSICAL PLACE")
		}
		o += numGroup("CCRU PLANETWORK", pbody)
	}
	return o
}

// A celestial body's reading: its place in each system, kept apart, plus the
// Numogram relationships that follow from its zone - where it has one.
function numBodyReading(name) {
	var c = numCrossMap(name)
	var o = ""
	o += numGroup("BODY", '<div class="numAnnotBig">' + name + '</div>')

	// Earth is the centre, not a sphere from itself
	o += numGroup("GEOCENTRIC",
		numRow(c.order === 0 ? "ROLE" : "SPHERE",
			c.order === 0 ? "OBSERVATIONAL CENTRE" : (c.sphere + " FROM EARTH")) +
		numRow("ORDER", String(c.order)) +
		numRow("CLASS", c.klass.toUpperCase()))
	o += numStatusTag(c.set === "extended" ? "experimental" : "historical")
	if (c.set === "extended") {
		o += '<div class="numAnnotLine numAnnotFoot">POST-PTOLEMAIC EXTENSION &mdash; ' +
			'NOT PART OF THE CLASSICAL SYSTEM</div>'
	}

	if (c.zone === null) {
		o += numGroup("CCRU PLANETWORK",
			'<div class="numAnnotLine numAnnotIdle">NO ZONE</div>' +
			'<div class="numAnnotLine numAnnotFoot">THE PLANETWORK COUNTS OUTWARD FROM THE SUN. ' +
			'THIS BODY IS NOT ON THAT SEQUENCE, SO IT HAS NO ZONE. NONE HAS BEEN INVENTED FOR IT.</div>')
		return o
	}

	o += numGroup("CCRU PLANETWORK",
		numRow("ZONE", String(c.zone)) +
		numRow("SOL", String(c.sol)))
	o += numStatusTag("canonical")

	// order and zone are different numbers from different systems, and saying
	// so once on the face of the reading is cheaper than anyone assuming
	// otherwise
	if (c.order !== c.zone) {
		o += '<div class="numAnnotLine numAnnotFoot">GEOCENTRIC ORDER ' + c.order +
			' IS NOT ZONE ' + c.zone + '. THE TWO SYSTEMS COUNT DIFFERENT THINGS.</div>'
	}

	o += numZoneReading(c.zone)
	return o
}

function numogramAnnotate() {
	var el = document.getElementById("numAnnot")
	if (el === null) return

	// A body is a selection in its own right, and it is checked before the
	// zone is: the Moon and the fixed stars have a place in the Ptolemaic
	// cosmos and no zone in the Planetwork, so their reading has to survive
	// numSelected being null. That absence is the finding, not an empty state.
	if (numBody !== null) {
		el.innerHTML = numBodyReading(numBody)
		return
	}

	// nothing selected: the smallest possible instruction, and then out of the way
	if (numSelected === null) {
		el.innerHTML = numGroup("NUMOGRAM",
			'<div class="numAnnotLine numAnnotIdle">SELECT A ZONE OR TRACE A NUMBER</div>' +
			'<div class="numAnnotLine numAnnotIdle">ZONE → SYZYGY → CURRENT → GATE</div>')
		return
	}

	var o = ""

	if (numDeriv !== null && numDeriv.kind === "planet") {
		o += numGroup("PLANET TRACE", '<div class="numAnnotBig">' + authEscNum(numDeriv.raw) + '</div>')
	}

	if (numDeriv !== null && numDeriv.kind === "word") {
		var aq = numDeriv.aq
		o += numGroup("WORD TRACE", '<div class="numAnnotBig">' + authEscNum(numDeriv.raw) + '</div>')
		o += numStatusTag("attested")
		var cv = ""
		for (var i = 0; i < aq.chars.length; i++) {
			cv += '<span class="numChar">' + aq.chars[i].ch + '<b>' + aq.chars[i].v + '</b></span>'
		}
		o += numGroup("AQ VALUES", '<div class="numChars">' + cv + '</div>' +
			'<div class="numAnnotLine">TOTAL ' + aq.total + '</div>' +
			(aq.dropped ? '<div class="numAnnotLine numAnnotFoot">' + aq.dropped + ' CHARACTER' +
				(aq.dropped > 1 ? "S" : "") + ' OUTSIDE 0-9 A-Z IGNORED</div>' : ""))
		o += numogramReductionBlock(numDeriv)
	} else if (numDeriv !== null && numDeriv.kind === "number") {
		o += numGroup("NUMBER TRACE", '<div class="numAnnotBig">' + authEscNum(numDeriv.raw) + '</div>')
		o += numogramReductionBlock(numDeriv)
	}

	o += numZoneReading(numSelected)

	if (numExplore >= 0) {
		o += '<div class="numAnnotExp">TRACING ' + NUM_EXPLORE_STEPS[numExplore] +
			" · " + (numExplore + 1) + "/" + NUM_EXPLORE_STEPS.length + '</div>'
	}
	el.innerHTML = o
}

function numogramReductionBlock(d) {
	var body = ""
	for (var i = 0; i < d.steps.length; i++) {
		body += '<div class="numAnnotLine">' + d.steps[i].from + " = " + d.steps[i].to + '</div>'
	}
	if (!d.steps.length) body += '<div class="numAnnotLine numAnnotFoot">ALREADY A SINGLE DIGIT</div>'
	body += '<div class="numAnnotLine numAnnotHead">RESULT ' + d.result + '</div>'
	return numGroup("REDUCTION", body) + numStatusTag("experimental")
}

// --------------------------------------------------------- highlighting
//
// One function owns every visual state, so nothing can be left lit. Classes
// only - no inline style, so the stylesheet keeps control of the look.

function numogramApply() {
	// the overlay is part of the drawing, so a change of cosmology redraws it
	var geoPanel = document.getElementById("numPanelGeo")
	var want = numCosmo + "|" + numGeoSet + "|" + (numBody || "")
	if (geoPanel !== null && geoPanel.getAttribute("data-cosmo-key") !== want) {
		geoPanel.setAttribute("data-cosmo-key", want)
		geoPanel.innerHTML = numogramGeoPanel()
		geoPanel.style.display = (numCosmo === "geo" || numCosmo === "cross") ? "" : "none"
		numogramBindGeo()
	}

	var svg = document.getElementById("numSvg")
	if (svg === null) return

	svg.setAttribute("data-mode", numMode)
	svg.setAttribute("data-layer-zones", numLayers.zones ? "1" : "0")
	svg.setAttribute("data-layer-currents", numLayers.currents ? "1" : "0")
	svg.setAttribute("data-layer-gates", numLayers.gates ? "1" : "0")
	svg.setAttribute("data-layer-syzygies", numLayers.syzygies ? "1" : "0")

	var all = svg.querySelectorAll(".numZone, .numGate, .numChannel, .numCurrent")
	for (var i = 0; i < all.length; i++) {
		all[i].classList.remove("numOn", "numTwin", "numTrace")
	}
	for (var z = 0; z < NUM_ZONES.length; z++) {
		var el = document.getElementById("numZone" + NUM_ZONES[z].n)
		if (el !== null) el.setAttribute("aria-pressed", "false")
	}
	if (numSelected === null) { numogramAnnotate(); return }

	var n = numSelected, sz = numSyzygyOf(n), twin = (sz.a === n) ? sz.b : sz.a
	var cur = numCurrent(sz), g = numGate(n)

	var sel = document.getElementById("numZone" + n)
	if (sel !== null) { sel.classList.add("numOn"); sel.setAttribute("aria-pressed", "true") }
	var tw = document.getElementById("numZone" + twin)
	if (tw !== null) tw.classList.add("numTwin")
	// the tractor the current runs to, and the zone the channel lands in
	var tr = document.getElementById("numZone" + cur)
	if (tr !== null) tr.classList.add("numTrace")
	var lands = document.getElementById("numZone" + g.to)
	if (lands !== null) lands.classList.add("numTrace")

	// With a trace running, only the link being traced is lit; without one,
	// the whole relationship is. Either way nothing is hidden.
	var wantCurrent = (numExplore < 0 || numExplore >= 2)
	var wantGate = (numExplore < 0 || numExplore === 3)
	var curEl = svg.querySelector('.numCurrent[data-syzygy="' + sz.key + '"]')
	if (curEl !== null && wantCurrent) curEl.classList.add("numOn")
	var chEl = svg.querySelector('.numChannel[data-from="' + n + '"]')
	if (chEl !== null && wantGate) chEl.classList.add("numOn")
	var gEl = svg.querySelector('.numGate[data-zone="' + n + '"]')
	if (gEl !== null && wantGate) gEl.classList.add("numOn")
	if (numExplore === 0 && tw !== null) tw.classList.remove("numTwin")

	numogramAnnotate()
}

function numogramSelect(n, keepDeriv) {
	numSelected = (numSelected === n) ? null : n
	if (!keepDeriv) numDeriv = null               // a hand-picked zone is its own reading
	if (numSelected === null) numExplore = -1
	else if (numExplore >= 0) numExplore = 0      // a new zone restarts the trace
	if (numSelected !== null && !keepDeriv) {
		numHistoryAdd({ kind: "zone", raw: numSelected, result: numSelected })
		numogramWriteUrl()
	}
	numogramApply()
}

// ZONE -> SYZYGY -> CURRENT -> GATE, followed on the diagram itself. No wizard,
// no separate view: the same figure, with one link of the chain emphasised at
// a time and the rest of it still visible.
function numogramSelectBody(name) {
	numBody = (numBody === name) ? null : name
	if (numBody !== null) {
		numDeriv = null
		var c = numCrossMap(numBody)
		numSelected = c.zone          // null for the Moon and the fixed stars
	}
	numogramApply()
}

function numogramSetModel(key) {
	var m = null
	for (var i = 0; i < NUM_MODELS.length; i++) if (NUM_MODELS[i].key === key) m = NUM_MODELS[i]
	if (m === null) return
	numModel = m.key
	numCosmo = m.cosmo
	if (m.set !== null) numGeoSet = m.set
	if (numCosmo === "off" || numCosmo === "pw") numBody = null
	numogramSyncControls()
	numogramApply()
	numogramFit()
}

function numogramSetGeoSet(g) {
	numGeoSet = g
	numModel = (numCosmo === "geo") ? ("geo-" + g) : numModel
	if (numBody !== null && numGeoSet === "classical") {
		var c = numCrossMap(numBody)
		if (c.set === "extended") numBody = null
	}
	numogramSyncControls()
	numogramApply()
	numogramFit()
}

function numogramExplore() {
	if (numSelected === null) return
	numExplore = (numExplore + 1) % NUM_EXPLORE_STEPS.length
	numogramSyncControls()
	numogramApply()
}

function numogramReset() {
	numSelected = null
	numMode = "all"
	numExplore = -1
	numDeriv = null
	numBody = null
	numCosmo = "off"                 // the pure Numogram is always one click away
	numModel = "off"
	numGeoSet = "classical"
	numInputMode = "number"
	numLayers = { zones: true, currents: true, gates: true, syzygies: true }
	var inp = document.getElementById("numTraceInput")
	if (inp !== null) inp.value = ""
	var msg = document.getElementById("numTraceMsg")
	if (msg !== null) msg.textContent = ""
	numogramWriteUrl()
	numogramSyncControls()
	numogramApply()
}

function numogramSetMode(m) { numMode = m; numogramSyncControls(); numogramApply() }

function numogramToggleLayer(k) { numLayers[k] = !numLayers[k]; numogramSyncControls(); numogramApply() }

function numogramSyncControls() {
	var b = document.querySelectorAll(".numCtl[data-mode]")
	for (var i = 0; i < b.length; i++) {
		b[i].classList.toggle("numCtlOn", b[i].getAttribute("data-mode") === numMode)
		b[i].setAttribute("aria-pressed", b[i].getAttribute("data-mode") === numMode ? "true" : "false")
	}
	var ex = document.getElementById("numExploreBtn")
	if (ex !== null) {
		ex.classList.toggle("numCtlOn", numExplore >= 0)
		ex.setAttribute("aria-pressed", numExplore >= 0 ? "true" : "false")
		ex.disabled = (numSelected === null)
		ex.textContent = numExplore >= 0
			? "NEXT " + NUM_EXPLORE_STEPS[(numExplore + 1) % NUM_EXPLORE_STEPS.length]
			: "EXPLORE"
	}
	var sel = document.getElementById("numCosmoSel")
	if (sel !== null && sel.value !== numModel) sel.value = numModel
	var scope = document.getElementById("numScopeSel")
	if (scope !== null && scope.value !== numGeoSet) scope.value = numGeoSet
	// the scope control exists only while a geocentric model is chosen
	var gsRow = document.querySelector(".numGeoSetRow")
	// Cross-map draws the same body set, so it gets the scope control too.
	if (gsRow !== null) gsRow.style.display = (numCosmo === "geo" || numCosmo === "cross") ? "" : "none"

	var gn = document.getElementById("numGeoNote")
	if (gn !== null) {
		if (numCosmo === "geo" || numCosmo === "cross") {
			gn.innerHTML = '<b>GEOCENTRIC NUMOGRAM &mdash; EXPERIMENTAL COSMOLOGICAL MODEL.</b> ' +
				'An Earth-centred reconstruction after classical Ptolemaic cosmology, laid over ' +
				'the CCRU Numogram. Not an original CCRU diagram, and it leaves the arithmetic ' +
				'of the Numogram untouched. Sphere geometry is schematic, not a numerical ' +
				'reconstruction: no deferent radius, epicycle radius, equant or period is ' +
				'claimed as Ptolemy\u2019s own figure.'
		} else if (numCosmo === "pw") {
			gn.innerHTML = '<b>PLANETWORK.</b> The CCRU\u2019s own planetary association, ' +
				'Zone n to Sol-n. A labelling of the canonical zones, not a second geometry.'
		} else {
			gn.innerHTML = ""
		}
	}
	var im = document.querySelectorAll(".numCtl[data-input]")
	for (var k = 0; k < im.length; k++) {
		var on2 = im[k].getAttribute("data-input") === numInputMode
		im[k].classList.toggle("numCtlOn", on2)
		im[k].setAttribute("aria-pressed", on2 ? "true" : "false")
	}
	var l = document.querySelectorAll(".numCtl[data-layer]")
	for (var j = 0; j < l.length; j++) {
		var on = numLayers[l[j].getAttribute("data-layer")]
		l[j].classList.toggle("numCtlOn", on)
		l[j].setAttribute("aria-pressed", on ? "true" : "false")
	}
}

// ------------------------------------------------------------- tracing
//
// Both traces end the same way - a zone, and that zone's relationships - but
// they arrive there differently, and each step is kept so the reading can show
// the whole chain rather than just the answer.

// The reduction, recorded one pass at a time.
function numReduceSteps(digits) {
	var steps = [], cur = String(digits)
	while (cur.length > 1) {
		var t = 0
		for (var i = 0; i < cur.length; i++) t += +cur.charAt(i)
		steps.push({ from: cur.split("").join(" + "), to: t })
		cur = String(t)
	}
	return { steps: steps, result: +cur }
}

function numTraceNumber(raw) {
	var digits = String(raw).replace(/[^0-9]/g, "")
	if (digits === "") return { error: "ENTER DIGITS" }
	if (digits.length > 18) return { error: "TOO LONG — 18 DIGITS MAXIMUM" }
	digits = digits.replace(/^0+(?=[0-9])/, "")
	var r = numReduceSteps(digits)
	return { kind: "number", raw: digits, steps: r.steps, result: r.result, status: "experimental" }
}

// A body name, matched against the two datasets. It resolves to whichever of
// them knows the name - and says so when only one of them does.
function numTracePlanet(raw) {
	var name = String(raw).trim().toUpperCase().replace(/[^A-Z]/g, "")
	if (name === "") return { error: "ENTER A BODY NAME" }
	var c = numCrossMap(name)
	if (c.order === null && c.zone === null) {
		return { error: "NOT IN EITHER SYSTEM" }
	}
	if (c.set === "extended" && numGeoSet === "classical") {
		return { error: name + " IS POST-PTOLEMAIC — SWITCH TO EXTENDED" }
	}
	return { kind: "planet", raw: name, body: name, result: c.zone, status: "experimental" }
}

function numTraceWord(raw) {
	var word = String(raw).trim().replace(/\s+/g, " ")
	if (word === "") return { error: "ENTER A WORD" }
	if (word.length > 64) return { error: "TOO LONG — 64 CHARACTERS MAXIMUM" }
	var aq = numAqTrace(word)
	if (aq.chars.length === 0) return { error: "NO ALPHANUMERIC CHARACTERS" }
	var r = numReduceSteps(aq.total)
	return { kind: "word", raw: word, aq: aq, steps: r.steps, result: r.result, status: "experimental" }
}

// ------------------------------------------------------------ history
//
// Eight entries, kept locally, so a reading can be returned to. Deliberately
// not a dashboard: a short list of what was traced, nothing more.
function numHistoryLoad() {
	try {
		var raw = window.localStorage.getItem(NUM_HISTORY_KEY)
		numHistory = raw ? JSON.parse(raw) : []
		if (!Array.isArray(numHistory)) numHistory = []
	} catch (e) { numHistory = [] }
}

function numHistorySave() {
	try { window.localStorage.setItem(NUM_HISTORY_KEY, JSON.stringify(numHistory)) } catch (e) {}
}

function numHistoryAdd(entry) {
	numHistory = numHistory.filter(function (h) { return !(h.kind === entry.kind && h.raw === entry.raw) })
	numHistory.unshift(entry)
	if (numHistory.length > NUM_HISTORY_MAX) numHistory.length = NUM_HISTORY_MAX
	numHistorySave()
	numogramRenderHistory()
}

function numogramRenderHistory() {
	var el = document.getElementById("numHistory")
	if (el === null) return
	if (!numHistory.length) { el.innerHTML = ""; return }
	var o = '<div class="numAnnotLabel">RECENT</div>'
	for (var i = 0; i < numHistory.length; i++) {
		var h = numHistory[i]
		var label = h.kind === "zone" ? ("ZONE " + h.raw)
			: (authEscNum(h.raw) + " → " + h.result)
		o += '<button class="numHistBtn" type="button" data-i="' + i + '">' + label + '</button>'
	}
	el.innerHTML = o
}

// The panel writes a phrase someone typed, so it is escaped on the way in.
function authEscNum(v) {
	return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function numogramReplay(i) {
	var h = numHistory[i]
	if (!h) return
	if (h.kind === "zone") { numDeriv = null; numSelected = h.raw; numogramApply(); return }
	var inp = document.getElementById("numTraceInput")
	numInputMode = h.kind
	if (inp !== null) inp.value = h.raw
	numogramSyncControls()
	numogramRunTrace(true)
}

// ------------------------------------------------------- numerical input
//
// Reduction and cumulation are both canonical operations, so a number maps
// into the figure without inventing anything. Nothing here extends the system;
// it applies it. There is no authoritative CCRU procedure for turning words
// into zones, so there is no text input.

function numogramSetInputMode(m) {
	numInputMode = m
	var inp = document.getElementById("numTraceInput")
	if (inp !== null) {
		inp.value = ""
		inp.setAttribute("inputmode", m === "number" ? "numeric" : "text")
		inp.setAttribute("aria-label", m === "number"
			? "Enter a number to trace into the Numogram"
			: "Enter a word to trace into the Numogram")
	}
	var out = document.getElementById("numTraceMsg")
	if (out !== null) out.textContent = ""
	numogramSyncControls()
}

function numogramRunTrace(silent) {
	var inp = document.getElementById("numTraceInput")
	var msg = document.getElementById("numTraceMsg")
	if (inp === null) return
	var raw = inp.value

	if (raw.trim() === "") {          // empty is a clear, not an error
		numDeriv = null
		if (msg !== null) msg.textContent = ""
		numSelected = null
		numogramApply()
		return
	}

	var d = (numInputMode === "planet") ? numTracePlanet(raw)
		: (numInputMode === "word") ? numTraceWord(raw)
		: numTraceNumber(raw)
	if (d.error) {
		if (msg !== null) msg.textContent = d.error
		return
	}
	if (msg !== null) msg.textContent = ""

	numDeriv = d
	if (d.kind === "planet") {
		// a planet trace IS a body selection; the reading is the body's
		numBody = d.body
		if (numCosmo === "off") numCosmo = "cross"    // it has nowhere to show otherwise
		numogramSyncControls()
	} else {
		numBody = null
	}
	numSelected = d.result
	numExplore = -1
	if (!silent) numHistoryAdd({ kind: d.kind, raw: d.raw, result: d.result })
	numogramWriteUrl()
	numogramApply()
}

// ------------------------------------------------------- shareable state
//
// The trace goes in the query string so a particular reading can be linked to.
// Nothing here is private: it is a zone number, a number, or a word somebody
// typed in order to share it.
function numogramWriteUrl() {
	if (!window.history || !window.history.replaceState) return
	try {
		var u = new URL(window.location.href)
		u.searchParams.delete("zone"); u.searchParams.delete("number"); u.searchParams.delete("word")
		if (numDeriv !== null && numDeriv.kind === "number") u.searchParams.set("number", numDeriv.raw)
		else if (numDeriv !== null && numDeriv.kind === "word") u.searchParams.set("word", numDeriv.raw)
		else if (numSelected !== null) u.searchParams.set("zone", String(numSelected))
		window.history.replaceState(null, "", u.toString())
	} catch (e) {}
}

// Opening on a link lands in that state rather than the default view.
function numogramReadUrl() {
	try {
		var q = new URL(window.location.href).searchParams
		var w = q.get("word"), n = q.get("number"), z = q.get("zone")
		var inp = document.getElementById("numTraceInput")
		if (w !== null && w !== "") {
			numogramSetInputMode("word")
			if (inp !== null) inp.value = w.slice(0, 64)
			numogramRunTrace(true)
			return true
		}
		if (n !== null && n !== "") {
			numogramSetInputMode("number")
			if (inp !== null) inp.value = n.slice(0, 18)
			numogramRunTrace(true)
			return true
		}
		if (z !== null && /^[0-9]$/.test(z)) {
			numSelected = +z
			numDeriv = null
			numogramApply()
			return true
		}
	} catch (e) {}
	return false
}

// ------------------------------------------------------------- the panel

function numogramCorrections() {
	var o = '<div class="numNote">'
	o += '<b>On the reference.</b> The image this was drawn from is a degraded reproduction of the Numogram: '
	o += 'it carries nine zone circles rather than ten, labels two of them 1, omits Zone-7, and repeats the '
	o += 'Gt-28 annotation while omitting Gt-15 and Gt-21. Its composition and line work are followed here. '
	o += 'Its content is not &mdash; the ten zones, five syzygies, currents, gates and channels are generated from the '
	o += 'CCRU rules (nine-sum twinning, arithmetical difference, digital cumulation and reduction), so every number '
	o += 'on the figure is derived rather than placed.'
	o += '</div>'
	return o
}

function toggleNumogramMenu() {
	if (!numogramMenuOpened) {
		closeAllOpenedMenus()
		numogramMenuOpened = true

		var o = '<div class="colorControlsBG numogramBG">'
		o += '<input class="closeMenuBtn" type="button" value="&#215;" onclick="closeAllOpenedMenus()">'

		// the green field. Everything inside it is the artefact; nothing of the
		// site's chrome reaches in.
		o += '<div class="numField" id="numField" data-invert="0">'

		o += '<div class="numTitle"><span class="numTitleMain">NUMOGRAM</span><span class="numTitleSub">CCRU</span></div>'

		o += '<div class="numBody">'
		o += '<div class="numStage" id="numStage">'
		o += '<div class="numPanel numPanelMain">' + numogramSvg() + '</div>'
		o += '<div class="numPanel numPanelGeo" id="numPanelGeo"></div>'
		o += '</div>'

		o += '<div class="numSide">'
		o += '<div class="numAnnot" id="numAnnot" aria-live="polite"></div>'

		o += '<div class="numCtlRow" role="group" aria-label="Time systems">'
		o += '<button class="numCtl" type="button" data-mode="torque" aria-pressed="false" onclick="numogramSetMode(\'torque\')">TORQUE</button>'
		o += '<button class="numCtl" type="button" data-mode="warp" aria-pressed="false" onclick="numogramSetMode(\'warp\')">WARP</button>'
		o += '<button class="numCtl" type="button" data-mode="plex" aria-pressed="false" onclick="numogramSetMode(\'plex\')">PLEX</button>'
		o += '<button class="numCtl" type="button" data-mode="all" aria-pressed="true" onclick="numogramSetMode(\'all\')">ALL</button>'
		o += '</div>'

		// One selector rather than five buttons. The scope control is a second
		// select that only exists while a geocentric model is chosen, so the
		// default view carries exactly one cosmological control.
		o += '<div class="numCtlRow numCosmoRow">'
		o += '<label class="numAnnotLabel" for="numCosmoSel">COSMOLOGY</label>'
		o += '<select class="numSelect" id="numCosmoSel" onchange="numogramSetModel(this.value)">'
		for (var mi = 0; mi < NUM_MODELS.length; mi++) {
			o += '<option value="' + NUM_MODELS[mi].key + '">' + NUM_MODELS[mi].label + '</option>'
		}
		o += '</select></div>'
		o += '<div class="numCtlRow numGeoSetRow">'
		o += '<label class="numAnnotLabel" for="numScopeSel">SCOPE</label>'
		o += '<select class="numSelect" id="numScopeSel" onchange="numogramSetGeoSet(this.value)">'
		o += '<option value="classical">Classical</option>'
		o += '<option value="extended">Extended</option>'
		o += '</select></div>'
		o += '<div class="numGeoNote" id="numGeoNote"></div>'

		o += '<div class="numCtlRow" role="group" aria-label="Layers">'
		o += '<button class="numCtl" type="button" data-layer="zones" aria-pressed="true" onclick="numogramToggleLayer(\'zones\')">ZONES</button>'
		o += '<button class="numCtl" type="button" data-layer="currents" aria-pressed="true" onclick="numogramToggleLayer(\'currents\')">CURRENTS</button>'
		o += '<button class="numCtl" type="button" data-layer="gates" aria-pressed="true" onclick="numogramToggleLayer(\'gates\')">GATES</button>'
		o += '<button class="numCtl" type="button" data-layer="syzygies" aria-pressed="true" onclick="numogramToggleLayer(\'syzygies\')">SYZYGIES</button>'
		o += '</div>'

		// not layers, so not on the layer line - and keeping them apart stops
		// that row breaking mid-way in the narrow column beside the diagram
		o += '<div class="numCtlRow">'
		o += '<button class="numCtl numCtlPlain" id="numExploreBtn" type="button" aria-pressed="false" onclick="numogramExplore()">EXPLORE</button>'
		o += '<button class="numCtl numCtlPlain" type="button" onclick="numogramReset()">RESET</button>'
		o += '<button class="numCtl numCtlPlain" type="button" onclick="numogramInvert()">INVERT</button>'
		o += '</div>'

		// TRACE: one field, two modes. Enter submits, Escape clears.
		o += '<div class="numCtlRow numTraceHead"><span class="numAnnotLabel">TRACE</span>'
		o += '<button class="numCtl" type="button" data-input="number" onclick="numogramSetInputMode(&quot;number&quot;)">NUMBER</button>'
		o += '<button class="numCtl" type="button" data-input="word" onclick="numogramSetInputMode(&quot;word&quot;)">WORD</button>'
		o += '<button class="numCtl" type="button" data-input="planet" onclick="numogramSetInputMode(&quot;planet&quot;)">PLANET</button>'
		o += '</div>'
		o += '<div class="numCtlRow numNumberRow">'
		o += '<input class="numNumberInput" id="numTraceInput" type="text" inputmode="numeric" '
		o += 'autocomplete="off" spellcheck="false" maxlength="64" aria-label="Enter a number to trace into the Numogram" '
		o += 'onkeydown="numogramInputKey(event)">'
		o += '<button class="numCtl numCtlPlain" type="button" onclick="numogramRunTrace()">TRACE</button>'
		o += '</div>'
		o += '<div class="numTraceMsg" id="numTraceMsg" role="status" aria-live="polite"></div>'

		o += '<div class="numHistory" id="numHistory"></div>'
		o += '</div>' // .numSide
		o += '</div>' // .numBody

		// Provenance, folded away. Present for anyone who wants to know which
		// parts are CCRU and which are this application's; out of the way of
		// the diagram for everyone else.
		o += '<details class="numDetails"><summary>SOURCES &amp; METHOD</summary>'
		o += '<div class="numDetailsBody">'
		var keys = ["structure", "reduction", "planetwork", "aq", "bridge", "ptolemy", "crossmap"]
		for (var si = 0; si < keys.length; si++) {
			var src = NUM_SOURCES[keys[si]]
			o += '<div class="numSrc">'
			o += '<div class="numStatus numStatus-' + src.status + '">' + NUM_STATUS_LABEL[src.status] + '</div>'
			o += '<div class="numSrcClaim">' + src.claim + '</div>'
			o += '<div class="numSrcFrom">' + src.source + '</div>'
			o += '</div>'
		}
		o += '<div class="numSrc">' + numogramCorrections() + '</div>'
		o += '<div class="numSrc"><div class="numSrcClaim">'
		o += 'The Numogram is read in CCRU material as a diagrammatic system for numerical and '
		o += 'temporal relationships rather than a calculator. That framing is context, not arithmetic: '
		o += 'nothing philosophical in the sources has been turned into a rule here.'
		o += '</div></div>'
		o += '</div></details>'

		o += '</div>' // .numField

		o += '</div>'

		document.getElementById("numogramMenuArea").innerHTML = o
		numogramBind()
		numHistoryLoad()
		numogramRenderHistory()
		numogramSyncControls()
		if (!numogramReadUrl()) numogramApply()    // a linked trace opens in that state
		numogramFit()
		window.addEventListener("resize", numogramFitSoon)
	} else {
		// nothing left running behind a closed panel
		window.removeEventListener("resize", numogramFitSoon)
		if (numFitTimer !== null) { clearTimeout(numFitTimer); numFitTimer = null }
		document.getElementById("numogramMenuArea").innerHTML = ""
		numogramMenuOpened = false
		numSelected = null
		numExplore = -1
		numDeriv = null
	}
}

// The panel sits inside the calculator's own scrolling column, so a vh unit
// over-states what is free. This measures it: the diagram is given whatever is
// left after the head, the controls, the information and the note, and it is
// the diagram that flexes rather than the page that grows.
function numogramFit() {
	var f = document.getElementById("numField")
	if (f === null) return
	var host = document.getElementById("calcMain") || document.documentElement
	var area = document.getElementById("numogramMenuArea")
	var note = document.querySelector(".numNote")

	f.style.height = ""            // measure against the natural layout
	var top = area.getBoundingClientRect().top - host.getBoundingClientRect().top
	// Everything in the panel that is NOT the field - the wrapper's padding,
	// the folded sources section, margins - measured rather than guessed at.
	// It used to subtract a fixed allowance for a standing note that has since
	// moved inside the sources section, so the figure was being given several
	// hundred pixels less than it had.
	var chrome = Math.max(0, area.offsetHeight - f.offsetHeight)
	var avail = host.clientHeight - top - chrome - 14

	// A floor, so a very short window scrolls a little rather than crushing the
	// figure into illegibility; a ceiling, so a tall one does not blow it up.
	f.style.height = Math.round(Math.max(380, Math.min(avail, 1020))) + "px"

	// And the width follows from the height. The drawing is about 0.59 as wide
	// as it is tall, so on a wide monitor a full-width field is mostly dead
	// green with the figure adrift in the middle of it. Measuring the stage
	// after the height is applied gives exactly the width the diagram wants,
	// plus the column of text beside it.
	var svg = document.getElementById("numSvg")
	var stage = document.querySelector(".numStage")
	var side = document.querySelector(".numSide")
	var body = document.querySelector(".numBody")
	if (svg === null || stage === null) return

	f.style.width = ""
	var vb = svg.viewBox.baseVal
	if (!vb || !vb.height) return

	// Narrow screens stack into one column, and constraining the height there
	// only makes the field scroll inside itself - which hides the controls and
	// the reading, the two things that must stay visible. The panel grows to
	// its content instead and the page scrolls, which is the normal behaviour
	// of every other panel on the site. The no-scrolling requirement is a
	// desktop one; what must never need scrolling is the diagram itself, and
	// it does not - it is sized to the viewport by the stylesheet.
	var stacked = getComputedStyle(body).display === "block"
	if (stacked) { f.style.height = ""; return }

	var geoPanel = document.getElementById("numPanelGeo")
	var geoW = (geoPanel !== null && geoPanel.offsetWidth) ? geoPanel.offsetWidth + 22 : 0
	var drawW = stage.clientHeight * (vb.width / vb.height) + geoW
	var cs = getComputedStyle(f)
	var pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
	var gap = parseFloat(getComputedStyle(body).columnGap) || 0
	// Set as a width, not a max-width: the grey panel around it is sized to fit
	// its content, so giving the field a real width makes that frame hug the
	// green evenly instead of stretching the full width of the page with the
	// artwork floating in the middle of it.
	f.style.width = Math.round(drawW + side.offsetWidth + gap + pad) + "px"
}

var numFitTimer = null
function numogramFitSoon() {
	if (numFitTimer !== null) clearTimeout(numFitTimer)
	numFitTimer = setTimeout(function () { numFitTimer = null; numogramFit() }, 120)
}

// Enter traces, Escape clears the field and the reading.
function numogramInputKey(e) {
	if (e.key === "Enter") { e.preventDefault(); numogramRunTrace(); return }
	if (e.key === "Escape" || e.key === "Esc") {
		e.preventDefault()
		e.target.value = ""
		numDeriv = null
		numSelected = null
		var msg = document.getElementById("numTraceMsg")
		if (msg !== null) msg.textContent = ""
		numogramWriteUrl()
		numogramApply()
	}
}

function numogramInvert() {
	var f = document.getElementById("numField")
	if (f === null) return
	f.setAttribute("data-invert", f.getAttribute("data-invert") === "1" ? "0" : "1")
}

// Delegated, so the handlers survive the panel being rebuilt and there is one
// listener rather than thirty.
// Split out because the SVG is rebuilt whenever the cosmological layer
// changes, and its handlers have to come back with it.
// The single entry point for selection. Returns true if it acted.
function numogramActivate(target) {
	if (!target || !target.closest) return false
	var b = target.closest(".numGeoBody")
	if (b !== null) { numogramSelectBody(b.getAttribute("data-body")); return true }
	var g = target.closest(".numZone")
	if (g !== null) { numogramSelect(+g.getAttribute("data-zone")); return true }
	// a gate or a current selects the zone it belongs to - they are readings
	// of that zone, so there is nothing separate to select
	var ga = target.closest(".numGate")
	if (ga !== null) { numogramSelect(+ga.getAttribute("data-zone")); return true }
	var c = target.closest(".numCurrent")
	if (c !== null) {
		var sz = numSyzygy(c.getAttribute("data-syzygy"))
		if (sz !== null) { numogramSelect(sz.a); return true }
	}
	var ch = target.closest(".numChannel")
	if (ch !== null) { numogramSelect(+ch.getAttribute("data-from")); return true }
	return false
}

// The geocentric panel is replaced whenever the model changes, so its
// handlers go back on with it. Same single entry point.
function numogramBindGeo() {
	var g = document.getElementById("numGeoSvg")
	if (g === null) return
	g.addEventListener("click", function (e) {
		var b = e.target.closest(".numBand")
		if (b !== null) numogramSelectBody(b.getAttribute("data-body"))
	})
	g.addEventListener("keydown", function (e) {
		if (e.key === "Escape" || e.key === "Esc") {
			e.preventDefault()
			numSelected = null; numExplore = -1; numBody = null
			numogramSyncControls(); numogramApply()
			return
		}
		if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return
		var b = e.target.closest(".numBand")
		if (b !== null) { e.preventDefault(); numogramSelectBody(b.getAttribute("data-body")) }
	})
}

function numogramBindSvg() {
	var svg = document.getElementById("numSvg")
	if (svg === null) return
	// One route in, whatever the input was: pointer, touch and keyboard all
	// come through numogramActivate so they cannot drift apart.
	svg.addEventListener("click", function (e) { numogramActivate(e.target) })
	svg.addEventListener("keydown", function (e) {
		if (e.key === "Escape" || e.key === "Esc") {
			e.preventDefault()
			numSelected = null; numExplore = -1; numBody = null
			numogramSyncControls(); numogramApply()
			return
		}
		if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return
		if (numogramActivate(e.target)) e.preventDefault()
	})
}

function numogramBind() {
	var hist = document.getElementById("numHistory")
	if (hist !== null) {
		hist.addEventListener("click", function (e) {
			var b = e.target.closest(".numHistBtn")
			if (b !== null) numogramReplay(+b.getAttribute("data-i"))
		})
	}
	numogramBindSvg()
}
