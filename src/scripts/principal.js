// RNCWEB
import "../estilos/global.css";
import { empresa } from "./configuracao.js";
import { iniciarAgendamento } from "./agendamento.js";
import { controleRolagem } from "./rolagem.js";

const visor=document.querySelector("#visor");
const aviso=document.querySelector("#aviso-cena");
const reduzir=matchMedia("(prefers-reduced-motion: reduce)");
const cabeloReserva=document.querySelector("#cabelo-reserva");
let cena,progresso=0,estilo=0;
const reservaOriginal=cabeloReserva.getAttribute("d");
const reservaFinal="M135 222Q122 187 132 145Q131 116 150 100Q187 68 230 76Q262 67 293 98Q307 119 296 140Q282 135 264 138Q240 149 212 145Q184 141 163 159L155 197Z";
function mostrar(proporcao) {
  progresso=proporcao;
  if(cena)cena.atualizar(progresso,estilo);
  else cabeloReserva.setAttribute("d",progresso>.65?reservaFinal:reservaOriginal);
}
iniciarAgendamento(empresa);
controleRolagem(mostrar);
for(const botao of document.querySelectorAll("[data-estilo]")){
  botao.addEventListener("click",()=>{
    estilo=Number(botao.dataset.estilo);
    for(const opcao of document.querySelectorAll("[data-estilo]")){
      opcao.setAttribute("aria-pressed",String(opcao===botao));
    }
    mostrar(progresso);
  });
}
const observar=new IntersectionObserver(async ([entrada])=>{
  if(!entrada.isIntersecting)return;
  observar.disconnect();
  try {
    const { iniciarCena }=await import("./cena3d.js");
    cena=await iniciarCena(visor,estado=>{
      visor.classList.toggle("pronto",estado);
      aviso.textContent=estado?"":"Modelo ilustrado";
    },reduzir);
    mostrar(progresso);
  } catch {
    aviso.textContent="Modelo ilustrado";
    mostrar(progresso);
  }
},{rootMargin:"180px"});
observar.observe(visor);
