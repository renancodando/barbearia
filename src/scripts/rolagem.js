// RNCWEB
export const limitar = (valor) => Math.max(0, Math.min(1, valor));
export const misturar = (a,b,t) => a+(b-a)*t;
export function suave(a,b,valor) {
  const t=limitar((valor-a)/(b-a));
  return t*t*(3-2*t);
}
export const etapas = [
  [0, "Antes do corte"], [.10, "A máquina se aproxima"], [.20, "Redução das laterais"],
  [.45, "Tesoura e pente"], [.65, "Degradê e contorno"], [.85, "Limpeza e finalização"], [.95, "O resultado"],
];
export function controleRolagem(atualizar) {
  const secao=document.querySelector(".experiencia");
  const palco=secao.querySelector(".palco");
  const seletor=document.querySelector("#progresso");
  const botoes=[...document.querySelectorAll("[data-etapa]")];
  const nome=document.querySelector("#nome-etapa");
  const reduzir=matchMedia("(prefers-reduced-motion: reduce)");
  let progresso=0, estado=-1, quadro=0, previsto=null;
  function percurso() {return Math.max(0,secao.offsetHeight-palco.offsetHeight);}
  function apresentar(valor) {
    progresso=limitar(valor);
    const atual=etapas.findLastIndex(([inicio])=>progresso>=inicio);
    seletor.value=Math.round(progresso*1000);
    if (atual!==estado) {
      estado=atual;
      nome.textContent=etapas[atual][1];
      const botao=atual<2?0:atual===2?1:atual===3?2:atual<6?3:4;
      botoes.forEach((b,i)=>b.setAttribute("aria-pressed",String(i===botao)));
    }
    seletor.setAttribute("aria-valuetext",Math.round(progresso*100)+"% · "+etapas[atual][1]);
    atualizar(progresso);
  }
  function ler() {
    quadro=0;
    if(reduzir.matches||percurso()<1)return;
    const posicao=secao.getBoundingClientRect().top;
    if(previsto!==null && Math.abs(posicao-previsto)<2){previsto=null;return;}
    previsto=null;
    apresentar(-posicao/percurso());
  }
  function ir(valor) {
    apresentar(valor);
    if(reduzir.matches||percurso()<1)return;
    const y=scrollY+secao.getBoundingClientRect().top;
    previsto=-percurso()*valor;
    scrollTo(0,y-previsto);
  }
  seletor.addEventListener("input",()=>ir(Number(seletor.value)/1000));
  botoes.forEach(b=>b.addEventListener("click",()=>ir(Number(b.dataset.etapa))));
  addEventListener("scroll",()=>{if(!quadro)quadro=requestAnimationFrame(ler);},{passive:true});
  addEventListener("resize",ler,{passive:true});
  reduzir.addEventListener("change",ler);
  apresentar(0);ler();
}
