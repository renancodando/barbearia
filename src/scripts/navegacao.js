// RNCWEB
export function iniciarNavegacao() {
  const cabecalho = document.querySelector(".cabecalho");
  const navegacao = document.querySelector("#navegacao");
  const menu = document.querySelector(".alternar-menu");
  const links = [...navegacao.querySelectorAll("a")];
  const secoes = links
    .map((link) => ({ link, secao: document.getElementById(link.hash.slice(1)) }))
    .sort((a, b) => (a.secao.compareDocumentPosition(b.secao) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const compacto = matchMedia("(max-width: 980px)");
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const arte = document.querySelector(".arte");
  let ativo = links[0];
  let quadro = 0;

  function deslocarTraco(link) {
    navegacao.style.setProperty("--posicao-traco", link.offsetLeft + "px");
    navegacao.style.setProperty("--largura-traco", link.offsetWidth + "px");
  }

  function atualizar() {
    quadro = 0;
    cabecalho.classList.toggle("rolado", window.scrollY > 12);
    const linhaLeitura = cabecalho.offsetHeight + Math.min(96, innerHeight * 0.12);
    let atual = secoes[0].link;
    if (window.scrollY > 16) {
      for (const { link, secao } of secoes) {
        if (secao.getBoundingClientRect().top <= linhaLeitura) atual = link;
      }
      if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2) {
        atual = secoes.at(-1).link;
      }
    }
    if (atual !== ativo) {
      ativo.removeAttribute("aria-current");
      atual.setAttribute("aria-current", "location");
      ativo = atual;
    }
    if (!navegacao.querySelector("a:hover, a:focus-visible")) deslocarTraco(ativo);
  }
  function solicitarAtualizacao() {
    if (!quadro) quadro = requestAnimationFrame(atualizar);
  }

  function abrirMenu(abrir, devolverFoco = false) {
    navegacao.classList.toggle("aberta", abrir);
    menu.setAttribute("aria-expanded", String(abrir));
    menu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    if (abrir) {
      (navegacao.querySelector("[aria-current]") || links[0]).focus();
    } else if (devolverFoco) {
      menu.focus({ preventScroll: true });
    }
  }
  menu.addEventListener("click", () => abrirMenu(!navegacao.classList.contains("aberta")));
  cabecalho.querySelector("[data-agendar]").addEventListener("click", () => abrirMenu(false));
  for (const link of links) {
    link.addEventListener("pointerenter", () => deslocarTraco(link));
    link.addEventListener("focus", () => deslocarTraco(link));
    link.addEventListener("click", () => {
      deslocarTraco(link);
      if (compacto.matches && navegacao.classList.contains("aberta")) {
        abrirMenu(false);
        const destino = document.getElementById(link.hash.slice(1));
        const alvo = destino.querySelector("h1, h2") || destino;
        alvo.setAttribute("tabindex", "-1");
        requestAnimationFrame(() => alvo.focus({ preventScroll: true }));
      }
    });
  }
  navegacao.addEventListener("pointerleave", () => deslocarTraco(ativo));
  navegacao.addEventListener("focusout", (evento) => {
    if (!navegacao.contains(evento.relatedTarget)) deslocarTraco(ativo);
  });
  cabecalho.addEventListener("focusout", (evento) => {
    if (
      navegacao.classList.contains("aberta") &&
      evento.relatedTarget &&
      !cabecalho.contains(evento.relatedTarget)
    ) {
      abrirMenu(false);
    }
  });
  document.addEventListener("pointerdown", (evento) => {
    if (navegacao.classList.contains("aberta") && !cabecalho.contains(evento.target)) abrirMenu(false);
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && navegacao.classList.contains("aberta")) abrirMenu(false, true);
  });
  compacto.addEventListener("change", () => {
    abrirMenu(false);
    deslocarTraco(ativo);
    solicitarAtualizacao();
  });
  addEventListener("scroll", solicitarAtualizacao, { passive: true });
  addEventListener(
    "resize",
    () => {
      deslocarTraco(ativo);
      solicitarAtualizacao();
    },
    { passive: true },
  );
  document.fonts?.ready.then(() => deslocarTraco(ativo));

  const abertura = document.querySelector(".abertura");
  abertura.addEventListener(
    "pointermove",
    (evento) => {
      if (reduzido.matches || evento.pointerType !== "mouse" || compacto.matches) return;
      const caixa = abertura.getBoundingClientRect();
      arte.style.setProperty("--arte-x", ((evento.clientX - caixa.left) / caixa.width - 0.5) * -9 + "px");
      arte.style.setProperty("--arte-y", ((evento.clientY - caixa.top) / caixa.height - 0.5) * -5 + "px");
    },
    { passive: true },
  );
  abertura.addEventListener("pointerleave", () => {
    arte.style.removeProperty("--arte-x");
    arte.style.removeProperty("--arte-y");
  });

  atualizar();
}
