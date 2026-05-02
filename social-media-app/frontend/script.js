const API_BASE = "/api";
const STORAGE_KEY = "sma_current_user";

function getCurrentUser() {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw);
	} catch (error) {
		localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}

function setCurrentUser(user) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
	localStorage.removeItem(STORAGE_KEY);
}

async function api(path, options = {}) {
	const response = await fetch(`${API_BASE}${path}`, {
		headers: {
			"Content-Type": "application/json"
		},
		...options
	});

	let payload = null;
	try {
		payload = await response.json();
	} catch (error) {
		payload = null;
	}

	if (!response.ok) {
		throw new Error(payload?.message || "Request failed");
	}

	return payload;
}

function dateLabel(value) {
	if (!value) {
		return "";
	}
	return new Date(value).toLocaleString();
}

function requireAuth() {
	const user = getCurrentUser();
	if (!user) {
		window.location.href = "login.html";
		return null;
	}
	return user;
}

function bindLogout() {
	const logoutButton = document.getElementById("logout-btn");
	if (!logoutButton) {
		return;
	}

	logoutButton.addEventListener("click", () => {
		clearCurrentUser();
		window.location.href = "login.html";
	});
}

function postCardTemplate(post) {
	const commentsMarkup = (post.comments || [])
		.map(
			(comment) =>
				`<div class="comment-item"><strong>@${comment.username}:</strong> ${escapeHtml(comment.content)}</div>`
		)
		.join("");

	return `
		<article class="card" data-post-id="${post.id}">
			<div class="post-header">
				<div>
					<h3>${escapeHtml(post.fullName)}</h3>
					<p class="meta">@${escapeHtml(post.username)} • ${dateLabel(post.createdAt)}</p>
				</div>
			</div>
			<p>${escapeHtml(post.content)}</p>
			<div class="actions">
				<button class="btn btn-outline btn-small" data-action="toggle-like" data-liked="${post.likedByViewer ? "1" : "0"}">
					${post.likedByViewer ? "Unlike" : "Like"} (${post.likesCount})
				</button>
			</div>
			<form data-action="add-comment">
				<input type="text" name="comment" placeholder="Write a comment" required />
				<button type="submit" class="btn btn-ghost btn-small">Add comment</button>
			</form>
			<div class="comments">
				${commentsMarkup || "<p class='muted'>No comments yet.</p>"}
			</div>
		</article>
	`;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

async function initLoginPage() {
	const user = getCurrentUser();
	if (user) {
		window.location.href = "index.html";
		return;
	}

	const message = document.getElementById("auth-message");
	const loginForm = document.getElementById("login-form");
	const registerForm = document.getElementById("register-form");

	loginForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const formData = new FormData(loginForm);
		const payload = {
			username: formData.get("username"),
			password: formData.get("password")
		};

		try {
			const loggedInUser = await api("/auth/login", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			setCurrentUser(loggedInUser);
			window.location.href = "index.html";
		} catch (error) {
			message.textContent = error.message;
		}
	});

	registerForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const formData = new FormData(registerForm);
		const payload = {
			fullName: formData.get("fullName"),
			username: formData.get("username"),
			password: formData.get("password")
		};

		try {
			await api("/auth/register", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			message.textContent = "Registration successful. You can now login.";
			registerForm.reset();
		} catch (error) {
			message.textContent = error.message;
		}
	});
}

async function initFeedPage() {
	const user = requireAuth();
	if (!user) {
		return;
	}
	bindLogout();

	const profileLink = document.getElementById("my-profile-link");
	profileLink.href = `profile.html?id=${user.id}`;

	const usersList = document.getElementById("users-list");
	const feedList = document.getElementById("feed-list");
	const postForm = document.getElementById("post-form");

	async function loadUsers() {
		const users = await api("/users");
		usersList.innerHTML = users
			.filter((entry) => entry.id !== user.id)
			.map(
				(entry) => `
					<div class="list-item">
						<div>
							<strong>${escapeHtml(entry.fullName)}</strong>
							<p class="meta">@${escapeHtml(entry.username)}</p>
						</div>
						<a class="btn btn-small btn-outline" href="profile.html?id=${entry.id}">View</a>
					</div>
				`
			)
			.join("");
	}

	async function loadFeed() {
		const posts = await api(`/posts?viewerId=${user.id}`);
		feedList.innerHTML = posts.map(postCardTemplate).join("");
	}

	postForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const formData = new FormData(postForm);
		try {
			await api("/posts", {
				method: "POST",
				body: JSON.stringify({
					userId: user.id,
					content: formData.get("content")
				})
			});
			postForm.reset();
			await loadFeed();
		} catch (error) {
			alert(error.message);
		}
	});

	feedList.addEventListener("click", async (event) => {
		const actionButton = event.target.closest("[data-action='toggle-like']");
		if (!actionButton) {
			return;
		}

		const card = event.target.closest("[data-post-id]");
		const postId = Number(card.dataset.postId);
		const liked = actionButton.dataset.liked === "1";

		try {
			if (liked) {
				await api(`/posts/${postId}/like?userId=${user.id}`, { method: "DELETE" });
			} else {
				await api(`/posts/${postId}/like`, {
					method: "POST",
					body: JSON.stringify({ userId: user.id })
				});
			}
			await loadFeed();
		} catch (error) {
			alert(error.message);
		}
	});

	feedList.addEventListener("submit", async (event) => {
		const commentForm = event.target.closest("form[data-action='add-comment']");
		if (!commentForm) {
			return;
		}
		event.preventDefault();

		const card = commentForm.closest("[data-post-id]");
		const postId = Number(card.dataset.postId);
		const formData = new FormData(commentForm);

		try {
			await api(`/posts/${postId}/comments`, {
				method: "POST",
				body: JSON.stringify({
					userId: user.id,
					content: formData.get("comment")
				})
			});
			await loadFeed();
		} catch (error) {
			alert(error.message);
		}
	});

	try {
		await Promise.all([loadUsers(), loadFeed()]);
	} catch (error) {
		alert(error.message);
	}
}

