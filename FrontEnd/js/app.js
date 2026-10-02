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
  else if(a==='logout'){Auth.logout();clearTimeout(undoTimer);$('#snack').hidden=true;showAuth();return}
  else if(a==='scope')expScope=v;
  else if(a==='export'){doExport(v);return}
  else if(a==='sample')sample();
  else if(a==='theme'){const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'}
  else if(a==='cancel'){resetForm();view='history'}
  else if(a==='edit'){const e=exps.find(x=>x.id===v);if(!e)return;editId=v;$('#amt').value=e.amount;$('#date').value=e.date;$('#note').value=e.note||'';$('#f').cat.value=e.category;$('#ftitle').textContent=t('t_edit');$('#save').textContent=t('b_edit');$('#cancel').hidden=false;$('#err').textContent='';view='add';render();scrollTo(0,0);$('#amt').focus();return}
  else if(a==='del'){undo=exps.find(x=>x.id===v);exps=exps.filter(x=>x.id!==v);if(editId===v)resetForm();save();$('#snack').hidden=false;clearTimeout(undoTimer);undoTimer=setTimeout(()=>{$('#snack').hidden=true;undo=null},6000)}
  else if(a==='undo'){if(undo){exps.push(undo);undo=null;save()}$('#snack').hidden=true}
  if(a!=='theme')render();
});
document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest&&ev.target.closest('.sl')){ev.preventDefault();ev.target.closest('.sl').dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
$('#lang').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('rozkakhata:lang',lang)}catch(_){}applyStatic();render()});

/* Sign in / register screen */
let mode='login';
function applyAuth(){const r=mode==='register';
  $('#atitle').textContent=t(r?'r_title':'l_title');$('#asub').textContent=t(r?'r_sub':'l_sub');
  $('#aname-w').hidden=!r;$('#apw2-w').hidden=!r;
  $('label[for=aname]').textContent=t('a_name');$('label[for=aemail]').textContent=t('a_email');$('label[for=apw]').textContent=t('a_pw');$('label[for=apw2]').textContent=t('a_pw2');
  $('#asubmit').textContent=t(r?'b_reg':'b_login');$('#aswitch').textContent=t(r?'a_to_login':'a_to_reg');
  $('#apw').autocomplete=r?'new-password':'current-password';$('#logout').textContent=t('b_logout');$('#lang2').value=lang}
function setMode(m){mode=m;$('#af').reset();$('#aerr').textContent='';applyAuth()}
$('#af').addEventListener('submit',async ev=>{ev.preventDefault();
  const r=mode==='register',name=$('#aname').value.trim(),email=$('#aemail').value.trim(),password=$('#apw').value,err=k=>{$('#aerr').textContent=t(k)};
  if(r&&!name)return err('e_name');
  if(!/^\S+@\S+\.\S+$/.test(email))return err('e_email');
  if(r&&password.length<6)return err('e_pwlen');
  if(r&&password!==$('#apw2').value)return err('e_pwmatch');
  if(!password)return err('e_bad');
  try{showApp(await Auth[r?'register':'login']({name,email,password}))}
  catch(e){err(e.code==='exists'?'e_exists':e.code==='bad'?'e_bad':'e_store')}
});
$('#aswitch').addEventListener('click',()=>{setMode(mode==='login'?'register':'login');$('#aemail').focus()});
$('#lang2').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('rozkakhata:lang',lang)}catch(_){}applyStatic()});

function showApp(u){document.body.classList.remove('authing');exps=loadExps();month=today.slice(0,7);filter=null;view='home';$('#uname').textContent=u.name;$('#af').reset();applyStatic();resetForm();render();scrollTo(0,0)}
function showAuth(){exps=[];document.body.classList.add('authing');setMode('login');applyStatic()}
const u0=Auth.current();u0?showApp(u0):showAuth();
