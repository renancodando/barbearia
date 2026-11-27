// RNCWEB
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { criarCabelo, criarBarba, sondar, sorteador } from "./cabelo.js";
import { criarFerramentas } from "./ferramentas.js";
import { criarFiosSoltos } from "./fisica.js";
import { misturar,suave } from "./rolagem.js";

function texturaPele() {
  const sorteio=sorteador(5280);
  const pontos=new Uint8Array(256*256*4);
  for(let i=0;i<pontos.length;i+=4){
    const cor=100+sorteio()*55;
    pontos.set([cor,cor,cor,255],i);
  }
  const textura=new T.DataTexture(pontos,256,256);
  textura.wrapS=textura.wrapT=T.RepeatWrapping;
  textura.repeat.set(11,11);
  textura.minFilter=T.LinearMipmapLinearFilter;
  textura.magFilter=T.LinearFilter;
  textura.generateMipmaps=true; textura.needsUpdate=true;
  return textura;
}

function criarCapa() {
  const amostras=[
    [-1.24,.42,.48],[-1.28,.49,.52],[-1.37,.61,.60],
    [-1.48,.94,.69],[-1.57,1.42,.81],[-1.76,1.77,.94],[-2.02,1.94,.99],
  ];
  const vertices=[],indices=[];
  const total=112;
  for(let i=0;i<amostras.length;i++){
    const [y,x,z]=amostras[i],peso=i/(amostras.length-1);
    for(let j=0;j<=total;j++){
      const a=j/total*Math.PI*2;
      const dobra=Math.sin(a*13+i*.42)*.052+Math.sin(a*29+i*.6)*.015;
      vertices.push(Math.sin(a)*(x+peso*dobra),y+peso*dobra*1.3,Math.cos(a)*(z+peso*dobra)-.055);
      if(i===0||j===0)continue;
      const a1=i*(total+1)+j;
      indices.push(a1-total-2,a1,a1-1,a1-total-2,a1-total-1,a1);
    }
  }
  const malha=new T.BufferGeometry();
  malha.setIndex(indices);malha.setAttribute("position",new T.Float32BufferAttribute(vertices,3));
  malha.computeVertexNormals();
  const capa=new T.Mesh(malha,new T.MeshPhysicalMaterial({color:0x1a1613,roughness:.55,clearcoat:.32,side:T.DoubleSide}));
  const gola=new T.Mesh(new T.TorusGeometry(.46,.022,12,72),new T.MeshStandardMaterial({color:0x100e0d,roughness:.65}));
  gola.rotation.x=Math.PI*.5;gola.position.set(0,-1.258,-.055);gola.scale.set(1,1.05,1);
  const prendedor=new T.Mesh(new T.CylinderGeometry(.031,.031,.018,20),new T.MeshStandardMaterial({color:0x96704e,metalness:.45,roughness:.4}));
  prendedor.rotation.x=Math.PI*.5;prendedor.position.set(.15,-1.273,.397);
  const grupo=new T.Group();grupo.add(capa,gola,prendedor);return grupo;
}

function colocarOlhos(cabeca,centros) {
  const branco=new T.MeshPhysicalMaterial({color:0xcbbcaf,roughness:.25,clearcoat:.3});
  const iris=new T.MeshStandardMaterial({color:0x4b3522,roughness:.38});
  const pupila=new T.MeshPhysicalMaterial({color:0x0c0806,roughness:.22,clearcoat:1});
  const geometria=new T.SphereGeometry(.144,32,20);
  const ocular=new T.SphereGeometry(1,30,16);
  for(const posicao of Object.values(centros)) {
    const olho=new T.Mesh(geometria,branco);
    olho.position.fromArray(posicao);
    const circulo=new T.Mesh(ocular,iris);
    circulo.scale.set(.060,.060,.014);circulo.position.set(.012,0,.138);
    const centro=new T.Mesh(ocular,pupila);
    centro.scale.set(.029,.029,.007);centro.position.set(.016,0,.151);
    olho.add(circulo,centro);cabeca.add(olho);
  }
}
function acender(cena) {
  cena.add(new T.HemisphereLight(0xffe8cf,0x3b2926,1.21));
  for (const [cor,intensidade,x,y,z] of [
    [0xffe0bb,3.06,3.7,4.4,4.9],[0xffb169,5.4,-2.7,2.5,-3.5],[0xa4b4c0,.66,-3.8,.3,3.7],[0xffd195,1.15,2.1,.5,-3.1],
  ]){
    const luz=new T.DirectionalLight(cor,intensidade);
    luz.position.set(x,y,z);cena.add(luz);
  }
}