async function initProfilePage() {
	const user = requireAuth();
	if (!user) {
		return;
	}
	bindLogout();

	const profileCard = document.getElementById("profile-card");
	const profilePosts = document.getElementById("profile-posts");
	const params = new URLSearchParams(window.location.search);
	const profileId = Number(params.get("id") || user.id);

	async function loadProfile() {
		const profile = await api(`/users/${profileId}?viewerId=${user.id}`);
		const selfProfile = user.id === profile.id;

		profileCard.innerHTML = `
			<h1>${escapeHtml(profile.fullName)}</h1>
			<p class="meta">@${escapeHtml(profile.username)}</p>
			<p>${escapeHtml(profile.bio || "No bio yet.")}</p>
			<div class="stats">
				<span><strong>${profile.postsCount}</strong> posts</span>
				<span><strong>${profile.followersCount}</strong> followers</span>
				<span><strong>${profile.followingCount}</strong> following</span>
			</div>
			${
				selfProfile
					? ""
					: `<button id='follow-toggle' class='btn btn-primary'>${profile.isFollowing ? "Unfollow" : "Follow"}</button>`
			}
		`;

		const followButton = document.getElementById("follow-toggle");
		if (followButton) {
			followButton.addEventListener("click", async () => {
				try {
					if (profile.isFollowing) {
						await api(`/social/follow?followerId=${user.id}&followingId=${profile.id}`, {
							method: "DELETE"
						});
					} else {
						await api("/social/follow", {
							method: "POST",
							body: JSON.stringify({ followerId: user.id, followingId: profile.id })
						});
					}
					await loadProfile();
				} catch (error) {
					alert(error.message);
				}
			});
		}
	}

	async function loadProfilePosts() {
		const posts = await api(`/posts?viewerId=${user.id}`);
		const filtered = posts.filter((post) => post.userId === profileId);
		profilePosts.innerHTML = filtered.length
			? filtered.map(postCardTemplate).join("")
			: "<article class='card'><p class='muted'>No posts yet.</p></article>";
	}

	profilePosts.addEventListener("click", async (event) => {
		const button = event.target.closest("[data-action='toggle-like']");
		if (!button) {
			return;
		}
		const card = event.target.closest("[data-post-id]");
		const postId = Number(card.dataset.postId);
		const liked = button.dataset.liked === "1";

		try {
			if (liked) {
				await api(`/posts/${postId}/like?userId=${user.id}`, { method: "DELETE" });
			} else {
				await api(`/posts/${postId}/like`, {
					method: "POST",
					body: JSON.stringify({ userId: user.id })
				});
			}
			await loadProfilePosts();
		} catch (error) {
			alert(error.message);
		}
	});

	profilePosts.addEventListener("submit", async (event) => {
		const commentForm = event.target.closest("form[data-action='add-comment']");
		if (!commentForm) {
			return;
		}
		event.preventDefault();
		const card = commentForm.closest("[data-post-id]");
		const postId = Number(card.dataset.postId);
		const formData = new FormData(commentForm);

		try {
			await api(`/posts/${postId}/comments`, {
				method: "POST",
				body: JSON.stringify({
					userId: user.id,
					content: formData.get("comment")
				})
			});
			await loadProfilePosts();
		} catch (error) {
			alert(error.message);
		}
	});

	try {
		await Promise.all([loadProfile(), loadProfilePosts()]);
	} catch (error) {
		alert(error.message);
	}
}

function init() {
	const page = document.body.dataset.page;

	if (page === "login") {
		initLoginPage();
	} else if (page === "feed") {
		initFeedPage();
	} else if (page === "profile") {
		initProfilePage();
	}
}

init();
