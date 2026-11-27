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
  const texto = painel.querySelector("#texto-detalhe");
  const rotulo = painel.querySelector("#rotulo-detalhe");
  const titulo = painel.querySelector("#titulo-detalhe");
  const descricao = painel.querySelector("#descricao-detalhe");
  const valor = painel.querySelector("#valor-detalhe");
  const duracao = painel.querySelector("#duracao-detalhe");
  const agenda = painel.querySelector("#agenda-detalhe");
  const foto = painel.querySelector("#foto-detalhe");
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const horizontal = matchMedia("(max-width: 680px)");
  let selecionado = -1;
  let pedidoImagem = 0;

  function trocarImagem(item, animar) {
    const caminho = import.meta.env.BASE_URL + "texturas/servico-" + item.chave + ".webp";
    const pedido = ++pedidoImagem;
    if (foto.getAttribute("src") === caminho) {
      foto.dataset.servico = item.chave;
      foto.alt = item.imagemAlt;
      return;
    }
    const nova = new Image();
    nova.addEventListener(
      "load",
      () => {
        if (pedido !== pedidoImagem) return;
        foto.src = caminho;
        foto.dataset.servico = item.chave;
        foto.alt = item.imagemAlt;
        if (animar && !reduzido.matches) {
          foto.getAnimations().forEach((movimento) => movimento.cancel());
          foto.animate(
            [
              { opacity: 0.53, transform: "scale(1.024)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: 480,
              easing: "cubic-bezier(.22,.72,.24,1)",
            },
          );
        }
      },
      { once: true },
    );
    nova.src = caminho;
  }

  function selecionar(indice, focar = false) {
    if (indice === selecionado) return;
    const item = empresa.servicos[indice];
    const animar = selecionado !== -1;
    selecionado = indice;
    abas.forEach((aba, ordem) => {
      const ativa = ordem === indice;
      aba.setAttribute("aria-selected", String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
    });
    painel.setAttribute("aria-labelledby", abas[indice].id);
    painel.removeAttribute("aria-label");
    rotulo.textContent = item.resumo;
    titulo.textContent = item.nome;
    descricao.textContent = item.descricao;
    valor.textContent = formatarPreco(item.preco);
    duracao.textContent = item.duracao;
    agenda.dataset.agendar = item.chave;
    trocarImagem(item, animar);
    if (animar && !reduzido.matches) {
      texto.getAnimations().forEach((movimento) => movimento.cancel());
      texto.animate(
        [
          { opacity: 0.45, transform: "translateY(6px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 340,
          easing: "cubic-bezier(.22,.72,.24,1)",
        },
      );
    }
    if (focar) abas[indice].focus();
  }

  const abas = empresa.servicos.map((item, indice) => {
    const aba = document.createElement("button");
    const nome = document.createElement("strong");
    const tempo = document.createElement("span");
    aba.type = "button";
    aba.id = "aba-" + item.chave;
    aba.className = "cartao-servico";
    aba.setAttribute("role", "tab");
    aba.setAttribute("aria-controls", painel.id);
    nome.textContent = item.nome;
    tempo.textContent = item.duracao;
    aba.append(nome, tempo);
    aba.addEventListener("click", () => selecionar(indice));
    lista.append(aba);
    return aba;
  });
  function orientarAbas() {
    lista.setAttribute("aria-orientation", horizontal.matches ? "horizontal" : "vertical");
  }
  orientarAbas();
  horizontal.addEventListener("change", orientarAbas);
  lista.addEventListener("keydown", (evento) => {
    const recuar = horizontal.matches ? "ArrowLeft" : "ArrowUp";
    const avancar = horizontal.matches ? "ArrowRight" : "ArrowDown";
    const alvos = {
      [recuar]: (selecionado + abas.length - 1) % abas.length,
      [avancar]: (selecionado + 1) % abas.length,
      Home: 0,
      End: abas.length - 1,
    };
    if (!Object.hasOwn(alvos, evento.key)) return;
    evento.preventDefault();
    selecionar(alvos[evento.key], true);
  });
  painel.tabIndex = 0;
  selecionar(0);
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

export function revelarSecoes() {
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        observador.unobserve(entrada.target);
        if (reduzido.matches) continue;
        entrada.target.animate(
          [
            { opacity: 0.52, transform: "translateY(12px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 530, easing: "cubic-bezier(.22,.72,.24,1)" },
        );
      }
    },
    { threshold: 0.12 },
  );
  for (const elemento of document.querySelectorAll("[data-revelar]")) observador.observe(elemento);
}
