const routes = ["/", "/biblioteca", "/rotina", "/downloads"];

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const typeClass = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("comercial")) return "type-comercial";
  return "";
};

async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.text();
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
}

function currentRoute() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const path = hash.startsWith("/") ? hash : `/${hash}`;
  return routes.includes(path) ? path : "/";
}

function setActivePage(route) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.dataset.page === route);
  });
  document.querySelectorAll(".nav a[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });
  document.getElementById("menu-principal")?.classList.remove("open");
  const toggle = document.getElementById("menu-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function renderBiblioteca(data) {
  const subtitle = document.getElementById("bib-subtitle");
  const pills = document.getElementById("bib-pills");
  const content = document.getElementById("bib-content");

  subtitle.textContent = data.intro.subtitle;

  pills.innerHTML = data.sections
    .map(
      (section) =>
        `<a class="pill" href="#section-${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>`
    )
    .join("");

  const tips = data.intro.comoUsar
    .map(
      (tip) => `
      <div class="tip">
        <h3>${escapeHtml(tip.label)}</h3>
        <p>${escapeHtml(tip.text)}</p>
      </div>`
    )
    .join("");

  const sections = data.sections
    .map((section) => {
      const cards = section.items
        .map((item) => {
          const inner = `
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta">
              <span class="tag ${typeClass(item.type)}">${escapeHtml(item.type)}</span>
              <span class="tag">${escapeHtml(item.age)}</span>
            </div>
            <p>${escapeHtml(item.why)}</p>
            ${item.note ? `<p class="note">${escapeHtml(item.note)}</p>` : ""}
            <span class="open">${item.url ? "Abrir link ↗" : "Caseiro"}</span>`;
          if (item.url) {
            return `<a class="card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
          }
          return `<article class="card">${inner}</article>`;
        })
        .join("");

      return `
        <section class="library-section" id="section-${escapeHtml(section.id)}">
          <h2>${escapeHtml(section.title)}</h2>
          <p class="blurb">${escapeHtml(section.blurb)}</p>
          <div class="card-grid">${cards}</div>
        </section>`;
    })
    .join("");

  content.innerHTML = `
    <div class="callout"><strong>Nível atual:</strong> ${escapeHtml(data.intro.nivel)}</div>
    <div class="grid-tips">${tips}</div>
    ${sections}
  `;

  // Smooth-scroll section pills without leaving the page route
  pills.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (event) => {
      event.preventDefault();
      const id = a.getAttribute("href")?.slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderRotina(data) {
  const subtitle = document.getElementById("rot-subtitle");
  const content = document.getElementById("rot-content");
  subtitle.textContent = data.intro.tagline;

  const regras = data.regras
    .map(
      (r) => `
      <div class="tip">
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.text)}</p>
      </div>`
    )
    .join("");

  const visao = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Slot</th><th>Foco</th><th>Como calibrar</th></tr>
        </thead>
        <tbody>
          ${data.visaoGeral
            .map(
              (row) => `
            <tr>
              <td><strong>${escapeHtml(row.slot)}</strong></td>
              <td>${escapeHtml(row.foco)}</td>
              <td>${escapeHtml(row.calibrar)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;

  const semana = data.semana1
    .map(
      (day) => `
      <article class="day-card">
        <h3>${escapeHtml(day.dia)}</h3>
        <p class="foco">${escapeHtml(day.foco)}</p>
        <p class="day-meta">${escapeHtml(day.tempo)}</p>
        <dl>
          <div><dt>Aquecer</dt><dd>${escapeHtml(day.aquecer)}</dd></div>
          <div><dt>Fazer</dt><dd>${escapeHtml(day.fazer)}</dd></div>
          <div><dt>Não fazer</dt><dd>${escapeHtml(day.naoFazer)}</dd></div>
          <div><dt>Fechar</dt><dd>${escapeHtml(day.fechar)}</dd></div>
        </dl>
      </article>`
    )
    .join("");

  const rodizio = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Dia A · PT</th>
            <th>Dia B · Math</th>
            <th>Dia C · EN</th>
            <th>Dia D · Mundo</th>
          </tr>
        </thead>
        <tbody>
          ${data.modelo.rodizio
            .map(
              (row) => `
            <tr>
              <td><strong>${escapeHtml(row.semana)}</strong></td>
              <td>${escapeHtml(row.a)}</td>
              <td>${escapeHtml(row.b)}</td>
              <td>${escapeHtml(row.c)}</td>
              <td>${escapeHtml(row.d)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;

  const materiais = data.materiais
    .map((item) => `<li><span class="box" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`)
    .join("");

  const estrutura = data.modelo.estrutura
    .map((step, i) => `<li><span class="box" aria-hidden="true"></span><span>${i + 1}. ${escapeHtml(step)}</span></li>`)
    .join("");

  content.innerHTML = `
    <div class="callout"><strong>Nível:</strong> ${escapeHtml(data.intro.nivel)}</div>
    <h2 class="library-section" style="margin-bottom:0.75rem">Regras de ouro</h2>
    <div class="grid-tips">${regras}</div>
    <h2>Forma da semana</h2>
    ${visao}
    <h2>Semana 1 — dia a dia</h2>
    <p style="color:var(--ink-soft);margin-top:-0.35rem">Antes de segunda: façam o cartão “já sei” e a lista de materiais.</p>
    <div class="day-stack">${semana}</div>
    <section class="library-section">
      <h2>${escapeHtml(data.modelo.titulo)}</h2>
      <p class="blurb">${escapeHtml(data.modelo.texto)}</p>
      ${rodizio}
      <h3>Mini-estrutura (15 min)</h3>
      <ul class="checklist">${estrutura}</ul>
    </section>
    <section class="library-section">
      <h2>Materiais — Semana 1</h2>
      <ul class="checklist">${materiais}</ul>
    </section>
  `;
}

function downloadBlob(filename, text, type = "text/markdown;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function printableHtml(title, markdown) {
  const body = escapeHtml(markdown).replaceAll("\n", "<br>\n");
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>${escapeHtml(title)}</title>
<style>
  body{font-family:Georgia,serif;max-width:740px;margin:2rem auto;padding:0 1rem;line-height:1.5;color:#1d3d3a}
  h1{color:#1f6b5c} .noprint{margin-bottom:1rem}
  @media print{.noprint{display:none}}
</style></head><body>
<p class="noprint"><button onclick="window.print()">Imprimir / salvar PDF</button></p>
<h1>${escapeHtml(title)}</h1>
<article>${body}</article>
</body></html>`;
}

const KIT_MD = `# Kit Semana 1 — Bella

Checklist caseira para a Família R & M (sem folhas oficiais Kumon).

## Separar / fazer
- [ ] Cartão “já sei” (letras e números de hoje)
- [ ] Cartão grande BELLA
- [ ] Calendário de parede + clip do dia
- [ ] 8–10 objetos para contar
- [ ] Tampinhas em 2 cores
- [ ] Massinha
- [ ] 1 livro ilustrado PT
- [ ] Pasta “da Bella”
- [ ] Giz / lápis grosso
- [ ] 1 música EN (adulto junto)

## Opcional
- [ ] 1 folha só com números que ela já traça
- [ ] Apoio visual de dias/clima
- [ ] 3 pares de memória (sol, bola, estrela)

## Plano
- Segunda — Português: letras do nome (10–12 min)
- Terça — Matemática: números + quantidade (10 min)
- Quarta — Inglês oral (8–10 min, só EN)
- Quinta — Sons + memória (12 min)
- Sexta — Formas/padrões ou Mundo (≤ 10 min)
- Fim de semana — Escolha da Bella + livro em voz alta

## Checklist dos pais
- [ ] Quais letras/números entraram no cartão “já sei”?
- [ ] Contou até quanto com objetos?
- [ ] Qual sessão ela mais pediu de novo?
- [ ] Tentamos só 1 novidade por vez?
- [ ] O horário funcionou?

Regra: conhecido primeiro · no máximo 1 novidade · parar enquanto está gostoso.
`;

let bibliotecaMd = "";
let rotinaMd = "";

function wireDownloads() {
  document.querySelectorAll("[data-download]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.getAttribute("data-download");
      if (kind === "biblioteca-md") {
        downloadBlob("biblioteca-materiais-bella.md", bibliotecaMd);
      } else if (kind === "rotina-md") {
        downloadBlob("rotina-semanal-bella.md", rotinaMd);
      } else if (kind === "kit-md") {
        downloadBlob("kit-semana1-bella.md", KIT_MD);
      } else if (kind === "biblioteca-html") {
        const html = printableHtml("Biblioteca de materiais — Bella", bibliotecaMd);
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(html);
          w.document.close();
        }
      } else if (kind === "rotina-html") {
        const html = printableHtml("Rotina semanal — Bella", rotinaMd);
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(html);
          w.document.close();
        }
      }
    });
  });
}

function wireNav() {
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    const nav = document.getElementById("menu-principal");
    const open = nav?.classList.toggle("open");
    document.getElementById("menu-toggle")?.setAttribute("aria-expanded", String(!!open));
  });

  window.addEventListener("hashchange", () => setActivePage(currentRoute()));
  setActivePage(currentRoute());
}

async function boot() {
  wireNav();
  wireDownloads();

  try {
    const [bibJson, rotJson, bibMd, rotMd] = await Promise.all([
      fetchJson("./content/biblioteca.json"),
      fetchJson("./content/rotina.json"),
      fetchText("./content/biblioteca.md"),
      fetchText("./content/rotina.md"),
    ]);
    bibliotecaMd = bibMd;
    rotinaMd = rotMd;
    renderBiblioteca(bibJson);
    renderRotina(rotJson);
  } catch (err) {
    console.error(err);
    document.getElementById("bib-subtitle").textContent =
      "Não foi possível carregar a biblioteca. Recarregue a página.";
    document.getElementById("rot-subtitle").textContent =
      "Não foi possível carregar a rotina. Recarregue a página.";
  }
}

boot();
