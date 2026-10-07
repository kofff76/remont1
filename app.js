const portal=document.querySelector('#portal'),category=document.querySelector('#category'),overlay=document.querySelector('#splitOverlay'),stack=document.querySelector('#serviceStack'),prices=document.querySelector('#priceSection'),hero=document.querySelector('#heroFixed');
let currentKey='plumbing',ticking=false,busy=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const dialog=document.querySelector('#serviceDialog');
const rub=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
function renderServices(d){
 stack.innerHTML=d.items.map((x,i)=>`<button class="vip-card" data-service="${i}" aria-haspopup="dialog"><span class="vip-card__number">${String(i+1).padStart(2,'0')}</span><img src="${x.icon}" alt=""><h3>${x.name}</h3><strong>от ${rub(x.price)}</strong><span class="vip-card__more">Состав проекта ↗</span></button>`).join('');
 stack.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>openService(d.items[Number(b.dataset.service)]));
}
function openService(item){
 document.querySelector('#detailTitle').textContent=item.name;
 document.querySelector('#detailPrice').textContent='от '+rub(item.price);
 document.querySelector('#detailList').innerHTML=item.includes.map(t=>`<li>${t}</li>`).join('');
 const regional=/комплектация/.test(item.name);
 document.querySelector('#detailVariant').hidden=!regional;
 document.querySelector('#requestText').value=`Здравствуйте! Интересует проект «${item.name}». Ориентир стоимости работ — от ${rub(item.price)}. Объект: ____. Площадь / количество точек: ____. Нужен расчёт состава работ и оборудования.`;
 document.querySelector('#copyRequest').textContent='Скопировать запрос';
 dialog.showModal();document.body.style.overflow='hidden';
}
function closeDetails(){dialog.close()}
document.querySelector('#closeDetail').onclick=closeDetails;
dialog.addEventListener('close',()=>{document.body.style.overflow=''});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetails()}});
document.querySelector('#copyRequest').onclick=async()=>{const field=document.querySelector('#requestText');try{await navigator.clipboard.writeText(field.value);document.querySelector('#copyRequest').textContent='Запрос скопирован'}catch{field.focus();field.select();document.querySelector('#copyRequest').textContent='Выделено — скопируйте текст'}};

function setHero(k){
 currentKey=k; const d=data[k]; renderServices(d); document.querySelector('#priceKicker').textContent=d.title;
 overlay.innerHTML=['tl','tr','bl','br'].map(pos=>`<div class="split-piece piece--${pos}"><div class="hero-scene" style="background-image:url('${d.image}')"><div class="hero-copy"><span>СВАРОГ · PRIVATE INTERIORS</span><h1>${k==='turnkey'?'Ремонт под ключ':d.title}</h1><p>${d.subtitle}</p></div><button class="scroll-label" tabindex="-1" aria-hidden="true">СКРОЛЛ <i>↓</i></button></div></div>`).join('');
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
 setHero(k);portal.hidden=true;category.hidden=false;document.querySelector('.topbar').hidden=false;window.scrollTo(0,0);updateSplit();
 if(halves.length){document.body.style.overflow='hidden';await Promise.all(halves.map((el,i)=>el.animate([{transform:'translateX(0)'},{transform:`translateX(${i?100:-100}%)`}],{duration:1000,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished));halves.forEach(el=>el.remove());document.body.style.overflow=''}
 busy=false;
}
function goHome(){if(busy)return;category.hidden=true;portal.hidden=false;document.querySelector('.topbar').hidden=true;window.scrollTo(0,0);document.querySelectorAll('nav button').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')})}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openCategory(b.dataset.category)));
document.querySelector('#backBtn').onclick=goHome;
hero.addEventListener('click',e=>{if(e.target.closest('.scroll-label'))window.scrollTo({top:innerHeight*1.15,behavior:reduced.matches?'instant':'smooth'})});
function requestUpdate(){if(!ticking){ticking=true;requestAnimationFrame(updateSplit)}}
addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open&&!e.defaultPrevented)goHome()});
