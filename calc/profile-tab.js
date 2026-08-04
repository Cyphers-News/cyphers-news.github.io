// ========================= Profile tab ============================
//
// Top-level panel for account features: your saved entries, phrases you have
// published, and the contributor leaderboard.
//
// Signed-out visitors get a sign-in prompt rather than a broken panel; the
// calculator itself never requires an account.

var profileMenuOpened = false
var profileTabActive = "presets" // presets first: it is the tab you act from
var profileSubmitMap = {}   // phrase -> submission id, for rows already published

function toggleProfileMenu() {
	if (!profileMenuOpened) {
		closeAllOpenedMenus()
		profileMenuOpened = true
		renderProfilePanel()
	} else {
		document.getElementById("profileMenuArea").innerHTML = ""
		profileMenuOpened = false
	}
}

function profileSetTab(tab) {
	profileTabActive = tab
	renderProfilePanel()
}

function renderProfilePanel() {
	var area = document.getElementById("profileMenuArea")
	if (area === null) return

	var o = '<div class="colorControlsBG profileBG">'
	o += '<input class="closeMenuBtn" type="button" value="&#215;" onclick="closeAllOpenedMenus()">'

	if (typeof authUser === "undefined" || authUser === null) {
		o += '<div class="profileSignedOut">'
		o += '<div class="profileSignedOutTitle">Sign in to use your profile &mdash; it\'s <span class="authFree">FREE</span></div>'
		o += '<div class="profileSignedOutText">Saved entries, submissions and the leaderboard need an account. '
		o += 'No cost, no card, <b>cancel anytime</b> &mdash; and the calculator itself stays free to use without one.</div>'
		o += '<div class="profileSignedOutBtns">'
		o += '<a class="intBtn3 profileCta" href="login.html">Sign in</a>'
		o += '<a class="intBtn3 profileCta profileCtaPrimary" href="register.html">Create an account</a>'
		o += '</div></div></div>'
		area.innerHTML = o
		return
	}

	o += '<div class="profileTabs">'
	o += profileTabBtn("presets", "✅ Presets")
	o += profileTabBtn("entries", "💾 Saved")
	o += profileTabBtn("csv", "📄 CSV")
	o += profileTabBtn("chart", "🔮 Chart")
	o += profileTabBtn("submissions", "📤 Submit")
	o += profileTabBtn("leaderboard", "🏆 Leaderboard")
	o += profileTabBtn("account", "⚙ Account")
	o += '</div>'

	o += '<div id="profileBody" class="profileBody"><div class="profileLoading">Loading…</div></div>'
	o += '</div>'
	area.innerHTML = o

	// anything still in flight from the previous tab is now stale
	profileRenderSeq++

	if (profileTabActive === "entries") renderProfileEntries()
	else if (profileTabActive === "presets") renderProfilePresets()
	else if (profileTabActive === "csv") renderProfileCsv()
	else if (profileTabActive === "chart") renderProfileChart()
	else if (profileTabActive === "submissions") renderProfileSubmissions()
	else if (profileTabActive === "leaderboard") renderProfileLeaderboard()
	else renderProfileAccount()
}

function profileTabBtn(id, label) {
	var on = (profileTabActive === id) ? " profileTabOn" : ""
	return '<input class="intBtn3 profileTab'+on+'" type="button" value="'+label+'" onclick="profileSetTab(&quot;'+id+'&quot;)">'
}

// Every tab loads over the network, so a slow tab's response can land after
// the user has already moved to another one and paint the wrong content into
// it. Each render is stamped with the tab that started it, and a write is
// dropped if that is no longer the tab on screen.
var profileRenderSeq = 0

function profileBody(html, token) {
	if (token !== undefined && token !== profileRenderSeq) return // stale response
	var el = document.getElementById("profileBody")
	if (el !== null) el.innerHTML = html
}

function profileErr(err) {
	var m = (err && err.message) ? err.message : String(err)
	if (m.indexOf("does not exist") > -1 || m.indexOf("schema cache") > -1) {
		return '<div class="profileNote profileWarn">This feature needs its database migration to be run. See AUTH-SETUP.md.</div>'
	}
	return '<div class="profileNote profileWarn">'+authEsc(m)+'</div>'
}

// ---- saved entries ----------------------------------------------------

