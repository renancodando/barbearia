// RNCWEB
import * as T from "three";
import { limitar, misturar, suave } from "./rolagem.js";

export function sorteador(semente) {
  return () => {
    semente=(Math.imul(1664525,semente)+1013904223)>>>0;
    return semente/4294967296;
  };
}
const volta=Math.PI*2;
export const centro=new T.Vector3(0,.38,-.02);
export function sondar(cabeca) {
  const raio=new T.Raycaster();
  const alvo=new T.Vector3(),direcao=new T.Vector3();
  return (angulo,altura) => {
    alvo.set(Math.sin(angulo)*.80,altura,Math.cos(angulo)*.80);
    direcao.copy(alvo).sub(centro).normalize();
    raio.set(centro.clone().addScaledVector(direcao,4),direcao.negate());
    const ponto=raio.intersectObject(cabeca,false)[0]?.point;
    return ponto??alvo.sub(centro).normalize().multiplyScalar(.75).add(centro);
  };
}
function percursoLateral(progresso,alturaInicial,alturaFinal) {
  const trecho=limitar(progresso)*12;
  const indice=Math.min(11,Math.floor(trecho));
  const local=trecho-indice;
  const ida=indice%2===0;
  return [misturar(1.20,5.08,(indice+suave(.67,1,local))/12),
    misturar(alturaInicial,alturaFinal,ida?suave(0,.72,local):1-suave(0,.72,local))];
}
export function passada(p) {
  if(p<.45)return percursoLateral((p-.2)/.25,.05,.56);
  if(p<.65){
    const t=limitar((p-.45)/.20);
    return [t*volta,.94+.57*Math.sin(t*Math.PI)];
  }
  return percursoLateral((p-.65)/.2,-.12,.32);
}
function movimentoLocal(angulo,altura,topo) {
  const dist=topo?0:limitar((angulo-1.2)/3.88)*12;
  const i=Math.min(11,Math.floor(dist));
  const sobe=suave(.03,.54,altura);
  const fase=(i+.10+.61*(i%2?1-sobe:sobe))/12;
  return topo?[.454+.182*angulo/volta,1]:[.20+.25*fase,.65+.20*fase];
}
export function medidas(raiz,progresso,estilo) {
  const { altura, topo, inicial, corte, acabamento }=raiz;
  const final=topo? (estilo ? .24 : .32)+inicial*.14 : misturar(.009,.108,suave(-.11,.55,altura));
  if(topo)return misturar(inicial,final,suave(corte-.004,corte+.008,progresso));
  const reducao=misturar(inicial,Math.min(inicial*.68,final+.077),suave(corte-.003,corte+.008,progresso));
  return misturar(reducao,final,suave(acabamento-.003,acabamento+.008,progresso));
}

