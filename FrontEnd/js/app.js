/* User actions: add/edit/delete form, sample data, button clicks, language switch and start-up. */
function resetForm(){editId=null;$('#f').reset();$('#date').value=today;$('#ftitle').textContent=t('t_add');$('#save').textContent=t('b_add');$('#cancel').hidden=true;$('#err').textContent=''}
$('#f').addEventListener('submit',ev=>{ev.preventDefault();
  const amount=parseFloat($('#amt').value.replace(/,/g,'')),date=$('#date').value,category=$('#f').cat.value,note=$('#note').value.trim();
  if(!(amount>0)){$('#err').textContent=t('e_amt');$('#amt').focus();return}
  if(!date){$('#err').textContent=t('e_date');return}
  if(editId){exps=exps.map(e=>e.id===editId?{...e,amount,date,category,note}:e)}
  else exps.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),amount,date,category,note});
  save();month=date.slice(0,7);filter=null;resetForm();view='history';render();scrollTo(0,0);
});

function sample(){const S=[['Chai and snacks',80,'Food',0],['Lunch at dhaba',450,'Food',0],['Auto to office',120,'Transport',1],['Electricity bill',2400,'Bills',2],['Phone case',1850,'Shopping',3],['Netflix',599,'Entertainment',4],['Vitamin tablets',350,'Health',5],['DMart groceries',660,'Food',6],['Petrol',200,'Transport',8],['Dinner out',720,'Food',11],['Internet bill',699,'Bills',33],['Shirts',3200,'Shopping',36],['Groceries',1400,'Food',41],['Metro card',300,'Transport',47],['Doctor visit',500,'Health',52],['Movie tickets',520,'Entertainment',60],['Broadband',699,'Bills',64],['Lunch',380,'Food',70]];
  S.forEach(([note,amount,category,ago],i)=>{const d=new Date();d.setDate(d.getDate()-ago);exps.push({id:'s'+i+Date.now().toString(36),amount,category,note,date:iso(d)})});save();}

document.addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,v=b.dataset.v;
  if(a==='prev')month=addM(month,-1);
  else if(a==='next')month=addM(month,1);
  else if(a==='month')month=v;
  else if(a==='filter'){filter=filter===v?null:v;view='history'}
  else if(a==='go'){view=v;scrollTo(0,0)}
  else if(a==='sample')sample();
  else if(a==='theme'){const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'}
  else if(a==='cancel'){resetForm();view='history'}
  else if(a==='edit'){const e=exps.find(x=>x.id===v);if(!e)return;editId=v;$('#amt').value=e.amount;$('#date').value=e.date;$('#note').value=e.note||'';$('#f').cat.value=e.category;$('#ftitle').textContent=t('t_edit');$('#save').textContent=t('b_edit');$('#cancel').hidden=false;$('#err').textContent='';view='add';render();scrollTo(0,0);$('#amt').focus();return}
  else if(a==='del'){undo=exps.find(x=>x.id===v);exps=exps.filter(x=>x.id!==v);if(editId===v)resetForm();save();$('#snack').hidden=false;clearTimeout(undoTimer);undoTimer=setTimeout(()=>{$('#snack').hidden=true;undo=null},6000)}
  else if(a==='undo'){if(undo){exps.push(undo);undo=null;save()}$('#snack').hidden=true}
  if(a!=='theme')render();
});
$('#lang').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('rozkakhata:lang',lang)}catch(_){}applyStatic();render()});
applyStatic();resetForm();render();
