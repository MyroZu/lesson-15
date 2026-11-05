
const $ = s => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

/* Speech: pre-recorded ElevenLabs clips in audio/, one playing at a time */
let cur = null, curBtn = null;
function stopAudio() {
  if (cur) { cur.pause(); cur = null; }
  if (curBtn) { curBtn.textContent = "Слухати"; curBtn = null; }
}
function sayBtn(id) {
  const b = el("button", "say", "Слухати"); b.type = "button";
  b.addEventListener("click", ev => {
    ev.stopPropagation();
    $("#teacher").pause();
    $("#halloweenSong").pause();
    const wasPlaying = curBtn === b;
    stopAudio();
    if (wasPlaying) return;
    const a = new Audio(`audio/${id}.mp3`);
    cur = a; curBtn = b; b.textContent = "Стоп";
    const fail = () => { if (cur === a) { cur = null; curBtn = null; b.textContent = "Немає звуку"; } };
    a.addEventListener("ended", () => { if (cur === a) stopAudio(); });
    a.addEventListener("error", fail);
    const p = a.play();
    if (p) p.catch(e => { if (e.name !== "AbortError") fail(); });
  });
  return b;
}

/* Views */
const VIEWS = ["song", "plan", "rhyme", "story", "words", "practice"];
function show(v) {
  stopAudio();
  if (window.teacher) $("#teacher").pause();
  $("#halloweenSong").pause();
  if (!VIEWS.includes(v)) v = "plan";
  VIEWS.forEach(n => $("#" + n).classList.toggle("on", n === v));
  document.querySelectorAll("#tabs button").forEach(b => { if (b.dataset.v === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
}
function go(v) { show(v); try { location.hash = v; } catch (e) {} window.scrollTo(0, 0); }
document.querySelectorAll("#tabs button").forEach(b => b.addEventListener("click", () => go(b.dataset.v)));
addEventListener("hashchange", () => show(location.hash.slice(1)));

/* Tickets */
const TICKETS = [
  { name: "Рейс 1", items: [["rhyme", "Вірш"], " — вивчи 1-шу і 2-гу строфи."], story: "Прочитай с. 66 разом з аудіо.", words: "Вивчи картки с. 66." },
  { name: "Рейс 2", items: [["rhyme", "Вірш"], " — повтори і додай 3-тю строфу."], story: "Прочитай с. 67 разом з аудіо.", words: "Вивчи картки с. 67." },
  { name: "Рейс 3", items: [["rhyme", "Вірш"], " — повтори і додай 4-ту строфу."], story: "Прочитай с. 68 разом з аудіо.", words: "Вивчи картки с. 68." },
  { name: "Рейс 4", items: [["rhyme", "Вірш"], " — повтори і додай 5-ту строфу."], story: "Прочитай с. 69 разом з аудіо.", words: "Вивчи картки с. 69." },
  { name: "Рейс 5", items: [["rhyme", "Вірш"], " — розкажи весь напам'ять дорослому."], story: "Зроби вправи 1–5 у книжці на с. 70.", words: "Зроби вправи на цій сторінці й перекажи казку." },
];
let done = [];
try { done = JSON.parse(localStorage.getItem("ferry-done") || "[]"); if (!Array.isArray(done)) done = []; } catch (e) { done = []; }
done = [...new Set(done.filter(n => Number.isInteger(n) && n >= 0 && n < 5))];
function saveDone() { try { localStorage.setItem("ferry-done", JSON.stringify(done)); } catch (e) {} }
function renderTickets() {
  const box = $("#tickets"); box.textContent = "";
  TICKETS.forEach((t, i) => {
    const isDone = done.includes(i);
    const card = el("div", "ticket" + (isDone ? " done" : ""));
    card.append(el("h3", null, t.name));
    const p = el("button", "punch", isDone ? "Готово" : "Здати квиток"); p.type = "button"; p.setAttribute("aria-pressed", String(isDone));
    p.addEventListener("click", () => { done = isDone ? done.filter(x => x !== i) : done.concat(i); saveDone(); renderTickets(); });
    card.append(p);
    const ul = el("ul");
    const a = el("li");
    const link = el("a", null, t.items[0][1]); link.href = "#" + t.items[0][0];
    link.addEventListener("click", ev => { ev.preventDefault(); go(t.items[0][0]); });
    a.append(link, document.createTextNode(t.items[1]));
    ul.append(a, el("li", null, t.story), el("li", null, t.words));
    card.append(ul); box.append(card);
  });
  const n = done.length;
  $("#progressCount").textContent = `${n} / 5`;
  $("#progressBar").style.width = `${n*20}%`;
  $("#continue").textContent = n === 5 ? "Повторити урок →" : n ? "Продовжити подорож →" : "Почати подорож →";
  $("#boat").style.setProperty("--p", n / TICKETS.length);
  $("#progress").textContent = n === TICKETS.length ? "Пором на тому березі. Buy your tickets, please!" : `Зроблено рейсів: ${n} із ${TICKETS.length}`;
}
renderTickets();

/* Rhyme */
const STANZAS = [
  { t: "Відьми летять", l: [["Witches on broomsticks", "Відьми на мітлах"], ["With cats and bats", "з котами та кажанами", "bats"], ["Ride round after dark", "кружляють, коли стемніє"], ["In their black hats", "у своїх чорних капелюхах", "hats"]] },
  { t: "Дивне світло", l: [["How spooky are the noises", "Які моторошні звуки"], ["On Halloween night", "у ніч на Гелловін", "night"], ["And then through the window", "А потім крізь вікно"], ["We see a strange light", "ми бачимо дивне світло", "light"]] },
  { t: "Страшно, я біля тата", l: [["Bright staring eyes", "Яскраві витріщені очі"], ["And a glowing nose", "і ніс, що світиться", "nose"], ["I sit close to daddy", "Я сиджу близько до тата"], ["And curl up my toes", "і підгинаю пальчики на ногах", "toes"]] },
  { t: "Весело, але добре, що скінчилось", l: [["Halloween night", "Ніч на Гелловін"], ["Can be lots of fun", "може бути дуже веселою", "fun"], ["But somehow I’m glad", "але чомусь я радий"], ["When it’s over and done", "коли все скінчилося", "done"]] },
  { t: "На добраніч", l: [["It’s good to have daddy", "Добре, коли є тато,"], ["To kiss me goodnight", "щоб поцілувати мене на добраніч", "goodnight"], ["And know that witches", "і знати, що відьми"], ["Have all taken flight", "уже всі полетіли", "flight"]] },
];
const MODE_NOTE = {
  read: "Читай разом з аудіо й повторюй кожен рядок. Натисни на рядок, щоб побачити або сховати переклад.",
  hints: "Лишилися тільки перші літери. Спробуй сказати рядок повністю.",
  recite: "Скажи рядок сам, а тоді натисни на нього, щоб перевірити себе.",
};
let mode = "read"; let shownUk = new Set(); let revealed = new Set();
function hint(s) { return s.split(" ").map(w => { const m = w.match(/^(.)(.*)$/u); return m[1] + m[2].replace(/[\p{L}’]/gu, "·"); }).join(" "); }
function renderRhyme() {
  document.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("on", b.dataset.mode === mode));
  $("#modeNote").textContent = MODE_NOTE[mode];
  const box = $("#stanzas"); box.textContent = "";
  STANZAS.forEach((s, si) => {
    const st = el("div", "stanza");
    const top = el("div", "top");
    top.append(el("h3", null, `${si + 1}. ${s.t}`), sayBtn("r" + si));
    st.append(top);
    s.l.forEach((ln, li) => {
      const id = si + "-" + li;
      const b = el("button", "line"); b.type = "button";
      if (mode === "recite" && !revealed.has(id)) {
        b.classList.add("masked"); b.textContent = `Рядок ${li + 1}: скажи і натисни`;
        b.addEventListener("click", () => { revealed.add(id); renderRhyme(); });
      } else if (mode === "hints") {
        b.textContent = hint(ln[0]); b.addEventListener("click", () => { b.textContent = ln[0]; });
      } else {
        const rh = ln[2];
        if (rh) { const i = ln[0].lastIndexOf(rh); b.append(document.createTextNode(ln[0].slice(0, i)), el("span", "rh", rh)); }
        else b.textContent = ln[0];
        if (mode === "read") {
          if (shownUk.has(id)) b.append(el("span", "uk", ln[1]));
          b.addEventListener("click", () => { shownUk.has(id) ? shownUk.delete(id) : shownUk.add(id); renderRhyme(); });
        }
      }
      st.append(b);
    });
    box.append(st);
  });
}
document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; revealed.clear(); renderRhyme(); }));
renderRhyme();

