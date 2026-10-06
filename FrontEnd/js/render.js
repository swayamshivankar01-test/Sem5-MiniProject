/* Drawing the screens: totals, charts, category bars, month comparison and the expense list. */
let shown=0;function tick(el,to){const from=shown,t0=performance.now();shown=to;if(from===to||matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=fmt(to);return}(function f(n){const k=Math.min(1,(n-t0)/420);el.textContent=fmt(from+(to-from)*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)}
/* Donut (pie) chart: each slice is clickable and filters History by that category. */
function arc(r0,r1,a0,a1){const p=(r,a)=>[(100+r*Math.sin(a)).toFixed(2),(100-r*Math.cos(a)).toFixed(2)],l=a1-a0>Math.PI?1:0,[x0,y0]=p(r1,a0),[x1,y1]=p(r1,a1),[x2,y2]=p(r0,a1),[x3,y3]=p(r0,a0);return`M${x0} ${y0}A${r1} ${r1} 0 ${l} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${l} 0 ${x3} ${y3}Z`}
function donut(by,total){let a=0;const tf=fmt(total),fs=tf.length>8?15:tf.length>6?18:21;
  const sl=by.map(([c,v])=>{const span=v/total*2*Math.PI,a0=a,a1=a+Math.min(span,6.28),mid=(a0+a1)/2,pc=Math.round(v/total*100);a+=span;
    return`<g class="sl${filter&&filter!==c?' dim':''}" data-act="filter" data-v="${c}" role="button" tabindex="0" aria-label="${tc(c)}: ${fmt(v)}, ${pc}%"><path d="${arc(52,92,a0,a1)}" fill="${CATS[c][0]}"/><title>${tc(c)}: ${fmt(v)} (${pc}%)</title>${pc>=7?`<text class="pl" x="${(100+72*Math.sin(mid)).toFixed(1)}" y="${(104-72*Math.cos(mid)).toFixed(1)}" text-anchor="middle">${pc}%</text>`:''}</g>`}).join('');
  return`<svg class="donut" viewBox="0 0 200 200" role="group" aria-label="${t('pie_aria')}">${sl}<text class="dc" x="100" y="102" text-anchor="middle" style="font-size:${fs}px">${tf}</text><text class="dl" x="100" y="120" text-anchor="middle">${t('x_total')}</text></svg>`}
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

  /* Custom dates (shared by History and Categories): one date = that day, two dates = a range */
  const ranged=!!(dFrom||dTo);let lo=dFrom||dTo,hi=dTo||dFrom;if(lo>hi)[lo,hi]=[hi,lo];
  const fd=d=>new Date(d+'T00:00').toLocaleDateString(LOC[lang],{day:'numeric',month:'short',year:'numeric'}),rlabel=ranged?(lo===hi?fd(lo):fd(lo)+' – '+fd(hi)):'';
  const cIn=ranged?exps.filter(e=>e.date>=lo&&e.date<=hi):inM,cTot=sum(cIn),cBy=Object.keys(CATS).map(c=>[c,sum(cIn.filter(e=>e.category===c))]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  const by=Object.keys(CATS).map(c=>[c,sum(inM.filter(e=>e.category===c))]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  const bar=([c,v])=>`<button class="cat ${filter===c?'on':''}" data-act="filter" data-v="${c}" aria-pressed="${filter===c}"><i class="dot" style="background:${CATS[c][0]};width:14px;height:14px"></i><span>${tc(c)}</span><em>${fmt(v)}</em><small>${Math.round(v/cTot*100)}%</small></button>`;
  const none='<p class="mut">'+t('nodata')+'</p>';
  $('#bycat').innerHTML=cBy.length?`<div class="split">${donut(cBy,cTot)}<div>${cBy.map(bar).join('')}</div></div>`:ranged?`<p class="mut">${t('d_none').replace('{r}',rlabel)}</p>`:none;
  /* Categories: date picker + summary (same dates as History) */
  $('#cd_h').textContent=t('d_h');$('#cd_from').textContent=t('d_from');$('#cd_to').textContent=t('d_to');$('#cd_today').textContent=t('d_today');$('#cd_hint').textContent=t('d_hint_c');$('#cdclear').textContent=t('d_clear');
  $('#cdfrom').value=dFrom;$('#cdto').value=dTo;$('#cdclear').hidden=!ranged;
  const cs=$('#cdsum');cs.hidden=!ranged;if(ranged)cs.innerHTML=`<span>${rlabel}</span><span>${t('d_total').replace('{n}',cIn.length).replace('{a}',fmt(cTot))}</span>`;
  $('#top').innerHTML=by.length?`<div class="split sm">${donut(by,total)}<div>${by.slice(0,4).map(([c,v])=>`<div class="lgi"><i class="dot" style="background:${CATS[c][0]}"></i><span>${tc(c)}</span><b>${fmt(v)}</b></div>`).join('')}</div></div>`:none;

  const ks=[-5,-4,-3,-2,-1,0].map(n=>addM(month,n)),tt=ks.map(k=>sum(exps.filter(e=>e.date.startsWith(k)))),mx=Math.max(...tt,1);
  $('#months').innerHTML=ks.map((k,i)=>{const pv=i?tt[i-1]:sum(exps.filter(e=>e.date.startsWith(addM(k,-1)))),cl=tt[i]&&pv?(tt[i]>pv?'mu':'md'):'';return`<button class="mb ${cl} ${k===month?'on':''}" data-act="month" data-v="${k}" aria-label="${long(k)}: ${fmt(tt[i])}"><span>${tt[i]?fmt(tt[i]):''}</span><i style="height:${tt[i]/mx*120}px"></i>${short(k)}</button>`}).join('');
  $('#cleg').innerHTML=`<i class="sw" style="background:var(--margin)"></i>${t('leg_more')}<i class="sw" style="background:var(--ok)"></i>${t('leg_less')}`;
  const best=tt.filter(x=>x).length>1?ks[tt.indexOf(Math.max(...tt))]:null;
  $('#cmp').textContent=best?t('high').replace('{m}',long(best)).replace('{a}',fmt(Math.max(...tt))):t('pick');

  $('#mtable').innerHTML='<tr><th>'+t('th_m')+'</th><th>'+t('th_s')+'</th><th>'+t('entries')+'</th><th>'+t('th_v')+'</th></tr>'+ks.map((k,i)=>{const p=i?tt[i-1]:sum(exps.filter(e=>e.date.startsWith(addM(k,-1))));return`<tr><td>${long(k)}</td><td>${fmt(tt[i])}</td><td>${exps.filter(e=>e.date.startsWith(k)).length}</td><td class="${tt[i]>p?'up':'down'}">${p&&tt[i]?(tt[i]>p?'▲ ':'▼ ')+Math.round(Math.abs(tt[i]-p)/p*100)+'%':'–'}</td></tr>`}).reverse().join('');
  const all=inM.slice().sort((x,y)=>y.date.localeCompare(x.date)||y.id.localeCompare(x.id));
  const group=rs=>{let d='',h='';rs.forEach(e=>{if(e.date!==d){d=e.date;h+=`<div class="day"><span>${dayLabel(d)}</span><span>${fmt(sum(exps.filter(r=>r.date===d)))}</span></div>`}
    const[c,ic]=CATS[e.category];h+=`<div class="ex"><i class="dot" style="background:${c}"></i><div class="inf"><b>${esc(e.note||e.category)}</b><span class="mut">${tc(e.category)}</span></div><strong>−${fmt(e.amount)}</strong><button class="ib" data-act="edit" data-v="${e.id}" aria-label="Edit ${esc(e.note||e.category)}">✎</button><button class="ib" data-act="del" data-v="${e.id}" aria-label="Delete ${esc(e.note||e.category)}">🗑</button></div>`});return h};
  const empty=exps.length?`<div class="empty mut">${t('nothing').replace('{m}',long(month))}</div>`:`<div class="empty"><p class="mut">${t('noexp')}</p><button class="btn" data-act="sample">${t('sample')}</button></div>`;
  /* Custom date filter: one date = that day, two dates = range (works across months, ignores the month picker) */
  const byNew=(x,y)=>y.date.localeCompare(x.date)||y.id.localeCompare(x.id),everything=expScope==='all'&&!ranged;
  const inR=ranged?exps.filter(e=>e.date>=lo&&e.date<=hi).sort(byNew):everything?exps.slice().sort(byNew):all;
  const rows=inR.filter(e=>!filter||e.category===filter);
  $('#d_h').textContent=t('d_h');$('#d_from').textContent=t('d_from');$('#d_to').textContent=t('d_to');$('#d_today').textContent=t('d_today');$('#d_hint').textContent=t('d_hint');$('#dclear').textContent=t('d_clear');
  $('#dfrom').value=dFrom;$('#dto').value=dTo;$('#dclear').hidden=!ranged;
  const ds=$('#dsum');ds.hidden=!(ranged||everything);if(ranged||everything)ds.innerHTML=`<span>${ranged?rlabel:t('sc_all')}</span><span>${t('d_total').replace('{n}',rows.length).replace('{a}',fmt(sum(rows)))}</span>`;
  $('#recent').innerHTML=all.length?group(all.slice(0,5)):empty;
  $('#list').innerHTML=(filter?`<div class="filt"><span class="mut">${t('showing').replace('{c}',tc(filter))}</span><button data-act="filter" data-v="${filter}">${t('clear')}</button></div>`:'')+(rows.length?group(rows):ranged?`<div class="empty mut">${t('d_none').replace('{r}',rlabel)}</div>`:filter?`<div class="empty mut">${(everything?t('nocat_all').replace('{c}',tc(filter)):t('nocat').replace('{c}',tc(filter)).replace('{m}',long(month)))}</div>`:empty);
  $('#exp').innerHTML=`<h2>${t('exp_h')}</h2><p class="mut" style="margin:6px 0 0">${t('exp_p')}</p>
  <div class="xrow"><div class="seg" role="group">${['month','all'].map(k=>`<button class="${expScope===k&&!ranged?'on':''}" data-act="scope" data-v="${k}" aria-pressed="${expScope===k&&!ranged}">${t('sc_'+k)}</button>`).join('')}</div>
  <button class="btn sm" data-act="export" data-v="csv">CSV</button><button class="btn sm" data-act="export" data-v="xlsx">Excel</button><button class="btn sm" data-act="export" data-v="pdf">PDF</button></div>
  ${ranged?`<p style="margin:8px 0 0;font-weight:700">${t('x_range').replace('{r}',rlabel)}</p>`:''}<p class="mut" style="margin:8px 0 0;font-size:13px">${t('x_pdfhint')}</p><div class="err" id="xerr" role="alert"></div>`;
}
