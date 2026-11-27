// RNCWEB
import * as T from "three";
import { sorteador, centro } from "./cabelo.js";
import { limitar,suave } from "./rolagem.js";

export function criarFiosSoltos(raizes) {
  const sorteio=sorteador(7884);
  const eventos=raizes.filter(r=>r.guia&&sorteio()<.68).flatMap(r=>{
    const base={r,vx:(sorteio()-.5)*.65,vz:(sorteio()-.5)*.56,vy:.15+sorteio()*.65,
      giro:sorteio()*6.28,tamanho:.28+sorteio()*.66,variacao:sorteio()};
    return r.topo?[{...base,momento:r.corte}]:[{...base,momento:r.corte},{...base,momento:r.acabamento,tamanho:base.tamanho*.69}];
  });
  const geo=new T.CapsuleGeometry(.0042,.073,1,3);
  const fios=new T.InstancedMesh(geo,new T.MeshStandardMaterial({color:0x58402c,roughness:.64}),eventos.length);
  fios.frustumCulled=false;fios.instanceMatrix.setUsage(T.DynamicDrawUsage);
  const deslocamento=new T.Object3D();
  const externo=new T.Vector3();
  function atualizar(p,nivel) {
    const limpeza=suave(.85,.95,p);
    let i=0,k=0;
    for(const e of eventos){
      if(++k%3>=nivel+1)continue;
      const t=(p-e.momento)*13;
      if(t<0||limpeza>=e.variacao*.94+.06)continue;
      const {r}=e;
      const ar=(1-Math.exp(-2.6*t))/2.6;
      const radial=Math.hypot(r.p.x,r.p.z);
      const solo=-1.24-.38*limitar((radial-.34)/.84);
      externo.copy(r.p).sub(centro).normalize().multiplyScalar(.075+ar*.67);
      const y=r.p.y+externo.y+ar*e.vy-3.6*(t-ar);
      const repouso=y<=solo;
      deslocamento.position.set(r.p.x+externo.x+ar*e.vx+limpeza*.4,Math.max(solo,y),r.p.z+externo.z+ar*e.vz);
      deslocamento.rotation.set(repouso ? 1.56 : e.giro+t*2.7, e.giro+t*.07, e.giro+t*3.6);
      deslocamento.scale.setScalar(e.tamanho*(1-limpeza*.6));
      deslocamento.updateMatrix();
      fios.setMatrixAt(i++,deslocamento.matrix);
    }
    fios.count=i;fios.instanceMatrix.needsUpdate=true;
  }
  return {objeto:fios,atualizar};
}