/* Story: English text is the book's, split only at sentence boundaries outside quotes */
const PAGES = [
  { n: 66, s: [
    ["Once there was a little ferry-boat. It wanted to meet a king.", "Колись жив-був маленький пором. Він хотів зустріти короля."],
    ["Little Ferry-Boat carried many people across the river.", "Маленький Пором перевозив багато людей через річку."],
    ["He carried lorries.", "Він перевозив вантажівки."],
    ["He had a captain with gold buttons but not a king.", "У нього був капітан із золотими ґудзиками, але не було короля."],
    ["“These people and lorries and things are all right,” Little Ferry-Boat said. “They are all right. But I want to meet a king.”", "«Ці люди, вантажівки й речі — це добре, — сказав Маленький Пором. — З ними все гаразд. Але я хочу зустріти короля»."],
    ["He said, “Kings fly in airplanes. They travel on big ships. But kings do not ride on little ferry-boats.”", "Він сказав: «Королі літають літаками. Вони подорожують великими кораблями. Але королі не плавають на маленьких поромах»."],
    ["Little Ferry-Boat thought sadly about kings.", "Маленький Пором сумно думав про королів."],
    ["Then he said, “I must be ready to meet a king.”", "Потім він сказав: «Я маю бути готовим зустріти короля»."],
  ]},
  { n: 67, foot: "without bump — без зіткнення (примітка з книжки)", s: [
    ["So he practiced to go to the shore without bump on his side or his nose.", "Тож він тренувався підходити до берега, не вдаряючись бортом або носом."],
    ["“I must be ready,” he said, “to meet a king.”", "«Я маю бути готовим, — сказав він, — зустріти короля»."],
    ["Every day in the morning Little Ferry-Boat waited for a king.", "Щоранку Маленький Пором чекав на короля."],
    ["There were old men with newspapers.", "Там були літні чоловіки з газетами."],
    ["There were young men with their bags.", "Там були молоді чоловіки зі своїми сумками."],
    ["There were old ladies with their flowers.", "Там були літні жінки зі своїми квітами."],
    ["But there wasn’t a king.", "Але короля не було."],
    ["One morning Little Ferry-Boat saw a big white ship.", "Одного ранку Маленький Пором побачив великий білий корабель."],
    ["The big white ship called “Come here!”", "Великий білий корабель гукнув: «Пливи сюди!»"],
    ["Little Ferry-Boat was surprised, but he came there.", "Маленький Пором здивувався, але підплив туди."],
    ["Big Ship called, “Do you know who is on my board?”", "Великий Корабель гукнув: «Знаєш, хто в мене на борту?»"],
    ["Little Ferry-Boat said, “Who?”", "Маленький Пором сказав: «Хто?»"],
    ["Big Ship said, “A king.”", "Великий Корабель сказав: «Король»."],
    ["“A king!” cried Little Ferry-Boat.", "«Король!» — вигукнув Маленький Пором."],
    ["“And his wife and his daughter,” said Big Ship. “And, you know, they can’t go to the shore.”", "«І його дружина, і донька, — сказав Великий Корабель. — І, знаєш, вони не можуть дістатися до берега»."],
    ["“Can’t go to the shore?” cried Little Ferry-Boat.", "«Не можуть дістатися до берега?» — вигукнув Маленький Пором."],
    ["“Now I can see a king and his family”, he thought.", "«Тепер я зможу побачити короля та його родину», — подумав він."],
    ["Big Ship said, “Big Ships can’t come to the shore without tug-boats. But there were no tug-boats. Will you take the king to the shore?”", "Великий Корабель сказав: «Великі кораблі не можуть підійти до берега без буксирів. Але буксирів не було. Ти відвезеш короля до берега?»"],
  ]},
  { n: 68, s: [
    ["“Take him to the shore!” cried Little Ferry-Boat. “Right now?”", "«Відвезти його до берега! — вигукнув Маленький Пором. — Просто зараз?»"],
    ["Big Ship said yes.", "Великий Корабель сказав, що так."],
    ["Little Ferry-Boat was so glad to do it.", "Маленький Пором дуже зрадів, що зробить це."],
    ["He came to Big Ship’s side.", "Він підплив до борту Великого Корабля."],
    ["The men tied him to the ship.", "Чоловіки прив’язали його до корабля."],
    ["Little Ferry-Boat thought, “Oh, I am lucky I don’t bump!”", "Маленький Пором подумав: «Ох, як мені пощастило, що я не вдарився!»"],
    ["Suddenly Little Ferry-Boat saw a beautiful white motor boat.", "Раптом Маленький Пором побачив гарний білий моторний човен."],
    ["He heard somebody say, “Oh, here is a fine motor boat. Now you need not go to this little ferry-boat.”", "Він почув, як хтось сказав: «О, ось чудовий моторний човен. Тепер не треба йти на цей маленький пором»."],
    ["But somebody else answered, “These motor boats are all right. They are all right. But I want to ride on a little ferry-boat!”", "Але хтось інший відповів: «Ці моторні човни хороші. З ними все гаразд. Але я хочу покататися на маленькому поромі!»"],
    ["“Me too,” said somebody else.", "«І я теж», — сказав ще хтось."],
    ["Then the men let the ladder down on Little Ferry-Boat.", "Тоді чоловіки спустили драбину на Маленький Пором."],
    ["But then two tug-boats came.", "Але потім припливли два буксири."],
    ["Little Ferry-Boat heard somebody say, “Oh, here come two tug-boats! Now the tugboats can take Big Ship to the shore.”", "Маленький Пором почув, як хтось сказав: «О, ось пливуть два буксири! Тепер буксири можуть доправити Великий Корабель до берега»."],
    ["Little Ferry-Boat was ready to cry.", "Маленький Пором ледь не заплакав."],
    ["The king will go to the shore on Big Ship!", "Король дістанеться до берега на Великому Кораблі!"],
    ["But somebody answered, “The tug-boats may take the ship to the shore. But I want to ride on that Little Ferry-Boat. I want to see the captain with his gold buttons.”", "Але хтось відповів: «Буксири можуть доправити корабель до берега. Але я хочу покататися на тому Маленькому Поромі. Я хочу побачити капітана з його золотими ґудзиками»."],
  ]},
  { n: 69, s: [
    ["Little Ferry-Boat jumped on the waves!", "Маленький Пором застрибав на хвилях!"],
    ["The king walked down the ladder.", "Король спустився драбиною."],
    ["He had a gold crown and a great gold ring.", "У нього була золота корона й велика золота каблучка."],
    ["His wife came next.", "Наступною спустилася його дружина."],
    ["She had a gold crown and a beautiful red dress.", "У неї була золота корона й гарна червона сукня."],
    ["His daughter came next.", "Потім спустилася його донька."],
    ["She had a gold crown and a beautiful green dress.", "У неї була золота корона й гарна зелена сукня."],
    ["Little Ferry-Boat moved to the shore.", "Маленький Пором поплив до берега."],
    ["He thought, “I mustn’t bump the king!”", "Він подумав: «Я не повинен штовхнути короля!»"],
    ["But of course he bumped!", "Але, звісно, він вдарився!"],
    ["The king — and his family — laughed!", "Король і його родина засміялися!"],
    ["Little Ferry-Boat tried to go slowly.", "Маленький Пором намагався плисти повільно."],
    ["But he bumped again!", "Але він знову вдарився!"],
    ["The king — and his family — laughed!", "Король і його родина засміялися!"],
    ["The king’s wife said, “I want to go across the river again!”", "Дружина короля сказала: «Я хочу ще раз переплисти річку!»"],
    ["Little Ferry-Boat crossed the river again and again!", "Маленький Пором перепливав річку знову і знову!"],
    ["The king — and his family — laughed and waved to the captain.", "Король і його родина сміялися й махали капітанові."],
    ["Little Ferry-Boat never had such fun in his life.", "Маленький Пором ще ніколи в житті так не веселився."],
    ["Then the king’s wife said, “We cannot go across the river again!”", "Потім дружина короля сказала: «Більше ми не можемо перепливати річку!»"],
    ["The king said, “O. K.”", "Король сказав: «Гаразд»."],
    ["Then he said to the captain, “Can we go again tomorrow?”", "Потім він сказав капітанові: «Можна нам покататися ще й завтра?»"],
    ["“You may take a ride when you like to do it,” Little Ferry-Boat cried.", "«Можете кататися, коли захочете!» — вигукнув Маленький Пором."],
    ["“How nice!” he said.", "«Як чудово!» — сказав він."],
    ["He was so glad that he forgot there was a king.", "Він так зрадів, що забув, що перед ним король."],
    ["He said, “Buy your tickets, please.”", "Він сказав: «Купуйте квитки, будь ласка»."],
    ["And the king said, “Yes, of course!”", "А король сказав: «Так, звісно!»"],
  ]},
];
let storyPage = 66;
let allUk = false; const openUk = new Set();
function renderStory() {
  $("#allUk").textContent = allUk ? "Сховати весь переклад" : "Показати весь переклад";
  $("#allUk").classList.toggle("on", allUk);
  const box = $("#pages"); box.textContent = "";
  PAGES.filter(pg => pg.n === storyPage).forEach(pg => {
    const sec = el("div", "ex");
    sec.append(el("h3", null, `Сторінка ${pg.n}`));
    const list = el("div");
    pg.s.forEach((s, i) => {
      const id = pg.n + "-" + i;
      const r = el("div", "sent");
      const t = el("button", "t", s[0]); t.type = "button";
      if (allUk || openUk.has(id)) t.append(el("span", "uk", s[1]));
      t.addEventListener("click", () => { openUk.has(id) ? openUk.delete(id) : openUk.add(id); renderStory(); });
      r.append(t, sayBtn(`s${pg.n}-${i}`)); list.append(r);
    });
    sec.append(list);
    const scan = el("a", "scan-link", "Відкрити оригінал сторінки ↗"); scan.href = `assets/page-${pg.n}.jpg`; scan.target = "_blank"; scan.rel = "noopener"; sec.append(scan);
    if (pg.foot) sec.append(el("p", "foot", pg.foot));
    box.append(sec);
  });
}
$("#allUk").addEventListener("click", () => { allUk = !allUk; if (!allUk) openUk.clear(); renderStory(); });
renderStory();

