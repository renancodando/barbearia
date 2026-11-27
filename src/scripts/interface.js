// RNCWEB
export function icone(nome) {
  const espaco = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(espaco, "svg");
  const uso = document.createElementNS(espaco, "use");
  svg.classList.add("icone");
  svg.setAttribute("aria-hidden", "true");
  uso.setAttribute("href", "#i-" + nome);
  svg.append(uso);
  return svg;
}

export function iniciarServicos(empresa, formatarPreco) {
  const lista = document.querySelector("#lista-servicos");
  const painel = document.querySelector("#detalhe-servico");
  const rotulo = painel.querySelector("#rotulo-detalhe");
  const titulo = painel.querySelector("#titulo-detalhe");
  const descricao = painel.querySelector("#descricao-detalhe");
  const acao = painel.querySelector("#acao-detalhe");
  const valor = painel.querySelector("#valor-detalhe");
  const agenda = painel.querySelector("#agenda-detalhe");
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
  let selecionado = null;
  const introducao = [rotulo.textContent, titulo.textContent, descricao.textContent];

  function selecionar(item, cartao) {
    const ativo = selecionado !== cartao;
    selecionado?.setAttribute("aria-pressed", "false");
    lista.querySelector("[data-destaque]")?.removeAttribute("data-destaque");
    selecionado = ativo ? cartao : null;
    cartao.setAttribute("aria-pressed", String(ativo));
    rotulo.textContent = ativo ? "Nossos Serviços" : introducao[0];
    titulo.textContent = ativo ? item.nome : introducao[1];
    descricao.textContent = ativo ? item.descricao : introducao[2];
    acao.hidden = !ativo;
    valor.textContent = formatarPreco(item.preco) + " · " + item.duracao;
    agenda.dataset.agendar = item.chave;
    if (!reduzir.matches && typeof painel.animate === "function") {
      painel.getAnimations().forEach((animacao) => animacao.cancel());
      painel.animate(
        [
          { opacity: 0.5, transform: "translateY(3px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 340,
          easing: "cubic-bezier(.22,.75,.25,1)",
        },
      );
    }
  }

  for (const [indice, item] of empresa.servicos.entries()) {
    const cartao = document.createElement("button");
    const tituloCartao = document.createElement("strong");
    const resumo = document.createElement("span");
    cartao.type = "button";
    cartao.className = "cartao-servico";
    cartao.setAttribute("aria-controls", painel.id);
    cartao.setAttribute("aria-pressed", "false");
    if (indice === 0) cartao.dataset.destaque = "";
    tituloCartao.textContent = item.nome;
    resumo.textContent = item.resumo;
    cartao.append(icone(item.icone), tituloCartao, resumo);
    cartao.addEventListener("click", () => selecionar(item, cartao));
    cartao.addEventListener(
      "pointermove",
      (evento) => {
        if (reduzir.matches || evento.pointerType !== "mouse") return;
        const caixa = cartao.getBoundingClientRect();
        cartao.style.setProperty("--luz-x", evento.clientX - caixa.left + "px");
        cartao.style.setProperty("--luz-y", evento.clientY - caixa.top + "px");
      },
      { passive: true },
    );
    cartao.addEventListener("pointerleave", () => {
      cartao.style.removeProperty("--luz-x");
      cartao.style.removeProperty("--luz-y");
    });
    lista.append(cartao);
  }
}

export function atualizarContatos(empresa) {
  const direto = "https://wa.me/" + empresa.whatsapp;
  const consultar = (mensagem) => direto + "?text=" + encodeURIComponent(mensagem);
  const whatsapp = document.querySelector("#whatsapp");
  const endereco = document.querySelector("#endereco");
  const horario = document.querySelector("#horario");
  whatsapp.href = direto;
  whatsapp.textContent = empresa.telefone;
  endereco.href = empresa.mapas || consultar(`Olá! Podem me informar o endereço da ${empresa.nome}?`);
  if (empresa.endereco) endereco.textContent = empresa.endereco;
  horario.href = consultar(`Olá! Podem me informar o horário de funcionamento da ${empresa.nome}?`);
  if (empresa.horario) horario.textContent = empresa.horario;
}

export function iniciarJanelas() {
  for (const janela of document.querySelectorAll("dialog")) {
    janela.querySelector("[data-fechar]").addEventListener("click", () => janela.close());
    // O fundo é o próprio diálogo para eventos fora da sua caixa.
    janela.addEventListener("click", (evento) => {
      if (evento.target !== janela) return;
      const caixa = janela.getBoundingClientRect();
      if (
        evento.clientX < caixa.left ||
        evento.clientX > caixa.right ||
        evento.clientY < caixa.top ||
        evento.clientY > caixa.bottom
      ) {
        janela.close();
      }
    });
  }
}
