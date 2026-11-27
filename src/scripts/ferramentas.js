// RNCWEB
import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { passada, centro } from "./cabelo.js";
import { suave, misturar } from "./rolagem.js";

export function criarFerramentas() {
  const escuro=new T.MeshPhysicalMaterial({color:0x151313,roughness:.29,clearcoat:.7});
  const metal=new T.MeshStandardMaterial({color:0xb5b0a6,metalness:.74,roughness:.24});
  const bronze=new T.MeshStandardMaterial({color:0xb38250,metalness:.76,roughness:.29});
  const fosco=new T.MeshStandardMaterial({color:0x513625,roughness:.55});
  function caixa(pai,x,y,z,a,b,c,material,raio=.023) {
    const malha=new T.Mesh(new RoundedBoxGeometry(a,b,c,2,raio),material);
    malha.position.set(x,y,z);pai.add(malha);return malha;
  }
  function aro(pai,x,y,r,material){
    const malha=new T.Mesh(new T.TorusGeometry(r,.020,8,36),material);
    malha.position.set(x,y,0);pai.add(malha);
  }
  const maquina=new T.Group();
  caixa(maquina,0,-.38,0,.37,.68,.26,escuro,.068);
  caixa(maquina,0,-.30,.135,.28,.45,.024,bronze,.02);
  caixa(maquina,0,-.30,.151,.216,.40,.023,escuro,.019);
  caixa(maquina,0,-.105,0,.37,.10,.265,bronze);
  caixa(maquina,0,-.026,0,.39,.08,.22,metal);
  const dentes=new T.Group();maquina.add(dentes);
  for(let i=-7;i<=7;i++)caixa(dentes,i*.025,.024,.035,.013,.068,.118,metal,.004);
  for(let i=0;i<6;i++)caixa(maquina,0,-.48-i*.025,.150,.18,.007,.012,fosco,.003);
  caixa(maquina,0,-.22,.172,.074,.105,.034,bronze,.013);
  caixa(maquina,0,-.73,0,.20,.075,.21,bronze,.02);
  const tesoura=new T.Group(), lamina=new T.Group();
  tesoura.add(lamina);
  const pivo=new T.Vector3(0,-.34,0);
  for(const [pai,sinal] of [[tesoura,1],[lamina,-1]]) {
    const g=new T.Group();g.position.copy(pivo);pai.add(g);
    const fio=caixa(g,sinal*.015,.145,sinal*.012,.044,.346,.024,metal,.010);
    fio.rotation.z=sinal*.08;
    caixa(g,sinal*.041,-.087,0,.038,.18,.028,bronze);
    aro(g,sinal*.078,-.217,.084,bronze);
  }
  const parafuso=new T.Mesh(new T.SphereGeometry(.033,12,8),bronze);parafuso.position.copy(pivo);tesoura.add(parafuso);
  const pente=new T.Group();
  caixa(pente,0,-.04,0,.43,.085,.048,fosco,.012);
  for(let i=-10;i<=10;i++)caixa(pente,i*.020,.041,0,.009,.11,.027,fosco,.004);
  const navalha=new T.Group();
  caixa(navalha,0,-.112,0,.31,.12,.042,metal,.014);
  caixa(navalha,0,-.049,0,.28,.02,.028,metal,.004);
  const cabo=caixa(navalha,.19,-.20,.005,.30,.081,.064,escuro,.018);
  cabo.rotation.z=-.45;
  const todos=[maquina,tesoura,pente,navalha];
  const grupo=new T.Group();grupo.add(...todos);
  const vetor=new T.Vector3(), eixo=new T.Vector3(0,-1,0);
  function posicionar(ferramenta,ponto,angulo,distancia,torcao) {
    vetor.copy(ponto).sub(centro).normalize();
    ferramenta.position.copy(ponto).addScaledVector(vetor,distancia);
    const cabo=vetor.clone().multiplyScalar(.89).add(new T.Vector3(0,-.42,0)).normalize();
    ferramenta.quaternion.setFromUnitVectors(eixo,cabo);
    ferramenta.rotateY(angulo*.27+torcao);
  }
  function atualizar(p,sonda) {
    todos.forEach(g=>g.visible=false);
    if(p<.10||p>=.88)return;
    const [angulo,altura]=passada(Math.max(.20,Math.min(.849,p)));
    const ponto=sonda(angulo,altura);
    if(p<.45){
      maquina.visible=true;
      const distancia=misturar(1.40,.075,suave(.10,.20,p))+.75*suave(.432,.45,p);
      posicionar(maquina,ponto,angulo,distancia,.19);
      dentes.position.x=.014*Math.sin(p*960);
    }else if(p<.65){
      tesoura.visible=pente.visible=true;
      const distancia=.18+.84*(1-suave(.45,.47,p)+suave(.632,.65,p));
      posicionar(tesoura,ponto,angulo,distancia,-.61);
      posicionar(pente,ponto,angulo,distancia+.028,.42);
      pente.position.y-=.19;
      lamina.position.y=-.34;
      lamina.rotation.z=-(.12+.30*(.5+.5*Math.sin(p*188)));
    }else{
      navalha.visible=true;
      const distancia=.048+.85*(1-suave(.65,.667,p)+suave(.843,.88,p));
      posicionar(navalha,ponto,angulo,distancia,.87);
    }
  }
  return {grupo,atualizar};
}