/* Word cards: en, approximate Ukrainian-letter pronunciation, uk, page */
const WORDS = [
  ["ferry-boat", "фе́рі-боут", "пором", 66], ["king", "кінг", "король", 66], ["to meet", "ту міт", "зустрічати", 66],
  ["carried", "ке́рід", "перевозив", 66], ["across the river", "екро́с зе рі́вер", "через річку", 66], ["lorry", "ло́рі", "вантажівка", 66],
  ["captain", "ке́птін", "капітан", 66], ["gold buttons", "голд ба́тнз", "золоті ґудзики", 66], ["sadly", "се́длі", "сумно", 66],
  ["shore", "шо", "берег", 67], ["without bump", "візау́т бамп", "без зіткнення", 67], ["side", "сайд", "борт, бік", 67],
  ["newspaper", "нью́зпейпер", "газета", 67], ["surprised", "сепра́йзд", "здивований", 67], ["on board", "он бо́рд", "на борту", 67],
  ["wife", "вайф", "дружина", 67], ["daughter", "до́тер", "донька", 67], ["tug-boat", "та́г-боут", "буксир", 67],
  ["tied", "тайд", "прив’язали", 68], ["lucky", "ла́кі", "щасливий, везучий", 68], ["suddenly", "са́днлі", "раптом", 68],
  ["somebody else", "са́мбаді елс", "хтось інший", 68], ["ladder", "ле́дер", "драбина", 68], ["ready to cry", "ре́ді ту край", "ледь не плаче", 68],
  ["waves", "вейвз", "хвилі", 69], ["crown", "кра́ун", "корона", 69], ["ring", "рінг", "каблучка", 69], ["dress", "дрес", "сукня", 69],
  ["laughed", "лафт", "засміялися", 69], ["waved", "вейвд", "махали", 69], ["ticket", "ті́кіт", "квиток", 69],
];
let wordSearch = "";
let wf = 0, ukFirst = false, order = WORDS.map((_, i) => i); const flipped = new Set();
function renderFilter() {
  const box = $("#wordFilter"); box.textContent = "";
  [[0, "Усі"], [66, "с. 66"], [67, "с. 67"], [68, "с. 68"], [69, "с. 69"]].forEach(([v, lab]) => {
    const b = el("button", "btn" + (wf === v ? " on" : ""), lab); b.type = "button";
    b.addEventListener("click", () => { wf = v; flipped.clear(); renderFilter(); renderCards(); });
    box.append(b);
  });
}
function renderCards() {
  $("#swap").classList.toggle("on", ukFirst);
  $("#swap").textContent = ukFirst ? "Спочатку англійською" : "Спочатку українською";
  const box = $("#cards"); box.textContent = "";
  order.forEach(i => {
    const w = WORDS[i]; if (wf && w[3] !== wf) return;
    if (wordSearch && !`${w[0]} ${w[2]}`.toLowerCase().includes(wordSearch)) return;
    const open = flipped.has(i);
    const c = el("button", "card" + (open ? " flip" : "")); c.type = "button";
    c.setAttribute("aria-pressed", String(open));
    const showEn = ukFirst ? open : true;
    if (ukFirst && !open) { c.append(el("b", null, w[2])); }
    else if (!ukFirst && !open) { c.append(el("b", null, w[0]), el("small", null, w[1])); }
    else { c.append(el("b", null, showEn ? w[0] : w[2]), el("small", null, w[1]), el("span", null, w[2])); }
    c.addEventListener("click", () => { open ? flipped.delete(i) : flipped.add(i); renderCards(); });
    box.append(c);
  });
  $("#noWords").hidden = !!box.children.length;
}
$("#swap").addEventListener("click", () => { ukFirst = !ukFirst; flipped.clear(); renderCards(); });
$("#shuffle").addEventListener("click", () => { for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } flipped.clear(); renderCards(); });
renderFilter(); renderCards();