export function criarCabelo(cabeca,sonda) {
  const aleatorio=sorteador(5127);
  const raizes=[];
  for(let i=0;i<620;i++){
    const angulo=(i*2.399963+aleatorio()*.07)%volta;
    const frente=Math.cos(angulo);
    const minimo=frente>.24 ? misturar(.16,.65,suave(.24,.92,frente)) : misturar(-.28,.19,suave(-.85,.24,frente));
    const altura=misturar(minimo,1.8,Math.sqrt(aleatorio()));
    const p=sonda(angulo,altura);
    if(p.y<minimo-.024 || p.y<-.28)continue;
    const topo=p.y>.61 || (frente>.3&&p.y>.45);
    const normal=p.clone().sub(centro).multiply(new T.Vector3(1.19,.86,1)).normalize();
    const rumo=new T.Vector3(.86,.03,-.61);
    rumo.addScaledVector(normal,-rumo.dot(normal));
    if(rumo.lengthSq()<.03)rumo.set(0,0,-1);
    rumo.normalize();
    const lado=new T.Vector3().crossVectors(normal,rumo);
    const [corte,acabamento]=movimentoLocal(angulo,p.y,topo);
    const onda=Math.sin(angulo*2.1+altura*7);
    const largura=(topo?.013:.0105)*(.82+aleatorio()*.56);
    const inicial=(topo?.48:.195)*(1+.24*onda+aleatorio()*.68);
    for(let j=0;j<5;j++){
      const pos=p.clone().addScaledVector(rumo,(aleatorio()-.5)*.038).addScaledVector(lado,(j-2)*.012);
      raizes.push({p:pos,normal,rumo,lado,topo,altura:p.y,inicial:inicial*(.82+aleatorio()*.36),
        corte,acabamento,largura:largura*(.61+aleatorio()*.44),onda:onda+j*.16,cor:aleatorio(),guia:j===0});
    }
  }
  const segmentos=8,laterais=4,porFio=(segmentos+1)*laterais;
  const vertices=new Float32Array(raizes.length*porFio*3);
  const normais=new Float32Array(vertices.length);
  const cores=new Float32Array(vertices.length);
  const indices=new Uint32Array(raizes.length*segmentos*laterais*6);
  const raizCor=new T.Color("#211610"), brilho=new T.Color("#89583c");
  const cor=new T.Color();
  let k=0;
  for(const [i,r] of raizes.entries()){
    for(let j=0;j<=segmentos;j++) {
      cor.copy(raizCor).lerp(brilho,r.cor**2*.56+j/segmentos*.11);
      for(let n=0;n<laterais;n++){
        const a=i*porFio+j*laterais+n;
        cor.toArray(cores,a*3);
        if(j===segmentos)continue;
        const b=i*porFio+j*laterais+(n+1)%laterais;
        indices[k++]=a;indices[k++]=b;indices[k++]=a+laterais;
        indices[k++]=b;indices[k++]=b+laterais;indices[k++]=a+laterais;
      }
    }
  }
  const geometria=new T.BufferGeometry();
  geometria.setIndex(new T.BufferAttribute(indices,1));
  geometria.setAttribute("position",new T.BufferAttribute(vertices,3).setUsage(T.DynamicDrawUsage));
  geometria.setAttribute("normal",new T.BufferAttribute(normais,3).setUsage(T.DynamicDrawUsage));
  geometria.setAttribute("color",new T.BufferAttribute(cores,3));
  const objeto=new T.Mesh(geometria,new T.MeshPhysicalMaterial({vertexColors:true,roughness:.4,anisotropy:.48,side:T.DoubleSide}));
  objeto.frustumCulled=false;
  const quadros=Array.from({length:laterais},(_,i)=>[Math.cos(i*volta/laterais),Math.sin(i*volta/laterais)]);
  let ultimo=-1, estiloAnterior=-1,nivelAnterior=-1;
  function atualizar(progresso,estilo,nivel) {
    if(Math.abs(progresso-ultimo)<.00022 && estiloAnterior===estilo && nivelAnterior===nivel)return;
    ultimo=progresso;estiloAnterior=estilo;nivelAnterior=nivel;
    const total=Math.floor(raizes.length*[.65,.84,1][nivel]);
    geometria.setDrawRange(0,total*segmentos*laterais*6);
    for(let i=0;i<total;i++){
      const r=raizes[i], comprimento=medidas(r,progresso,estilo);
      const ativo=limitar(comprimento/.23);
      for(let j=0;j<=segmentos;j++){
        const t=j/segmentos;
        const elevacao=comprimento*(.46*Math.sin(t*2.6)+.16*t)+.007;
        const fluxo=comprimento*(t*t*(r.topo?.77:.50));
        const desvio=comprimento*.23*ativo*Math.sin(t*5+r.onda)*t;
        const x=r.p.x+r.normal.x*elevacao+r.rumo.x*fluxo+r.lado.x*desvio;
        const y=r.p.y+r.normal.y*elevacao+r.rumo.y*fluxo+r.lado.y*desvio;
        const z=r.p.z+r.normal.z*elevacao+r.rumo.z*fluxo+r.lado.z*desvio;
        const largura=Math.min(r.largura,comprimento*.18)*(1-.93*t*t);
        for(let n=0;n<laterais;n++){
          const [a,b]=quadros[n], px=r.normal.x*a+r.lado.x*b,py=r.normal.y*a+r.lado.y*b,pz=r.normal.z*a+r.lado.z*b;
          const f=(i*porFio+j*laterais+n)*3;
          vertices[f]=x+px*largura;vertices[f+1]=y+py*largura;vertices[f+2]=z+pz*largura;
          normais[f]=px;normais[f+1]=py;normais[f+2]=pz;
        }
      }
    }
    geometria.attributes.position.needsUpdate=true;
    geometria.attributes.normal.needsUpdate=true;
  }
  return {objeto,raizes,atualizar};
}

export function criarBarba(cabeca) {
  const raio=new T.Raycaster(), origem=new T.Vector3(), frente=new T.Vector3(0,0,-1);
  const aleatorio=sorteador(800);
  const pontos=[];
  for(let i=0;i<3500;i++){
    const x=(aleatorio()-.5)*1.41, y=-.99+aleatorio()*.94;
    const borde=Math.abs(x);
    const maximo=-.62+borde*.86 + .025*Math.sin(x*17);
    const bigode=y>-.49&&y<-.405&&borde<.34&&borde>.025;
    const sobrancelha=y> .12+.04*Math.cos(x*8)&&y< .17+.05*Math.cos(x*8)&&borde>.125&&borde<.52;
    if((y>maximo&&!bigode&&!sobrancelha)||y<-.88+(borde>.46?(borde-.46)*1.25:0))continue;
    origem.set(x,y,2);
    raio.set(origem,frente);
    const p=raio.intersectObject(cabeca,false)[0]?.point;
    if(!p||p.z<.32)continue;
    const comprimento=.010+aleatorio()*(sobrancelha?.054:.037);
    pontos.push(p.x,p.y,p.z+.008,p.x+(x>0?.24:-.24)*comprimento,p.y+(sobrancelha?.14:-.91)*comprimento,p.z+.011+comprimento*.67);
  }
  const geometria=new T.BufferGeometry();
  geometria.setAttribute("position",new T.Float32BufferAttribute(pontos,3));
  return new T.LineSegments(geometria,new T.LineBasicMaterial({color:0x3c261b,transparent:true,opacity:.79}));
}
