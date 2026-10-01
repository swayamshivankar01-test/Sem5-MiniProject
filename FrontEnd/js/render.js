/* Drawing the screens: totals, charts, category bars, month comparison and the expense list. */
let shown=0;function tick(el,to){const from=shown,t0=performance.now();shown=to;if(from===to||matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=fmt(to);return}(function f(n){const k=Math.min(1,(n-t0)/420);el.textContent=fmt(from+(to-from)*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)}
function render(){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+view));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));
  const inM=exps.filter(e=>e.date.startsWith(month)),total=sum(inM),pk=addM(month,-1),prev=sum(exps.filter(e=>e.date.startsWith(pk)));
  const isNow=month===today.slice(0,7),days=isNow?+today.slice(8):new Date(+month.slice(0,4),+month.slice(5,7),0).getDate();
  $('#mlabel').textContent=long(month);
  $('#summary').innerHTML=`<div class="lbl">${t('spent').replace('{m}',short(month))}</div><div class="big"><span>${fmt(total)}</span></div>
  ${prev&&total!==prev?`<div class="stamp ${total>prev?'more':'less'}">${total>prev?'▲':'▼'} ${t(total>prev?'more':'less').replace('{p}',Math.round(Math.abs(total-prev)/prev*100)).replace('{m}',short(pk))}<small>${fmt(Math.abs(total-prev))} ${t(total>prev?'extra':'saved')}</small></div>`:`<p class="mut" style="margin:6px 0 0">${t(prev?'same':'nocmp').replace('{m}',short(pk))}</p>`}
  <div class="stats"><div><span>${t('today')}<small>${t2('today')}</small></span><b>${fmt(sum(exps.filter(e=>e.date===today)))}</b></div><div><span>${t('avg')}<small>${t2('avg')}</small></span><b>${fmt(total/days)}</b></div><div><span>${t('entries')}<small>${t2('entries')}</small></span><b>${inM.length}</b></div></div>
  ${canSave?'':'<p class="mut" style="margin:12px 0 0">'+t('blocked')+'</p>'}`;
  tick($('#summary .big span'),total);

  const by=Object.keys(CATS).map(c=>[c,sum(inM.filter(e=>e.category===c))]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  const strip=by.length?`<div class="strip" role="img" aria-label="Category split">${by.map(([c,v])=>`<i style="flex:${v};background:${CATS[c][0]}" title="${tc(c)}"></i>`).join('')}</div>`:'';
  const bar=([c,v])=>`<button class="cat ${filter===c?'on':''}" data-act="filter" data-v="${c}" aria-pressed="${filter===c}"><i class="dot" style="background:${CATS[c][0]};width:14px;height:14px"></i><span>${tc(c)}</span><em>${fmt(v)}</em><small>${Math.round(v/total*100)}%</small></button>`;
  const none='<p class="mut">'+t('nodata')+'</p>';
  $('#bycat').innerHTML=by.length?strip+by.map(bar).join(''):none;
  $('#top').innerHTML=by.length?strip+`<p style="margin:0">${by.slice(0,3).map(([c,v])=>`<b>${tc(c)}</b> ${fmt(v)}`).join(', ')}</p>`:none;

  const ks=[-5,-4,-3,-2,-1,0].map(n=>addM(month,n)),tt=ks.map(k=>sum(exps.filter(e=>e.date.startsWith(k)))),mx=Math.max(...tt,1);
  $('#months').innerHTML=ks.map((k,i)=>`<button class="mb ${k===month?'on':''}" data-act="month" data-v="${k}" aria-label="${long(k)}: ${fmt(tt[i])}"><span>${tt[i]?fmt(tt[i]):''}</span><i style="height:${tt[i]/mx*120}px"></i>${short(k)}</button>`).join('');
  const best=tt.filter(x=>x).length>1?ks[tt.indexOf(Math.max(...tt))]:null;
  $('#cmp').textContent=best?t('high').replace('{m}',long(best)).replace('{a}',fmt(Math.max(...tt))):t('pick');

  $('#mtable').innerHTML='<tr><th>'+t('th_m')+'</th><th>'+t('th_s')+'</th><th>'+t('entries')+'</th><th>'+t('th_v')+'</th></tr>'+ks.map((k,i)=>{const p=i?tt[i-1]:sum(exps.filter(e=>e.date.startsWith(addM(k,-1))));return`<tr><td>${long(k)}</td><td>${fmt(tt[i])}</td><td>${exps.filter(e=>e.date.startsWith(k)).length}</td><td class="${tt[i]>p?'up':'down'}">${p&&tt[i]?(tt[i]>p?'▲ ':'▼ ')+Math.round(Math.abs(tt[i]-p)/p*100)+'%':'–'}</td></tr>`}).reverse().join('');
  const all=inM.slice().sort((x,y)=>y.date.localeCompare(x.date)||y.id.localeCompare(x.id));
  const group=rs=>{let d='',h='';rs.forEach(e=>{if(e.date!==d){d=e.date;h+=`<div class="day"><span>${dayLabel(d)}</span><span>${fmt(sum(exps.filter(r=>r.date===d)))}</span></div>`}
    const[c,ic]=CATS[e.category];h+=`<div class="ex"><i class="dot" style="background:${c}"></i><div class="inf"><b>${esc(e.note||e.category)}</b><span class="mut">${tc(e.category)}</span></div><strong>−${fmt(e.amount)}</strong><button class="ib" data-act="edit" data-v="${e.id}" aria-label="Edit ${esc(e.note||e.category)}">✎</button><button class="ib" data-act="del" data-v="${e.id}" aria-label="Delete ${esc(e.note||e.category)}">🗑</button></div>`});return h};
  const empty=exps.length?`<div class="empty mut">${t('nothing').replace('{m}',long(month))}</div>`:`<div class="empty"><p class="mut">${t('noexp')}</p><button class="btn" data-act="sample">${t('sample')}</button></div>`;
  const rows=all.filter(e=>!filter||e.category===filter);
  $('#recent').innerHTML=all.length?group(all.slice(0,5)):empty;
  $('#list').innerHTML=(filter?`<div class="filt"><span class="mut">${t('showing').replace('{c}',tc(filter))}</span><button data-act="filter" data-v="${filter}">${t('clear')}</button></div>`:'')+(rows.length?group(rows):filter?`<div class="empty mut">${t('nocat').replace('{c}',tc(filter)).replace('{m}',long(month))}</div>`:empty);
}