/* Questions from exercise 1 (as read out in the audio) with model answers from the story */
const QS = [
  ["What did Little Ferry-Boat want?", "He wanted to meet a king."],
  ["Who was on board of the big white ship?", "A king, his wife and his daughter."],
  ["Was Little Ferry-Boat glad to take the king to the shore?", "Yes, he was. He was so glad to do it."],
  ["Why did the king and his family laugh?", "Because Little Ferry-Boat bumped."],
  ["What did Little Ferry-Boat cry to the king?", "“You may take a ride when you like to do it.” Then he said, “Buy your tickets, please.”"],
  ["What did the king answer to Little Ferry-Boat?", "“Yes, of course!”"],
];
QS.forEach((q, i) => {
  const box = el("div", "q");
  const top = el("div", "row"); top.style.justifyContent = "space-between";
  const qt = el("b", null, `${i + 1}. ${q[0]}`); qt.style.flex = "1 1 12rem"; qt.style.minWidth = "0";
  top.append(qt, sayBtn("q" + i));
  const a = el("p", "ans uk", q[1]); a.hidden = true;
  const b = el("button", "btn", "Перевірити себе"); b.type = "button"; b.style.alignSelf = "flex-start";
  b.addEventListener("click", () => { a.hidden = !a.hidden; b.textContent = a.hidden ? "Перевірити себе" : "Сховати відповідь"; });
  box.append(top, b, a); $("#questions").append(box);
});

