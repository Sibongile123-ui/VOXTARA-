const demoPosts = [
  {id:"seed-1",nickname:"BrightIdeas",topic:"Business",title:"What makes a small business stand out today?",body:"Is it the quality of the product, how you treat customers, or the way you market yourself online? I'd love to hear what people think matters most when you're starting with a small budget.",createdAt:Date.now()-1000*60*24,likes:12,liked:false,comments:[{nickname:"MarketMind",body:"Customer service can turn a first-time buyer into a loyal customer.",createdAt:Date.now()-1000*60*18}]},
  {id:"seed-2",nickname:"FaithAndLife",topic:"Faith",title:"Can faith and asking difficult questions go together?",body:"Sometimes people feel guilty for asking questions about faith. Do you think asking honest questions can actually help someone grow spiritually?",createdAt:Date.now()-1000*60*60*4,likes:8,liked:false,comments:[]},
  {id:"seed-3",nickname:"OpenBook",topic:"Relationships",title:"What does healthy communication look like to you?",body:"When two people disagree, what helps them solve the issue without disrespecting each other? Share a lesson you've learned.",createdAt:Date.now()-1000*60*60*18,likes:19,liked:false,comments:[{nickname:"KindWords",body:"Listening to understand, not just to respond, makes a huge difference.",createdAt:Date.now()-1000*60*60*15}]}
];
const STORAGE_KEY = "voxtara_posts_v1";
let posts = loadPosts();
let selectedTopic = "All";
let activeCommentsPostId = null;