function renderProfileEntries() {
	var tok = profileRenderSeq
	var term = ""
	var box = document.getElementById("profileSearch")
	if (box !== null) term = box.value

	entriesSearch(term, 200).then(function (rows) {
		var o = ''
		o += '<div class="profileSearchRow">'
		o += '<input type="text" id="profileSearch" class="profileSearchInput" placeholder="Search your saved phrases…" value="'+authEsc(term)+'" oninput="profileSearchDebounced()">'
		o += '<span class="profileCount">'+rows.length+(rows.length === 200 ? "+" : "")+'</span>'
		o += '</div>'

		if (rows.length === 0) {
			o += '<div class="profileNote">'+(term ? "Nothing matches that." : "No saved phrases yet. Anything you enter in the calculator is saved here automatically.")+'</div>'
			profileBody(o, tok)
			return
		}

		var phrases = rows.map(function (r) { return r.phrase })
		submissionsFor(phrases).then(function (map) {
			profileSubmitMap = map
			o += '<div class="profileList">'
			rows.forEach(function (r) {
				var published = map[r.phrase] !== undefined
				var refused = profileSubmitRejected[r.phrase]
				o += '<div class="profileRow'+(refused ? ' profileRowRefused' : '')+'">'
				o += '<span class="profileRowPhrase" onclick="profileUsePhrase(&quot;'+authEsc(r.phrase).replace(/"/g,'&quot;')+'&quot;)" title="Send to the calculator">'+authEsc(r.phrase)+'</span>'
				o += '<span class="profileRowActions">'
				if (published) {
					o += '<span class="profileBadge profileBadgeOk">published</span>'
				} else if (refused) {
					o += '<span class="profileBadge profileBadgeBad" title="'+authEsc(refused)+'">blocked</span>'
				} else {
					o += '<button class="profileMiniBtn" onclick="profileSubmit(&quot;'+authEsc(r.phrase).replace(/"/g,'&quot;')+'&quot;)" title="Publish this phrase to the leaderboard">Submit</button>'
				}
				o += '<button class="profileMiniBtn profileMiniDanger" onclick="profileDeleteEntry(&quot;'+r.id+'&quot;,&quot;'+authEsc(r.phrase).replace(/"/g,'&quot;')+'&quot;)" title="Remove from your saved history">&#215;</button>'
				o += '</span>'
				if (refused) o += '<div class="profileRowWhy">'+authEsc(refused)+'</div>'
				o += '</div>'
			})
			o += '</div>'
			o += '<div class="profileNote profileFoot">Saving is private. A phrase is only visible to others once you press Submit.'
			o += ' Phrases already in the database, or already published by someone else, cannot be submitted.</div>'
			profileBody(o, tok)
		})
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

var profileSearchTimer = null
function profileSearchDebounced() {
	clearTimeout(profileSearchTimer)
	profileSearchTimer = setTimeout(renderProfileEntries, 250)
}

// Loads a phrase into the input and stops there.
//
// It used to recompute the enabled-cipher summary and the word breakdown as
// well, which rewrote the workspace to describe a phrase the user had only
// clicked on, not entered. Nothing is committed until they press Enter, so
// nothing else should move: the history table, its Find Matches ordering and
// the current breakdown all stay exactly as they were.
function profileUsePhrase(p) {
	var box = document.getElementById("phraseBox")
	if (box === null) return
	box.value = p
	closeAllOpenedMenus() // so the box is reachable to press Enter in
	box.focus()
	box.select()
	displayCalcNotification("Loaded: " + p + " — press Enter to add it", 2200)
}

// Deleting the row on its own does not stick. The sync mirrors the local
// history table up to the server, so a phrase still sitting in sHistory is
// simply re-uploaded on the next pass and the entry reappears - which is why
// saved entries could not be deleted at all. Clearing histSyncLastHash made it
// worse by forcing that pass to run immediately.
//
// So the phrase goes from the local history first, and the row follows.
function profileDeleteEntry(id, phrase) {
	if (typeof sHistory !== "undefined" && phrase !== undefined) {
		var keep = []
		for (var i = 0; i < sHistory.length; i++) {
			if (sHistory[i] !== phrase) keep.push(sHistory[i])
		}
		if (keep.length !== sHistory.length) {
			sHistory = keep
			if (typeof updateHistoryTable === "function") updateHistoryTable()
		}
	}
	entriesDelete(id).then(function () {
		renderProfileEntries()
	}).catch(function (err) { profileBody(profileErr(err)) })
}

// phrase -> why it was refused, so the row can stay red after the re-render
var profileSubmitRejected = {}

function profileSubmit(phrase) {
	delete profileSubmitRejected[phrase]
	submissionSubmit(phrase).then(function () {
		displayCalcNotification("Submitted to the leaderboard", 1800)
		renderProfileEntries()
	}).catch(function (err) {
		var msg = err.message || "Could not submit"
		// A refusal is a rule, not a glitch: mark the row red and say why, rather
		// than only flashing a notification that is gone a second later.
		profileSubmitRejected[phrase] = msg
		displayCalcNotification(msg, 2600)
		renderProfileEntries()
	})
}

// ---- presets ----------------------------------------------------------
//
// A preset is a whole named setup - which cyphers are enabled, their colours,
// any custom cyphers, and the code rain style and settings - saved so it can
// be switched back to in one click.

function renderProfilePresets() {
	var tok = profileRenderSeq
	presetsList().then(function (rows) {
		var o = ''
		o += '<div class="profileNote">A preset stores your enabled cyphers, colours, custom cyphers and code rain settings under a name. Loading one replaces what you have open now.</div>'

		o += '<div class="profileSearchRow">'
		o += '<input type="text" id="presetName" class="profileSearchInput" maxlength="60" placeholder="Name this setup&hellip;" onkeydown="if(event.key===\'Enter\'){profilePresetSave();return false}">'
		o += '<button class="profileMiniBtn" onclick="profilePresetSave()" title="Save the current setup under this name">Save</button>'
		o += '</div>'

		if (rows.length === 0) {
			o += '<div class="profileNote">No presets yet. Set the calculator up how you like it, type a name above and press Save.</div>'
			profileBody(o, tok); return
		}

		o += '<div class="profileList">'
		rows.forEach(function (r) {
			o += '<div class="profileRow">'
			o += '<span class="profileRowPhrase" onclick="profilePresetLoad(&quot;'+r.id+'&quot;)" title="Load this preset">'+authEsc(r.name)+'</span>'
			o += '<span class="profileRowActions">'
			o += '<span class="profileWhen">'+new Date(r.updated_at).toLocaleDateString()+'</span>'
			o += '<button class="profileMiniBtn" onclick="profilePresetLoad(&quot;'+r.id+'&quot;)">Load</button>'
			o += '<button class="profileMiniBtn" onclick="profilePresetOverwrite(&quot;'+authEsc(r.name).replace(/"/g,'&quot;')+'&quot;)" title="Replace this preset with the current setup">Overwrite</button>'
			o += '<button class="profileMiniBtn profileMiniDanger" onclick="profilePresetDelete(&quot;'+r.id+'&quot;,&quot;'+authEsc(r.name).replace(/"/g,'&quot;')+'&quot;)" title="Delete this preset">&#215;</button>'
			o += '</span></div>'
		})
		o += '</div>'
		profileBody(o, tok)
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

function profilePresetSave() {
	var box = document.getElementById("presetName")
	var name = (box === null) ? "" : box.value.trim()
	if (name === "") { displayCalcNotification("Give the preset a name", 1800); return }
	presetSave(name).then(function (what) {
		displayCalcNotification(what === "updated" ? "Preset updated" : "Preset saved", 1800)
		renderProfilePresets()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not save the preset", 2400)
	})
}

function profilePresetOverwrite(name) {
	presetSave(name).then(function () {
		displayCalcNotification("Preset updated", 1800)
		renderProfilePresets()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not save the preset", 2400)
	})
}

// Loading rebuilds the whole calculator, which tears down and redraws the menu
// panel - so the profile panel is reopened afterwards rather than left as a
// stale fragment of the old DOM.
function profilePresetLoad(id) {
	presetLoad(id).then(function (name) {
		displayCalcNotification("Loaded preset: " + name, 2000)
		profileMenuOpened = false
		toggleProfileMenu()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not load the preset", 2400)
	})
}

function profilePresetDelete(id, name) {
	if (!window.confirm('Delete the preset "' + name + '"?')) return
	presetDelete(id).then(renderProfilePresets)
		.catch(function (err) { profileBody(profileErr(err), tok) })
}

// ---- my submissions ---------------------------------------------------

function renderProfileSubmissions() {
	var tok = profileRenderSeq
	submissionsList(200).then(function (rows) {
		var o = ''
		o += '<div class="profileNote">Phrases you have published. Everyone signed in can see these, along with your display name.</div>'
		if (rows.length === 0) {
			o += '<div class="profileNote">Nothing published yet. Submit a phrase from the Saved Entries tab.</div>'
			profileBody(o, tok); return
		}
		o += '<div class="profileList">'
		rows.forEach(function (r) {
			o += '<div class="profileRow">'
			o += '<span class="profileRowPhrase" onclick="profileUsePhrase(&quot;'+authEsc(r.phrase).replace(/"/g,'&quot;')+'&quot;)">'+authEsc(r.phrase)+'</span>'
			o += '<span class="profileRowActions">'
			o += '<span class="profileWhen">'+new Date(r.created_at).toLocaleDateString()+'</span>'
			o += '<button class="profileMiniBtn profileMiniDanger" onclick="profileWithdraw(&quot;'+r.id+'&quot;)" title="Withdraw this submission">Withdraw</button>'
			o += '</span></div>'
		})
		o += '</div>'
		profileBody(o, tok)
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

function profileWithdraw(id) {
	submissionWithdraw(id).then(renderProfileSubmissions)
		.catch(function (err) { profileBody(profileErr(err), tok) })
}

// ---- leaderboard ------------------------------------------------------

function renderProfileLeaderboard() {
	var tok = profileRenderSeq
	leaderboardTop(25).then(function (rows) {
		var o = ''
		o += '<div class="profileNote">Top contributors by phrases published. Display names only &mdash; email addresses are never shown.</div>'
		if (rows.length === 0) {
			o += '<div class="profileNote">Nobody has published a phrase yet. Be the first.</div>'
			profileBody(o, tok); return
		}
		o += '<div class="profileList">'
		rows.forEach(function (r, i) {
			var av = r.avatar
				? '<img class="profileLbAvatar" src="'+authEsc(r.avatar)+'" alt="">'
				: '<span class="profileLbAvatar profileLbFallback">'+authEsc(String(r.display_name).charAt(0).toUpperCase())+'</span>'
			o += '<div class="profileRow profileLbRow" onclick="profileShowContributor(&quot;'+r.user_id+'&quot;, &quot;'+authEsc(r.display_name).replace(/"/g,'&quot;')+'&quot;)">'
			o += '<span class="profileLbRank">'+(i+1)+'</span>'
			o += av
			o += '<span class="profileRowPhrase">'+authEsc(r.display_name)+'</span>'
			o += '<span class="profileRowActions"><span class="profileBadge">'+r.submissions+'</span></span>'
			o += '</div>'
		})
		o += '</div>'
		o += '<div id="profileContributor"></div>'
		profileBody(o, tok)
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

function profileShowContributor(userId, name) {
	var host = document.getElementById("profileContributor")
	if (host === null) return
	host.innerHTML = '<div class="profileLoading">Loading…</div>'
	leaderboardPhrases(userId, 50).then(function (rows) {
		var o = '<div class="profileContribBox">'
		o += '<div class="profileContribTitle">Published by '+authEsc(name)+'</div>'
		if (rows.length === 0) o += '<div class="profileNote">Nothing to show.</div>'
		else {
			o += '<div class="profileChips">'
			rows.forEach(function (r) {
				o += '<span class="profileChip" onclick="profileUsePhrase(&quot;'+authEsc(r.phrase).replace(/"/g,'&quot;')+'&quot;)" title="Send to the calculator">'+authEsc(r.phrase)+'</span>'
			})
			o += '</div>'
		}
		o += '</div>'
		host.innerHTML = o
	}).catch(function (err) { host.innerHTML = profileErr(err) })
}

// ---- account ----------------------------------------------------------

function renderProfileAccount() {
	var av = authAvatarUrl()
	var o = ''
	// The picture is a button. Clicking it opens the choices; the file input
	// itself is never on show, because "Choose file / no file chosen" is the
	// browser's widget, not ours, and it says nothing useful sitting there.
	o += '<div class="profileAccountHead">'
	o += '<button type="button" class="profileAvatarPick" onclick="profileAvatarMenu(true)" title="Change your picture">'
	o += av ? '<img class="profileBigAvatar" src="'+authEsc(av)+'" alt="">'
	        : '<div class="profileBigAvatar profileLbFallback">'+authEsc(authDisplayName().charAt(0).toUpperCase())+'</div>'
	o += '<span class="profileAvatarOverlay">Change</span>'
	o += '</button>'
	o += '<div><div class="profileAccountName">'+authEsc(authDisplayName())+'</div>'
	o += '<div class="profileAccountSub">'+authEsc(authUser.email || "Discord account")+'</div></div>'
	o += '</div>'

	// hidden until the picture is clicked
	o += '<div id="profileAvatarOpts" class="profileAvatarOpts hideValue">'
	o += '<div class="profileNote">PNG, JPEG, WebP or GIF. Large photos are resized for you.</div>'
	o += '<div class="profileAvatarRow">'
	o += '<button class="profileMiniBtn" id="profileAvatarBtn" onclick="profileAvatarBrowse()">Upload a picture</button>'
	if (authProfile && authProfile.avatar_url) {
		o += '<button class="profileMiniBtn profileMiniDanger" onclick="profileAvatarRemove()">Remove current</button>'
	}
	o += '<button class="profileMiniBtn" onclick="profileAvatarMenu(false)">Cancel</button>'
	o += '</div></div>'
	o += '<input type="file" id="profileAvatarFile" accept="image/png,image/jpeg,image/webp,image/gif" class="hideValue" onchange="profileAvatarPickAndUpload()">'
	o += '<div id="profileAvatarMsg" class="profileNote hideValue"></div>'

	// display name lives here now that the panel is the whole profile, rather
	// than sending people off to a separate page for one field
	o += '<div class="profileNameRow">'
	o += '<label class="contactLabel" for="profileDisplayName">Display name</label>'
	o += '<div class="profileSearchRow">'
	o += '<input type="text" id="profileDisplayName" class="profileSearchInput" maxlength="32" placeholder="Shown on the leaderboard" value="'+authEsc((authProfile && authProfile.username) ? authProfile.username : "")+'">'
	o += '<button class="profileMiniBtn" onclick="profileSaveName()">Save</button>'
	o += '</div>'
	o += '<div id="profileNameMsg" class="profileNote hideValue"></div>'
	o += '</div>'

	// Closing the account. Deliberately last, visually separated, and asks for
	// the word to be typed rather than relying on a single click - this cannot
	// be undone and there is no backup to restore from.
	o += '<div class="profileDanger">'
	o += '<div class="profileDangerTitle">Close your account</div>'
	o += '<div class="profileNote">This permanently deletes your account and everything attached to it: your email and login, saved history, workspace, presets, published phrases and profile picture. It cannot be undone.</div>'
	o += '<div class="profileDangerRow">'
	o += '<input type="text" id="profileDeleteConfirm" class="profileSearchInput" placeholder="Type DELETE to confirm" autocomplete="off" spellcheck="false" oninput="profileDeleteGate()">'
	o += '<button class="profileMiniBtn profileMiniDanger" id="profileDeleteBtn" onclick="profileDeleteAccount()" disabled>Delete my account</button>'
	o += '</div>'
	o += '<div id="profileDeleteMsg" class="profileNote hideValue"></div>'
	o += '</div>'

	profileBody(o)
}

// The button only wakes up once the word is typed exactly.
function profileDeleteGate() {
	var box = document.getElementById("profileDeleteConfirm")
	var btn = document.getElementById("profileDeleteBtn")
	if (box === null || btn === null) return
	btn.disabled = (box.value.trim().toUpperCase() !== "DELETE")
}

function profileDeleteAccount() {
	var box = document.getElementById("profileDeleteConfirm")
	if (box === null || box.value.trim().toUpperCase() !== "DELETE") return
	if (!window.confirm("Permanently delete your account and all of its data?\n\nThis cannot be undone.")) return

	var btn = document.getElementById("profileDeleteBtn")
	var msg = document.getElementById("profileDeleteMsg")
	if (btn !== null) btn.disabled = true
	if (msg !== null) {
		msg.className = "profileNote"
		msg.textContent = "Deleting…"
		msg.classList.remove("hideValue")
	}

	accountDelete().then(function () {
		window.location.href = "index.html"
	}).catch(function (err) {
		if (msg !== null) {
			msg.className = "profileNote profileWarn"
			msg.textContent = (err && err.message) ? err.message : "Could not delete the account"
		}
		if (btn !== null) btn.disabled = false
	})
}

// Shows or hides the picture options. They start hidden so the account tab is
// just the picture and the name until you ask to change it.
function profileAvatarMenu(show) {
	var el = document.getElementById("profileAvatarOpts")
	if (el !== null) el.classList.toggle("hideValue", !show)
}

function profileAvatarBrowse() {
	document.getElementById("profileAvatarFile").click()
}

// Picking a file uploads it. Choosing a picture and then having to press a
// second button is a step with no decision in it.
function profileAvatarPickAndUpload() {
	var f = document.getElementById("profileAvatarFile").files[0]
	if (!f) return
	profileAvatarUpload()
}

// Saves the name shown on the leaderboard and beside the avatar.
function profileSaveName() {
	var box = document.getElementById("profileDisplayName")
	var msg = document.getElementById("profileNameMsg")
	if (box === null) return
	var show = function (t, warn) {
		msg.className = "profileNote" + (warn ? " profileWarn" : " profileOk")
		msg.textContent = t
		msg.classList.remove("hideValue")
	}
	var name = box.value.trim()
	if (name.length > 0 && (name.length < 2 || name.length > 32)) {
		show("Use between 2 and 32 characters.", true); return
	}
	updateProfile({ username: name === "" ? null : name }).then(function () {
		show("Saved.", false)
		renderAuthNav()
	}).catch(function (err) {
		var m = (err && err.message) ? err.message : "Could not save"
		if (m.toLowerCase().indexOf("duplicate") > -1) m = "That name is taken."
		show(m, true)
	})
}

function profileAvatarUpload() {
	var f = document.getElementById("profileAvatarFile").files[0]
	var msg = document.getElementById("profileAvatarMsg")
	var show = function (t, warn) {
		msg.className = "profileNote" + (warn ? " profileWarn" : " profileOk")
		msg.textContent = t
		msg.classList.remove("hideValue")
	}
	var problem = avatarValidate(f)
	if (problem) { show(problem, true); return }

	document.getElementById("profileAvatarBtn").disabled = true
	show("Uploading…", false)
	avatarUpload(f).then(function () {
		document.getElementById("profileAvatarBtn").disabled = false
		renderAuthNav()
		renderProfileAccount()
		displayCalcNotification("Profile picture updated", 1800)
	}).catch(function (err) {
		document.getElementById("profileAvatarBtn").disabled = false
		show(err.message || "Upload failed", true)
	})
}

function profileAvatarRemove() {
	avatarRemove().then(function () {
		renderAuthNav()
		renderProfileAccount()
	}).catch(function (err) {
		var msg = document.getElementById("profileAvatarMsg")
		msg.className = "profileNote profileWarn"
		msg.textContent = err.message || "Could not remove"
		msg.classList.remove("hideValue")
	})
}

// ---- saved CSVs -------------------------------------------------------
//
// The History Table kept as the app's own CSV, so a saved copy loads back
// through the ordinary import path rather than a second reader.

function renderProfileCsv() {
	var tok = profileRenderSeq
	csvList().then(function (rows) {
		var count = (typeof sHistory !== "undefined") ? sHistory.length : 0
		var o = ''
		o += '<div class="profileNote">Save the History Table as a CSV against your account, and load it back whenever you want. Load adds the saved phrases to the table you have open; Replace clears it first.</div>'

		o += '<div class="profileSearchRow">'
		o += '<input type="text" id="csvName" class="profileSearchInput" maxlength="60" placeholder="Name this CSV&hellip;" onkeydown="profileCsvNameKey(event)">'
		o += '<button class="profileMiniBtn" onclick="profileCsvSave()"' + (count === 0 ? ' disabled title="The History Table is empty"' : '') + '>Save ' + count + ' row' + (count === 1 ? '' : 's') + '</button>'
		o += '</div>'

		if (rows.length === 0) {
			o += '<div class="profileNote">Nothing saved yet.</div>'
			profileBody(o, tok); return
		}

		o += '<div class="profileList">'
		rows.forEach(function (r) {
			var nm = authEsc(r.name).replace(/"/g, '&quot;')
			o += '<div class="profileRow">'
			o += '<span class="profileRowPhrase" onclick="profileCsvLoad(&quot;' + r.id + '&quot;,false)" title="Load into the History Table">' + authEsc(r.name) + '</span>'
			o += '<span class="profileRowActions">'
			o += '<span class="profileWhen">' + r.rows + ' rows</span>'
			o += '<button class="profileMiniBtn" onclick="profileCsvLoad(&quot;' + r.id + '&quot;,false)">Load</button>'
			o += '<button class="profileMiniBtn" onclick="profileCsvLoad(&quot;' + r.id + '&quot;,true)" title="Clear the table first, then load">Replace</button>'
			o += '<button class="profileMiniBtn" onclick="profileCsvDownload(&quot;' + r.id + '&quot;)" title="Download as a file">&#8595;</button>'
			o += '<button class="profileMiniBtn profileMiniDanger" onclick="profileCsvDelete(&quot;' + r.id + '&quot;,&quot;' + nm + '&quot;)">&#215;</button>'
			o += '</span></div>'
		})
		o += '</div>'
		profileBody(o, tok)
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

function profileCsvNameKey(e) {
	if (e.key === "Enter") { e.preventDefault(); profileCsvSave() }
}

function profileCsvSave() {
	var box = document.getElementById("csvName")
	var name = (box === null) ? "" : box.value.trim()
	if (name === "") { displayCalcNotification("Give the CSV a name", 1800); return }
	if (typeof sHistory === "undefined" || sHistory.length === 0) {
		displayCalcNotification("The History Table is empty", 1800); return
	}
	var text = buildHistoryCSV(sHistory)
	csvSave(name, text, sHistory.length).then(function (what) {
		displayCalcNotification(what === "updated" ? "CSV updated" : "CSV saved", 1800)
		renderProfileCsv()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not save", 2400)
	})
}

function profileCsvLoad(id, clearFirst) {
	csvLoad(id).then(function (row) {
		if (clearFirst) {
			sHistory = []
			if (typeof histDisplayOrder !== "undefined") histDisplayOrder = null
		}
		importFileAction(row.csv, true) // the app's own CSV reader, given the text directly
		closeAllOpenedMenus()
		displayCalcNotification("Loaded " + row.name, 2000)
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not load", 2400)
	})
}

function profileCsvDownload(id) {
	csvLoad(id).then(function (row) {
		download(row.name.replace(/[^\w.-]+/g, "_") + ".txt",
			'data:text/plain;charset=utf-8,' + encodeURIComponent(row.csv))
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not download", 2400)
	})
}

function profileCsvDelete(id, name) {
	if (!window.confirm('Delete the saved CSV "' + name + '"?')) return
	csvDelete(id).then(renderProfileCsv)
		.catch(function (err) { profileBody(profileErr(err)) })
}

// ---- saved birth charts -----------------------------------------------

function renderProfileChart() {
	var tok = profileRenderSeq
	chartList().then(function (rows) {
		var cur = profileReadAstroInputs()
		var o = ''
		o += '<div class="profileNote">Save the birth details from the Astrology tab so your chart is there next time, on any device. Only the details are stored &mdash; the chart is drawn from them.</div>'

		if (cur === null) {
			o += '<div class="profileNote profileWarn">Open the Astrology tab and set a birth date first, then come back here to save it.</div>'
		} else {
			o += '<div class="profileNote">Ready to save: <b>' + authEsc(cur.birth_date) + (cur.birth_time ? ' ' + authEsc(cur.birth_time) : '') + (cur.place ? ' &mdash; ' + authEsc(cur.place) : '') + '</b></div>'
			o += '<div class="profileSearchRow">'
			o += '<input type="text" id="chartName" class="profileSearchInput" maxlength="60" placeholder="Whose chart is this?" onkeydown="profileChartNameKey(event)">'
			o += '<button class="profileMiniBtn" onclick="profileChartSave()">Save chart</button>'
			o += '</div>'
		}

		if (rows.length === 0) {
			o += '<div class="profileNote">No charts saved yet.</div>'
			profileBody(o, tok); return
		}

		o += '<div class="profileList">'
		rows.forEach(function (r) {
			var when = r.birth_date + (r.birth_time ? " " + r.birth_time : "")
			var nm = authEsc(r.name).replace(/"/g, '&quot;')
			o += '<div class="profileRow">'
			o += '<span class="profileRowPhrase" onclick="profileChartLoad(&quot;' + r.id + '&quot;)" title="Open in the Astrology tab">' + authEsc(r.name) + '</span>'
			o += '<span class="profileRowActions">'
			o += '<span class="profileWhen">' + authEsc(when) + '</span>'
			o += '<button class="profileMiniBtn" onclick="profileChartLoad(&quot;' + r.id + '&quot;)">Open</button>'
			o += '<button class="profileMiniBtn profileMiniDanger" onclick="profileChartDelete(&quot;' + r.id + '&quot;,&quot;' + nm + '&quot;)">&#215;</button>'
			o += '</span></div>'
		})
		o += '</div>'
		profileBody(o, tok)
	}).catch(function (err) { profileBody(profileErr(err), tok) })
}

function profileChartNameKey(e) {
	if (e.key === "Enter") { e.preventDefault(); profileChartSave() }
}

// Reads whatever the Astrology tab currently holds. Returns null when it has
// not been opened, since its inputs only exist once that panel is built.
function profileReadAstroInputs() {
	var v = function (id) { var e = document.getElementById(id); return e === null ? null : e.value }
	var y = v("astroY"), m = v("astroM"), d = v("astroD")
	if (y === null || m === null || d === null) return null
	var pad = function (n) { return (String(n).length < 2 ? "0" : "") + n }
	return {
		birth_date: y + "-" + pad(m) + "-" + pad(d),
		birth_time: (v("astroHH") === null) ? "" : pad(v("astroHH")) + ":" + pad(v("astroMM")),
		place: v("astroPlace") || "",
		latitude: v("astroLat"),
		longitude: v("astroLon"),
		tz_offset: v("astroTZ")
	}
}

function profileChartSave() {
	var box = document.getElementById("chartName")
	var name = (box === null) ? "" : box.value.trim()
	if (name === "") { displayCalcNotification("Give the chart a name", 1800); return }
	var data = profileReadAstroInputs()
	if (data === null) { displayCalcNotification("Open the Astrology tab first", 2200); return }

	chartSave(name, data).then(function (what) {
		displayCalcNotification(what === "updated" ? "Chart updated" : "Chart saved", 1800)
		renderProfileChart()
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not save the chart", 2400)
	})
}

// Puts the saved details back into the Astrology tab and redraws it.
function profileChartLoad(id) {
	chartList().then(function (rows) {
		var r = null
		for (var i = 0; i < rows.length; i++) if (rows[i].id === id) { r = rows[i]; break }
		if (r === null) throw new Error("That chart is gone")

		closeAllOpenedMenus()
		if (typeof toggleAstroMenu === "function" && typeof astroMenuOpened !== "undefined" && !astroMenuOpened) {
			toggleAstroMenu() // build the panel so its inputs exist
		}

		var set = function (id2, val) {
			var e = document.getElementById(id2)
			if (e !== null && val !== null && val !== undefined && val !== "") e.value = val
		}
		var parts = String(r.birth_date).split("-")
		set("astroY", Number(parts[0])); set("astroM", Number(parts[1])); set("astroD", Number(parts[2]))
		if (r.birth_time) {
			var t = String(r.birth_time).split(":")
			set("astroHH", Number(t[0])); set("astroMM", Number(t[1] || 0))
		}
		set("astroPlace", r.place)
		set("astroLat", r.latitude); set("astroLon", r.longitude); set("astroTZ", r.tz_offset)

		if (typeof updateAstroChart === "function") updateAstroChart()
		displayCalcNotification("Opened " + r.name, 2000)
	}).catch(function (err) {
		displayCalcNotification(err.message || "Could not open the chart", 2400)
	})
}

function profileChartDelete(id, name) {
	if (!window.confirm('Delete the saved chart "' + name + '"?')) return
	chartDelete(id).then(renderProfileChart)
		.catch(function (err) { profileBody(profileErr(err)) })
}
