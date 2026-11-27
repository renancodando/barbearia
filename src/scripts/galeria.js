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
    legenda.textContent = foto.titulo;
    legenda.append(icone("mais"));
    botao.append(miniatura, legenda);
    botao.addEventListener("click", () => {
      origem = botao;
      exibir(ordem);
      janela.showModal();
    });
    lista.append(botao);
  }

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