export async function iniciarCena(visor,estado,movimentoReduzido) {
  const tela=visor.querySelector("canvas");
  const render=new T.WebGLRenderer({canvas:tela,alpha:true,antialias:true,powerPreference:"default"});
  render.toneMapping=T.ACESFilmicToneMapping;
  render.toneMappingExposure=.91;
  render.setClearColor(0,0);
  const cena=new T.Scene(), conjunto=new T.Group();
  cena.add(conjunto);acender(cena);
  const camera=new T.PerspectiveCamera(37,1,.1,32);
  const base=import.meta.env.BASE_URL;
  let modelo;
  let centros;
  try {
    [modelo,centros]=await Promise.all([
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(base+"modelos/cabeca.glb"),
      fetch(base+"modelos/olhos.json").then(r=>{if(!r.ok)throw new Error("Olhos indisponíveis");return r.json();}),
    ]);
  } catch(erro){render.dispose();throw erro;}
  let cabeca;
  modelo.scene.traverse(objeto=>{if(objeto.isMesh)cabeca=objeto;});
  if(!cabeca){render.dispose();throw new Error("Modelo sem geometria");}
  // Aplica as transformações do arquivo antes de projetar as raízes do cabelo.
  modelo.scene.updateMatrixWorld(true);
  cabeca.geometry.applyMatrix4(cabeca.matrixWorld);
  cabeca.position.set(0,0,0);cabeca.rotation.set(0,0,0);cabeca.scale.set(1,1,1);
  cabeca.material.dispose();
  const pele=new T.MeshPhysicalMaterial({vertexColors:true,color:0xffffff,roughness:.61,clearcoat:.06});
  if(cabeca.geometry.attributes.uv){
    pele.bumpMap=texturaPele();pele.bumpScale=.019;
  }
  cabeca.material=pele;
  cabeca.updateMatrixWorld(true);
  const sonda=sondar(cabeca);
  const cabelo=criarCabelo(cabeca,sonda), barba=criarBarba(cabeca);
  const ferramentas=criarFerramentas(), fios=criarFiosSoltos(cabelo.raizes);
  colocarOlhos(cabeca,centros);
  conjunto.add(cabeca,cabelo.objeto,barba,criarCapa(),ferramentas.grupo,fios.objeto);
  let qualidade=(navigator.hardwareConcurrency||4)>=6?2:1;
  let queria=0, exibido=0, estilo=0, observado=false, contexto=true, quadro=0;
  let anterior=0, tempoMedio=16, amostras=0, ajuste=0, rodando=false;
  let alvoAntigo=-1, estiloAntigo=-1, nivelAntigo=-1;
  function dimensionar(){
    const {width,height}=visor.getBoundingClientRect();
    if(!width||!height)return;
    const densidade=Math.min([.85,1.18,1.65][qualidade],devicePixelRatio||1,1650/width);
    render.setPixelRatio(densidade);
    render.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
  }
  function desenhar(agora){
    const dt=anterior?Math.min(.1,(agora-anterior)/1000):.016;
    anterior=agora;
    const suaveScroll=movimentoReduzido.matches?1:1-Math.exp(-17*dt);
    exibido=misturar(exibido,queria,suaveScroll);
    if(Math.abs(exibido-queria)<.00025)exibido=queria;
    const p=exibido, leve=movimentoReduzido.matches?0:Math.sin(agora*.00065)*.018;
    const lateral=suave(.14,.26,p)-suave(.37,.45,p);
    const esquerda=suave(.32,.38,p)-suave(.45,.49,p);
    const acabamento=suave(.64,.72,p)-suave(.79,.87,p);
    const giro=.62+.55*lateral-.95*esquerda+.42*acabamento+2.2*suave(.905,.972,p)-3.05*suave(.967,1,p);
    conjunto.rotation.y=-giro+leve;
    const aproxima=.12*suave(.16,.28,p)-.19*suave(.9,1,p);
    const larguraVista=2*Math.tan(T.MathUtils.degToRad(18.5))*camera.aspect;
    const distancia=Math.max(5.60,3.65/Math.max(.4,larguraVista)) - aproxima;
    camera.position.set(.07, .10+.18*suave(.43,.55,p)-.18*suave(.61,.68,p),distancia);
    camera.lookAt(0,-.23,0);
    if(p!==alvoAntigo||estilo!==estiloAntigo||qualidade!==nivelAntigo) {
      cabelo.atualizar(p,estilo,qualidade);
      ferramentas.atualizar(p,sonda);
      fios.atualizar(p,qualidade);
      alvoAntigo=p;estiloAntigo=estilo;nivelAntigo=qualidade;
    }
    render.render(cena,camera);
    if (rodando && p!==queria && dt<.12) {
      tempoMedio=misturar(tempoMedio,dt*1000,.09);amostras++;
      if(amostras>45 && agora-ajuste>1400){
        const novo=tempoMedio>32?Math.max(0,qualidade-1):tempoMedio<18?Math.min(2,qualidade+1):qualidade;
        if(novo!==qualidade){qualidade=novo;dimensionar();}
        amostras=0;ajuste=agora;
      }
    }
  }
  function executar(agora){
    quadro=0;
    if(!contexto||!observado||document.hidden)return;
    desenhar(agora);
    if(!movimentoReduzido.matches)quadro=requestAnimationFrame(executar);
  }
  function ativar(){
    if(!contexto||!observado||document.hidden){cancelAnimationFrame(quadro);quadro=0;rodando=false;anterior=0;return;}
    if(!quadro){rodando=true;quadro=requestAnimationFrame(executar);}
  }
  new IntersectionObserver(([entrada])=>{observado=entrada.isIntersecting;ativar();}).observe(visor);
  new ResizeObserver(()=>{dimensionar();ativar();}).observe(visor);
  document.addEventListener("visibilitychange",ativar);
  movimentoReduzido.addEventListener("change",ativar);
  tela.addEventListener("webglcontextlost",evento=>{
    evento.preventDefault();contexto=false;estado(false);ativar();
  });
  tela.addEventListener("webglcontextrestored",()=>{
    contexto=true;dimensionar();desenhar(performance.now());estado(true);ativar();
  });
  addEventListener("pagehide",evento=>{
    if(evento.persisted)return;
    cancelAnimationFrame(quadro);
    const geometrias=new Set(), materiais=new Set();
    cena.traverse(objeto=>{
      if(objeto.geometry)geometrias.add(objeto.geometry);
      if(objeto.material)materiais.add(objeto.material);
    });
    for(const g of geometrias)g.dispose();
    for(const m of materiais){m.bumpMap?.dispose();m.dispose();}
    render.dispose();
  },{once:true});
  dimensionar();desenhar(performance.now());estado(true);
  return {atualizar(p,novoEstilo){queria=p;estilo=novoEstilo;ativar();}};
}
