// RNCWEB
import { icone } from "./interface.js";

const fotos = [
  {
    arquivo: "maquina",
    titulo: "Degradê",
    descricao:
      "A máquina reduz o comprimento ao redor da orelha e desenha a passagem da lateral para o topo.",
  },
  {
    arquivo: "tesoura",
    titulo: "Topo texturizado",
    descricao: "Tesoura e pente definem o comprimento e preservam o movimento das mechas.",
  },
  {
    arquivo: "resultado",
    titulo: "Acabamento",
    descricao: "O contorno rente valoriza o perfil e a transição entre comprimentos.",
  },
];

export function iniciarGaleria() {
  const lista = document.querySelector("#fotos-galeria");
  const janela = document.querySelector("#visualizar-galeria");
  const imagem = janela.querySelector("img");
  const titulo = janela.querySelector("#titulo-foto");
  const descricao = janela.querySelector("#descricao-foto");
  const posicao = janela.querySelector("#posicao-foto");
  const caminho = (foto) => import.meta.env.BASE_URL + "texturas/" + foto.arquivo + ".webp";
  let indice = 0;
  const cartoes = [];
  let origem = null;
  let inicioToque = null;

  function exibir(proximo) {
    indice = (proximo + fotos.length) % fotos.length;
    const foto = fotos[indice];
    imagem.src = caminho(foto);
    imagem.alt = foto.descricao;
    titulo.textContent = foto.titulo;
    descricao.textContent = foto.descricao;
    posicao.textContent = indice + 1 + " de " + fotos.length;
  }

  for (const [ordem, foto] of fotos.entries()) {
    const botao = document.createElement("button");
    const miniatura = document.createElement("img");
    const legenda = document.createElement("span");
    botao.type = "button";
    botao.className = "foto-galeria";
    botao.setAttribute("aria-label", "Ampliar " + foto.titulo.toLowerCase());
    miniatura.src = caminho(foto);
    miniatura.alt = "";
    miniatura.loading = "lazy";
    miniatura.decoding = "async";
    miniatura.draggable = false;
    legenda.textContent = foto.titulo;
    legenda.append(icone("ampliar"));
    botao.append(miniatura, legenda);
    botao.addEventListener("click", () => {
      origem = botao;
      exibir(ordem);
      janela.showModal();
    });
    lista.append(botao);
    cartoes.push(botao);
  }
  iniciarVitrine(lista, cartoes);

  for (const botao of janela.querySelectorAll("[data-passo]")) {
    botao.addEventListener("click", () => exibir(indice + Number(botao.dataset.passo)));
  }
  janela.addEventListener("keydown", (evento) => {
    if (!["ArrowLeft", "ArrowRight"].includes(evento.key)) return;
    evento.preventDefault();
    exibir(indice + (evento.key === "ArrowLeft" ? -1 : 1));
  });
  imagem.addEventListener(
    "touchstart",
    (evento) => {
      inicioToque = evento.changedTouches[0];
    },
    { passive: true },
  );
  imagem.addEventListener(
    "touchend",
    (evento) => {
      const final = evento.changedTouches[0];
      if (!inicioToque || !final) return;
      const x = final.clientX - inicioToque.clientX;
      const y = final.clientY - inicioToque.clientY;
      if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y)) exibir(indice + (x < 0 ? 1 : -1));
      inicioToque = null;
    },
    { passive: true },
  );
  imagem.addEventListener("touchcancel", () => {
    inicioToque = null;
  });
  janela.addEventListener("close", () => {
    inicioToque = null;
    origem?.focus({ preventScroll: true });
  });
}

function iniciarVitrine(trilha, cartoes) {
  const controles = [...document.querySelectorAll("[data-vitrine]")];
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  let arrasto = null;
  let ignorarClique = false;
  const limite = () => Math.max(0, trilha.scrollWidth - trilha.clientWidth);
  const destinos = () =>
    cartoes.map((cartao) => Math.min(limite(), cartao.offsetLeft - cartoes[0].offsetLeft));

  function atualizarControles() {
    controles[0].disabled = trilha.scrollLeft < 2;
    controles[1].disabled = trilha.scrollLeft + 2 >= limite();
  }
  function deslizar(esquerda) {
    trilha.scrollTo({ left: esquerda, behavior: reduzido.matches ? "instant" : "smooth" });
  }
  for (const botao of controles) {
    botao.addEventListener("click", () => {
      const anterior = botao.dataset.vitrine === "-1";
      const atual = trilha.scrollLeft;
      const opcoes = destinos();
      const destino = anterior
        ? opcoes.findLast((posicao) => posicao < atual - 2)
        : opcoes.find((posicao) => posicao > atual + 2);
      deslizar(destino ?? (anterior ? 0 : limite()));
    });
  }

  trilha.addEventListener("pointerdown", (evento) => {
    ignorarClique = false;
    if (evento.pointerType !== "mouse" || evento.button !== 0) return;
    arrasto = { id: evento.pointerId, x: evento.clientX, esquerda: trilha.scrollLeft, ativo: false };
  });
  trilha.addEventListener("pointermove", (evento) => {
    if (!arrasto || arrasto.id !== evento.pointerId) return;
    const deslocamento = evento.clientX - arrasto.x;
    if (!arrasto.ativo && Math.abs(deslocamento) < 7) return;
    if (!arrasto.ativo) {
      trilha.setPointerCapture(evento.pointerId);
      trilha.classList.add("arrastando");
      arrasto.ativo = true;
    }
    trilha.scrollLeft = arrasto.esquerda - deslocamento;
  });
  function encerrarArrasto() {
    if (!arrasto) return;
    if (arrasto.ativo) {
      ignorarClique = true;
      const atual = trilha.scrollLeft;
      const encaixe = destinos().reduce(
        (proximo, posicao) => (Math.abs(posicao - atual) < Math.abs(proximo - atual) ? posicao : proximo),
        0,
      );
      trilha.classList.remove("arrastando");
      deslizar(encaixe);
    }
    arrasto = null;
  }
  trilha.addEventListener("pointerup", encerrarArrasto);
  trilha.addEventListener("pointercancel", encerrarArrasto);
  trilha.addEventListener("pointerleave", () => {
    if (!arrasto?.ativo) arrasto = null;
  });
  trilha.addEventListener(
    "click",
    (evento) => {
      if (ignorarClique && evento.detail > 0) {
        evento.preventDefault();
        evento.stopPropagation();
        ignorarClique = false;
      }
    },
    { capture: true },
  );
  trilha.addEventListener("scroll", atualizarControles, { passive: true });
  new ResizeObserver(atualizarControles).observe(trilha);
  atualizarControles();
}
