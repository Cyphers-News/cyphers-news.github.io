// ================ Account features: entries, submissions, ================
// ================ leaderboard and avatar upload          ================
//
// Everything here needs a signed-in user. Nothing runs for anonymous visitors.
//
// Publishing is deliberate and per phrase: saving to your history is private,
// submitting one is a separate act. Nothing you decode becomes visible to
// anyone else unless you submit it.

// ---- searching your own saved entries ---------------------------------

// Searches history_entries, which RLS already restricts to the caller, so no
// user id needs to be trusted from the client. The term is passed as a bound
// parameter by PostgREST, not interpolated into SQL.
function entriesSearch(term, limit) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.resolve([])

	var q = client.from("history_entries").select("id, phrase, created_at")
	term = String(term || "").trim()
	if (term !== "") {
		// escape the LIKE wildcards so a literal % or _ searches for itself
		var safe = term.replace(/[%_\\]/g, function (c) { return "\\" + c })
		q = q.ilike("phrase", "%" + safe + "%")
	}
	return q.order("created_at", { ascending: false }).limit(limit || 100)
		.then(function (res) {
			if (res.error) throw res.error
			return res.data || []
		})
}

function entriesDelete(id) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.reject(new Error("Not signed in"))
	return client.from("history_entries").delete().eq("id", id)
		.then(function (res) { if (res.error) throw res.error; return true })
}

// ---- submissions ------------------------------------------------------

function submissionsList(limit) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.resolve([])
	return client.from("phrase_submissions")
		.select("id, phrase, created_at")
		.eq("user_id", authUser.id)
		.order("created_at", { ascending: false })
		.limit(limit || 200)
		.then(function (res) {
			if (res.error) throw res.error
			return res.data || []
		})
}

function submissionSubmit(phrase) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.reject(new Error("Not signed in"))
	phrase = String(phrase || "").trim()
	if (phrase === "") return Promise.reject(new Error("Nothing to submit"))
	if (phrase.length > 500) return Promise.reject(new Error("That phrase is too long to submit"))

	return client.from("phrase_submissions")
		.insert({ user_id: authUser.id, phrase: phrase })
		.then(function (res) {
			if (res.error) {
				// the unique index is what enforces one submission per phrase
				if ((res.error.message || "").toLowerCase().indexOf("duplicate") > -1) {
					throw new Error("You have already submitted that phrase")
				}
				throw res.error
			}
			return true
		})
}

function submissionWithdraw(id) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.reject(new Error("Not signed in"))
	return client.from("phrase_submissions").delete().eq("id", id)
		.then(function (res) { if (res.error) throw res.error; return true })
}

// which of these phrases has the user already submitted, so the UI can show
// the right state without a request per row
function submissionsFor(phrases) {
	var client = getAuthClient()
	if (client === null || authUser === null || !phrases.length) return Promise.resolve({})
	return client.from("phrase_submissions")
		.select("id, phrase")
		.eq("user_id", authUser.id)
		.in("phrase", phrases)
		.then(function (res) {
			if (res.error) return {}
			var map = {}
			;(res.data || []).forEach(function (r) { map[r.phrase] = r.id })
			return map
		})
}

// ---- leaderboard ------------------------------------------------------

// Reads the leaderboard view, which exposes display name, avatar and counts
// and never touches email.
function leaderboardTop(limit) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.resolve([])
	return client.from("leaderboard").select("*").limit(limit || 25)
		.then(function (res) {
			if (res.error) throw res.error
			return res.data || []
		})
}

// A contributor's published phrases. Only ever returns submitted rows, so a
// private history entry can never appear here.
function leaderboardPhrases(userId, limit) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.resolve([])
	return client.from("phrase_submissions")
		.select("phrase, created_at")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(limit || 50)
		.then(function (res) {
			if (res.error) throw res.error
			return res.data || []
		})
}

// ---- avatar upload ----------------------------------------------------

var AVATAR_MAX_BYTES = 2 * 1024 * 1024
var AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

// Checked here for a fast, friendly error; the bucket enforces both limits
// again server-side, so a crafted request cannot bypass them.
function avatarValidate(file) {
	if (!file) return "Choose an image first."
	if (AVATAR_TYPES.indexOf(file.type) === -1) return "Use a PNG, JPEG, WebP or GIF."
	if (file.size > AVATAR_MAX_BYTES) return "That image is over 2 MB."
	return null
}

function avatarUpload(file) {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.reject(new Error("Not signed in"))

	var problem = avatarValidate(file)
	if (problem) return Promise.reject(new Error(problem))

	// stored under a folder named after the uid, which is what the storage
	// policy pins writes to; the timestamp busts any cached copy
	var ext = (file.type.split("/")[1] || "png").replace("jpeg", "jpg")
	var path = authUser.id + "/avatar-" + Date.now() + "." + ext

	return client.storage.from("avatars")
		.upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type })
		.then(function (res) {
			if (res.error) throw res.error
			var pub = client.storage.from("avatars").getPublicUrl(path)
			var url = pub.data.publicUrl
			return updateProfile({ avatar_url: url }).then(function () {
				avatarCleanupOld(path)
				return url
			})
		})
}

function avatarRemove() {
	var client = getAuthClient()
	if (client === null || authUser === null) return Promise.reject(new Error("Not signed in"))
	return updateProfile({ avatar_url: null }).then(function () {
		avatarCleanupOld(null) // nothing to keep, drop them all
		return true
	})
}

// Deletes the user's older avatar files so the bucket does not accumulate one
// image per upload. Failure here is not worth surfacing.
function avatarCleanupOld(keepPath) {
	var client = getAuthClient()
	if (client === null || authUser === null) return
	client.storage.from("avatars").list(authUser.id, { limit: 100 })
		.then(function (res) {
			if (res.error || !res.data) return
			var doomed = res.data
				.map(function (f) { return authUser.id + "/" + f.name })
				.filter(function (p) { return p !== keepPath })
			if (doomed.length) client.storage.from("avatars").remove(doomed)
		})
		.catch(function () { /* housekeeping only */ })
}