function loadPosts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : demoPosts.map(p => ({...p, comments:[...p.comments]}));
  } catch { return demoPosts.map(p => ({...p, comments:[...p.comments]})); }
}
function savePosts() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
  catch { showToast("Browser storage is unavailable. Your change may not be saved."); }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function topicClass(topic) { return String(topic).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
function timeAgo(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now()-timestamp)/60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes/60);
  if (hours < 24) return `${hours} hr${hours===1?"":"s"} ago`;
  const days = Math.floor(hours/24);
  return `${days} day${days===1?"":"s"} ago`;
}
function renderPosts() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const sort = document.getElementById("sortSelect").value;
  let filtered = posts.filter(p => (selectedTopic==="All" || p.topic===selectedTopic) &&
    `${p.nickname} ${p.topic} ${p.title} ${p.body}`.toLowerCase().includes(query));
  filtered.sort((a,b) => sort==="popular" ? b.likes-a.likes : b.createdAt-a.createdAt);
  document.getElementById("postCount").textContent = `${filtered.length} discussion${filtered.length===1?"":"s"}`;
  document.getElementById("emptyState").classList.toggle("hidden", filtered.length>0);
  document.getElementById("postFeed").innerHTML = filtered.map(p => {
    const initial = escapeHTML((p.nickname.trim()[0] || "V").toUpperCase());
    const avatarStyle = p.topic==="Business" ? "gold-avatar" : p.topic==="Faith" ? "green-avatar" : "";
    return `<article class="post-card" data-id="${escapeHTML(p.id)}">
      <div class="post-meta"><div class="author-wrap"><div class="author-avatar ${avatarStyle}">${initial}</div><div><span class="author-name">${escapeHTML(p.nickname)}</span><span class="post-time">${timeAgo(p.createdAt)}</span></div></div><span class="topic-tag ${topicClass(p.topic)}">${escapeHTML(p.topic)}</span></div>
      <h3>${escapeHTML(p.title)}</h3><p class="post-body">${escapeHTML(p.body)}</p>
      <div class="post-actions"><button class="post-action ${p.liked?"liked":""}" data-action="like" data-id="${escapeHTML(p.id)}"><span class="action-symbol">${p.liked?"♥":"♡"}</span> ${p.likes} likes</button><button class="post-action" data-action="comments" data-id="${escapeHTML(p.id)}"><span class="action-symbol">▤</span> ${p.comments.length} replies</button><button class="post-action report-action" data-action="report" data-id="${escapeHTML(p.id)}"><span class="action-symbol">⚑</span> Report</button></div>
    </article>`;
  }).join("");
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openComposer() {
  document.getElementById("formError").textContent = "";
  document.getElementById("composerDialog").showModal();
}
document.getElementById("openComposer").addEventListener("click", openComposer);
document.getElementById("closeComposer").addEventListener("click", () => document.getElementById("composerDialog").close());
document.getElementById("searchInput").addEventListener("input", renderPosts);
document.getElementById("sortSelect").addEventListener("change", renderPosts);
document.querySelectorAll(".topic-chip").forEach(button => button.addEventListener("click", () => {
  selectedTopic = button.dataset.topic;
  document.querySelectorAll(".topic-chip").forEach(chip => chip.classList.toggle("selected", chip===button));
  renderPosts();
}));
document.getElementById("clearFilters").addEventListener("click", () => {
  selectedTopic = "All"; document.getElementById("searchInput").value = "";
  document.querySelectorAll(".topic-chip").forEach(chip => chip.classList.toggle("selected", chip.dataset.topic==="All"));
  renderPosts();
});
document.getElementById("composerForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const nickname = form.nickname.value.trim();
  const topic = form.topic.value;
  const title = form.title.value.trim();
  const body = form.body.value.trim();
  if (!nickname || !title || !body) { document.getElementById("formError").textContent = "Please fill in every field."; return; }
  if (nickname.length < 2 || title.length < 5 || body.length < 10) { document.getElementById("formError").textContent = "Use a nickname (2+ characters), title (5+), and message (10+)."; return; }
  if (/(https?:\/\/|www\.)/i.test(body)) { document.getElementById("formError").textContent = "Links are disabled in this starter preview to reduce spam."; return; }
  posts.unshift({id:`post-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,nickname,topic,title,body,createdAt:Date.now(),likes:0,liked:false,comments:[]});
  savePosts(); form.reset(); document.getElementById("composerDialog").close();
  selectedTopic = "All"; document.querySelectorAll(".topic-chip").forEach(chip => chip.classList.toggle("selected",chip.dataset.topic==="All"));
  document.getElementById("searchInput").value = ""; renderPosts(); showToast("Your discussion has been added to this preview.");
  document.getElementById("community").scrollIntoView({behavior:"smooth"});
});
document.getElementById("postFeed").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const post = posts.find(p => p.id===button.dataset.id);
  if (!post) return;
  if (button.dataset.action==="like") {
    post.liked = !post.liked; post.likes = Math.max(0,post.likes + (post.liked?1:-1)); savePosts(); renderPosts();
  } else if (button.dataset.action==="comments") {
    activeCommentsPostId = post.id; renderComments(post);
    document.getElementById("commentsDialog").showModal();
  } else if (button.dataset.action==="report") {
    const reason = window.prompt("Why are you reporting this discussion? (e.g. harassment, spam, private information)");
    if (reason && reason.trim()) showToast("Thank you. In this preview, reports are not sent to a moderator yet.");
  }
});
function renderComments(post) {
  document.getElementById("commentsTitle").textContent = post.title;
  document.getElementById("commentsList").innerHTML = post.comments.length ? post.comments.map(c =>
    `<div class="comment-item"><strong>${escapeHTML(c.nickname)}</strong><small>${timeAgo(c.createdAt)}</small><p>${escapeHTML(c.body)}</p></div>`
  ).join("") : `<div class="no-comments">No replies yet. You can be the first to add a thoughtful response.</div>`;
}
document.getElementById("closeComments").addEventListener("click", () => document.getElementById("commentsDialog").close());
document.getElementById("commentForm").addEventListener("submit", event => {
  event.preventDefault();
  const nickname = document.getElementById("commentNickname").value.trim();
  const body = document.getElementById("commentBody").value.trim();
  if (nickname.length<2 || body.length<2) { showToast("Please add a nickname and a reply."); return; }
  if (/(https?:\/\/|www\.)/i.test(body)) { showToast("Links are disabled in this starter preview."); return; }
  const post = posts.find(p => p.id===activeCommentsPostId);
  if (!post) return;
  post.comments.push({nickname,body,createdAt:Date.now()}); savePosts(); renderComments(post); renderPosts();
  document.getElementById("commentBody").value = ""; showToast("Your reply has been added to this preview.");
});
document.getElementById("menuButton").addEventListener("click", () => {
  const nav = document.querySelector(".main-nav");
  const open = nav.classList.toggle("open");
  document.getElementById("menuButton").setAttribute("aria-expanded", String(open));
});
renderPosts();