/* Generic choice quiz */
function quiz(target, scoreEl, items) {
  let right = 0, answered = 0;
  const upd = () => { scoreEl.textContent = answered ? `Правильно: ${right} із ${items.length}` : ""; };
  items.forEach(it => {
    const box = el("div", "q");
    box.append(el("span", null, it.q));
    const opts = el("div", "opts"); const why = el("p", "why"); why.hidden = true;
    let first = true;
    it.opts.forEach(o => {
      const b = el("button", "opt", o); b.type = "button";
      b.addEventListener("click", () => {
        const ok = o === it.a;
        if (first) { first = false; answered++; if (ok) right++; upd(); }
        b.classList.add(ok ? "right" : "wrong");
        if(ok) opts.querySelectorAll("button").forEach(btn => btn.disabled = true);
        if (ok && it.why) { why.textContent = it.why; why.hidden = false; }
        if (!ok && !it.why) { why.textContent = "Спробуй ще раз."; why.hidden = false; }
        if (!ok && it.why) { why.textContent = "Спробуй ще раз."; why.hidden = false; }
      });
      opts.append(b);
    });
    box.append(opts, why); target.append(box);
  });
}
quiz($("#tf"), $("#tfScore"), [
  { q: "Little Ferry-Boat wanted to meet a king.", a: "True", opts: ["True", "False"], why: "Так, це його мрія." },
  { q: "The captain had gold buttons.", a: "True", opts: ["True", "False"], why: "Так, у капітана золоті ґудзики." },
  { q: "The big ship was black.", a: "False", opts: ["True", "False"], why: "Ні. The big ship was white." },
  { q: "The king had a gold crown.", a: "True", opts: ["True", "False"], why: "Так, і велику золоту каблучку." },
  { q: "The king’s daughter had a red dress.", a: "False", opts: ["True", "False"], why: "Ні. Сукня доньки зелена, а червона в дружини короля." },
  { q: "The tug-boats took the king to the shore.", a: "False", opts: ["True", "False"], why: "Ні. Короля повіз Маленький Пором." },
  { q: "Little Ferry-Boat bumped.", a: "True", opts: ["True", "False"], why: "Так, і не один раз." },
  { q: "The king and his family cried.", a: "False", opts: ["True", "False"], why: "Ні. Вони сміялися: they laughed." },
]);
quiz($("#hw"), $("#hwScore"), [
  { q: "He ___ a captain with gold buttons.", a: "had", opts: ["had", "was"] },
  { q: "Little Ferry-Boat ___ surprised.", a: "was", opts: ["had", "was"] },
  { q: "The king ___ a great gold ring.", a: "had", opts: ["had", "was"] },
  { q: "His wife ___ a beautiful red dress.", a: "had", opts: ["had", "was"] },
  { q: "Little Ferry-Boat ___ so glad to do it.", a: "was", opts: ["had", "was"] },
  { q: "His daughter ___ a gold crown.", a: "had", opts: ["had", "was"] },
  { q: "Little Ferry-Boat ___ ready to cry.", a: "was", opts: ["had", "was"] },
  { q: "He ___ so glad that he forgot there was a king.", a: "was", opts: ["had", "was"] },
].map(x => ({ ...x, why: x.a === "had" ? "had: мав, мала." : "was: був, була." })));
const oddScore = el("span");
quiz($("#odd"), oddScore, [
  { q: "Обери зайве слово:", a: "flower", opts: ["ship", "lorry", "tug-boat", "flower"], why: "Решта слів про транспорт." },
  { q: "Обери зайве слово:", a: "river", opts: ["crown", "ring", "dress", "river"], why: "Решту можна вдягнути." },
  { q: "Обери зайве слово:", a: "ladder", opts: ["red", "green", "white", "ladder"], why: "Решта слів називає кольори." },
  { q: "Обери зайве слово:", a: "ladder", opts: ["king", "captain", "ladder", "daughter"], why: "Решта слів називає людей." },
]);

