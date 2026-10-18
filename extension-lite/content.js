(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const RESERVED = new Set(["popout", "moderator", "embed", "u", "directory", "videos", "settings", "downloads"]);
  const FRAGMENT = 'span[data-a-target="chat-message-text"], .text-fragment';

  let emotes = new Map();
  let channel = null;

  function currentChannel() {
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts[0] === "popout" || parts[0] === "moderator" ? 1 : 0;
    const name = parts[i];
    return name && !RESERVED.has(name) ? name.toLowerCase() : null;
  }

  function makeEmote(e) {
    const wrap = document.createElement("span");
    wrap.className = "seventv-emote-wrap";
    const img = document.createElement("img");
    img.className = "seventv-emote";
    img.src = e.url;
    img.alt = e.name;
    img.title = e.name;
    img.loading = "lazy";
    wrap.appendChild(img);
    return wrap;
  }

  function processFragment(el) {
    if (el.dataset.seventv) return;
    el.dataset.seventv = "1";
    if (!emotes.size || el.children.length) return; // ya trae emotes/menciones propias
    const text = el.textContent;
    if (!text) return;
    const parts = text.split(/(\s+)/);
    if (!parts.some((p) => emotes.has(p))) return;

    const out = document.createDocumentFragment();
    let buffer = "";
    let last = null; // último emote normal, para apilar los de ancho cero
    const flush = () => {
      if (buffer) out.appendChild(document.createTextNode(buffer));
      buffer = "";
    };
    for (const p of parts) {
      const e = emotes.get(p);
      if (!e) {
        buffer += p;
        if (p.trim()) last = null;
        continue;
      }
      if (e.zeroWidth && last) {
        const z = makeEmote(e);
        z.classList.add("seventv-emote-zw");
        last.appendChild(z);
        continue;
      }
      flush();
      last = makeEmote(e);
      out.appendChild(last);
    }
    flush();
    el.replaceChildren(out);
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches?.(FRAGMENT)) processFragment(root);
    root.querySelectorAll?.(FRAGMENT).forEach(processFragment);
  }

  const observer = new MutationObserver((muts) => {
    for (const m of muts) m.addedNodes.forEach(scan);
  });

  async function refresh() {
    const next = currentChannel();
    if (next === channel && emotes.size) return;
    channel = next;
    let list = [];
    try {
      const res = await Promise.race([
        api.runtime.sendMessage({ type: "emotes", channel }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
      ]);
      list = res?.emotes ?? [];
    } catch (err) {
      console.warn("[7TV] background no respondió, cargando directo:", err);
    }
    if (!list.length) {
      try {
        list = await loadEmotes(channel);
      } catch (err) {
        console.error("[7TV] no se pudieron cargar los emotes:", err);
      }
    }
    console.log(`[7TV] ${list.length} emotes cargados para`, channel);
    emotes = new Map(list.map((e) => [e.name, e]));
    document.querySelectorAll(FRAGMENT).forEach((el) => delete el.dataset.seventv);
    scan(document.body);
  }

  observer.observe(document.body, { childList: true, subtree: true });
  refresh();
  setInterval(refresh, 1500); // Twitch es una SPA: detecta cambios de canal
})();
