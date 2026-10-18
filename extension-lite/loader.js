const TWITCH_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const BTTV = "https://api.betterttv.net/3/cached";
const cache = new Map();

async function getJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const safe = (p) => p.catch(() => []);

function from7tv(set) {
  return (set?.emotes ?? []).map((e) => ({
    name: e.name,
    url: `https:${e.data?.host?.url ?? `//cdn.7tv.app/emote/${e.id}`}/2x.webp`,
    zeroWidth: ((e.data?.flags ?? 0) & 1) === 1,
  }));
}

function fromBttv(list) {
  return (list ?? []).map((e) => ({
    name: e.code,
    url: `https://cdn.betterttv.net/emote/${e.id}/2x.webp`,
    zeroWidth: !!e.modifier,
  }));
}

function fromFfz(list) {
  return (list ?? []).map((e) => ({
    name: e.code,
    url: e.images["2x"] ?? e.images["1x"],
    zeroWidth: false,
  }));
}

async function twitchId(login) {
  const gql = await getJSON("https://gql.twitch.tv/gql", {
    method: "POST",
    headers: { "Client-ID": TWITCH_CLIENT_ID },
    body: JSON.stringify({ query: `query{user(login:${JSON.stringify(login)}){id}}` }),
  });
  return gql?.data?.user?.id ?? null;
}

async function loadEmotes(login) {
  const key = login || "";
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.emotes;

  const id = login ? await twitchId(login).catch(() => null) : null;
  const [g7, c7, gB, cB, gF, cF] = await Promise.all([
    safe(getJSON("https://7tv.io/v3/emote-sets/global").then(from7tv)),
    id ? safe(getJSON(`https://7tv.io/v3/users/twitch/${id}`).then((u) => from7tv(u.emote_set))) : [],
    safe(getJSON(`${BTTV}/emotes/global`).then(fromBttv)),
    id
      ? safe(getJSON(`${BTTV}/users/twitch/${id}`).then((u) => fromBttv([...u.channelEmotes, ...u.sharedEmotes])))
      : [],
    safe(getJSON(`${BTTV}/frankerfacez/emotes/global`).then(fromFfz)),
    id ? safe(getJSON(`${BTTV}/frankerfacez/users/twitch/${id}`).then(fromFfz)) : [],
  ]);

  // De menor a mayor prioridad: gana el último con el mismo nombre.
  const emotes = [...gF, ...gB, ...g7, ...cF, ...cB, ...c7];
  cache.set(key, { at: Date.now(), emotes });
  return emotes;
}