/* Story order */
const EVENTS = [
  "Little Ferry-Boat wanted to meet a king.",
  "He practiced to go to the shore without bump.",
  "The big white ship called “Come here!”",
  "The men let the ladder down.",
  "The king walked down the ladder.",
  "Little Ferry-Boat bumped and the king laughed.",
  "The king said, “Yes, of course!”",
];
const SHUFFLED = [4, 1, 6, 2, 0, 5, 3];
let placed = 0;
function renderOrder() {
  const pl = $("#placed"); pl.textContent = "";
  EVENTS.slice(0, placed).forEach(e => pl.append(el("li", null, e)));
  const box = $("#orderOpts"); box.textContent = "";
  if (placed === EVENTS.length) { box.append(el("p", "score", "Усе правильно. Тепер перекажи казку своїми словами.")); return; }
  SHUFFLED.filter(i => i >= placed).forEach(i => {
    const b = el("button", "opt", EVENTS[i]); b.type = "button";
    b.addEventListener("click", () => { if (i === placed) { placed++; renderOrder(); } else { b.classList.add("wrong"); } });
    box.append(b);
  });
}
$("#orderReset").addEventListener("click", () => { placed = 0; renderOrder(); });
renderOrder();

show(location.hash.slice(1));

const teacher = $("#teacher"); window.teacher = teacher;
teacher.addEventListener("play", () => {stopAudio();$("#halloweenSong").pause();});
$("#continue").addEventListener("click",()=>go("rhyme"));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>{ storyPage=+b.dataset.page; stopAudio(); document.querySelectorAll("[data-page]").forEach(t=>{t.classList.toggle("on",t===b);t.setAttribute("aria-pressed",String(t===b));}); renderStory(); }));
$("#wordSearch").addEventListener("input",e=>{wordSearch=e.target.value.trim().toLowerCase();renderCards();$("#noWords").hidden=!!$("#cards").children.length;});
document.querySelectorAll("[data-time]").forEach(b=>b.addEventListener("click",()=>{stopAudio();teacher.currentTime=+b.dataset.time;teacher.play().catch(()=>{});}));
$("#resetQuiz").addEventListener("click",()=>{sessionStorage.setItem("ferry-return","practice"); location.reload();});
if(sessionStorage.getItem("ferry-return")){sessionStorage.removeItem("ferry-return");go("practice");}

// Keep the song, teacher recording, and individual clips from overlapping.
const song = $("#halloweenSong");
song.addEventListener("play", () => { stopAudio(); teacher.pause(); $("#songError").hidden = true; });
song.addEventListener("error", () => { $("#songError").hidden = false; });
$("#songSpeed").addEventListener("change", e => { song.playbackRate = Number(e.target.value); });
$("#songLoop").addEventListener("change", e => { song.loop = e.target.checked; });
