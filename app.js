const data={
 plumbing:{title:'Сантехника',subtitle:'Сантехнические услуги',image:'assets/plumbing-new.png',items:[['Мелкий ремонт','от 1 500 ₽','выезд'],['Монтаж сантехники','от 2 500 ₽','единица'],['Замена труб','от 12 000 ₽','объект'],['Система отопления','от 8 000 ₽','точка'],['Ванная под ключ','от 220 000 ₽','помещение']]},
 finishing:{title:'Отделка',subtitle:'Отделочные работы',image:'assets/finishing.jpg',items:[['Штукатурка стен','от 700 ₽','м²'],['Шпаклёвка','от 450 ₽','м²'],['Покраска','от 350 ₽','м²'],['Поклейка обоев','от 450 ₽','м²'],['Плитка и керамогранит','от 1 800 ₽','м²'],['Напольные покрытия','от 600 ₽','м²']]},
 electric:{title:'Электрика',subtitle:'Электромонтажные работы',image:'assets/electric.jpg',items:[['Розетки и выключатели','от 500 ₽','точка'],['Прокладка кабеля','от 250 ₽','пог. м'],['Штробление','от 500 ₽','пог. м'],['Освещение','от 800 ₽','прибор'],['Электрощит','от 10 000 ₽','комплект'],['Электрика квартиры','от 2 000 ₽','м²']]},
 turnkey:{title:'Под ключ',subtitle:'Ремонт под ключ',image:'assets/turnkey.jpg',items:[['Косметический ремонт','от 5 000 ₽','м²'],['Капитальный ремонт','от 10 000 ₽','м²'],['Новостройка','от 10 000 ₽','м²'],['Вторичное жильё','от 11 000 ₽','м²'],['Дизайнерский ремонт','от 14 000 ₽','м²'],['Премиальный формат','от 20 000 ₽','м²']]}
};
const portal=document.querySelector('#portal'),category=document.querySelector('#category'),overlay=document.querySelector('#splitOverlay'),stack=document.querySelector('#serviceStack'),prices=document.querySelector('#priceSection'),hero=document.querySelector('#heroFixed');
let currentKey='plumbing',ticking=false,busy=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function iconFor(key,index){
  const map={
    plumbing:['assets/icon-plumbing.png','assets/icon-pipes.png','assets/icon-pipes.png','assets/icon-heating.png','assets/icon-plumbing.png'],
    finishing:['assets/icon-finishing.png','assets/icon-finishing.png','assets/icon-finishing.png','assets/icon-finishing.png','assets/icon-finishing.png','assets/icon-finishing.png'],
    electric:['assets/icon-electric.png','assets/icon-electric.png','assets/icon-electric.png','assets/icon-electric.png','assets/icon-electric.png','assets/icon-electric.png'],
    turnkey:['assets/icon-pipes.png','assets/icon-finishing.png','assets/icon-electric.png','assets/icon-plumbing.png','assets/icon-heating.png','assets/icon-pipes.png']
  };
  return (map[key]||[])[index] || 'assets/icon-finishing.png';
}
function renderServices(d){
  stack.innerHTML=d.items.map((x,i)=>`<article class="service-strip" style="top:${76+i*5}px">
    <div class="service-strip__icon"><img src="${iconFor(currentKey,i)}" alt=""></div>
    <div class="service-strip__main"><div class="service-strip__name">${x[0]}</div><div class="service-strip__num">${String(i+1).padStart(2,'0')} · ${d.title}</div></div>
    <div class="service-strip__right"><div class="service-strip__price">${x[1]}</div><div class="service-strip__unit">${x[2]}</div></div>
    <button class="service-strip__button" data-order="${i}">Заказать</button>
  </article>`).join('');
  stack.querySelectorAll('[data-order]').forEach((b)=>b.onclick=()=>{
    const i=Number(b.dataset.order);const text=encodeURIComponent(`Здравствуйте! Хочу заказать: ${d.title} — ${d.items[i][0]}`);
    window.open(`https://t.me/share/url?url=https://svarog-remont.example&text=${text}`,'_blank')
  });
}

function setHero(k){
 currentKey=k; const d=data[k]; renderServices(d); document.querySelector('#priceKicker').textContent=d.title;
 overlay.innerHTML=['tl','tr','bl','br'].map(pos=>`<div class="split-piece piece--${pos}"><div class="hero-scene" style="background-image:url('${d.image}')"><div class="hero-copy"><span>СВАРОГ · ЧЕСТНЫЙ РЕМОНТ</span><h1>${k==='turnkey'?'Ремонт под ключ':d.title}</h1><p>${d.subtitle}</p></div><button class="scroll-label" tabindex="-1" aria-hidden="true">СКРОЛЛ <i>↓</i></button></div></div>`).join('');
 document.querySelectorAll('nav [data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===k); if(b.dataset.category===k)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function updateSplit(){
 ticking=false;if(category.hidden)return;
 const distance=Math.round(innerHeight*1.15);document.querySelector('#splitRuler').style.height=distance+'px';const p=Math.max(0,Math.min(1,scrollY/distance)),e=p*p*(3-2*p);
 overlay.querySelectorAll('.split-piece').forEach((el,i)=>{el.style.transform=`translate3d(${(i%2?1:-1)*e*(innerWidth/2+48)}px,${(i<2?-1:1)*e*(innerHeight/2+48)}px,0)`});
 hero.style.visibility=p>=1?'hidden':'visible';hero.style.pointerEvents=p>=1?'none':'auto';
 prices.style.position='relative';prices.style.top='';
 prices.style.transform=`translateY(${-Math.max(0,distance-scrollY)}px) scale(${reduced.matches?1:.72+.28*e})`;prices.style.opacity=String(.35+.65*e);
 prices.inert=p<1;
}
async function openCategory(k){
 if(busy)return;busy=true;
 const fromHome=!portal.hidden;let halves=[];
 if(fromHome&&!reduced.matches){
  halves=['left','right'].map(side=>{const mask=document.createElement('div');mask.className='portal-curtain '+side;const copy=portal.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));copy.inert=true;mask.setAttribute('aria-hidden','true');mask.append(copy);document.body.append(mask);return mask});
 }
 setHero(k);portal.hidden=true;category.hidden=false;window.scrollTo(0,0);updateSplit();
 if(halves.length){document.body.style.overflow='hidden';await Promise.all(halves.map((el,i)=>el.animate([{transform:'translateX(0)'},{transform:`translateX(${i?100:-100}%)`}],{duration:1000,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished));halves.forEach(el=>el.remove());document.body.style.overflow=''}
 busy=false;
}
function goHome(){if(busy)return;category.hidden=true;portal.hidden=false;window.scrollTo(0,0);document.querySelectorAll('nav button').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')})}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openCategory(b.dataset.category)));
document.querySelector('#backBtn').onclick=goHome;
hero.addEventListener('click',e=>{if(e.target.closest('.scroll-label'))window.scrollTo({top:innerHeight*1.15,behavior:reduced.matches?'instant':'smooth'})});
function requestUpdate(){if(!ticking){ticking=true;requestAnimationFrame(updateSplit)}}
addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);addEventListener('keydown',e=>{if(e.key==='Escape')goHome()});
