/* User actions: add/edit/delete form, sample data, button clicks, language switch and start-up.
   Every expense action now waits for the backend (async) and only then updates the screen. */
let busy=false,snackKey='deleted';                       /* busy: one backend action at a time */
const live=()=>!document.body.classList.contains('authing');   /* false once the user is signed out */
/* Bottom message bar (the same bar as "Expense deleted"). undoable=true shows the Undo button. */
function flash(key,undoable){const s=$('#snack');snackKey=key;s.querySelector('span').textContent=t(key);s.querySelector('button').hidden=!undoable;s.hidden=false;clearTimeout(undoTimer);undoTimer=setTimeout(()=>{s.hidden=true;undo=null},undoable?6000:5000)}
const fail=(err,key)=>{if(!err||err.code!=='auth')flash(key,false)};   /* 'auth' = already signed out and shown the login screen */
/* Called from state.js when the backend answers 401 (token expired or invalid) */
function onUnauthorized(){Auth.logout();clearTimeout(undoTimer);undo=null;$('#snack').hidden=true;showAuth();$('#aerr').textContent=t('e_session')}
function resetForm(){editId=null;$('#f').reset();$('#date').value=today;$('#ftitle').textContent=t('t_add');$('#save').textContent=t('b_add');$('#cancel').hidden=true;$('#err').textContent=''}
$('#f').addEventListener('submit',async ev=>{ev.preventDefault();
  const amount=parseFloat($('#amt').value.replace(/,/g,'')),date=$('#date').value,category=$('#f').cat.value,note=$('#note').value.trim();
  if(!(amount>0)){$('#err').textContent=t('e_amt');$('#amt').focus();return}
  if(!date){$('#err').textContent=t('e_date');return}
  if(busy)return;busy=true;$('#save').disabled=true;$('#err').textContent='';
  const wasEdit=editId;
  try{
    if(wasEdit){const u=await updateExp(wasEdit,{amount,date,category,note});if(live())exps=exps.map(e=>e.id===wasEdit?u:e)}
    else{const n=await addExp({amount,date,category,note});if(live())exps.push(n)}
  }catch(err){busy=false;$('#save').disabled=false;if(err.code!=='auth')$('#err').textContent=t(wasEdit?'e_upd':'e_save');return}
  busy=false;$('#save').disabled=false;
  if(!live())return;
  month=date.slice(0,7);filter=null;resetForm();view='history';render();scrollTo(0,0);
});

async function sample(){const S=[['Chai and snacks',80,'Food',0],['Lunch at dhaba',450,'Food',0],['Auto to office',120,'Transport',1],['Electricity bill',2400,'Bills',2],['Phone case',1850,'Shopping',3],['Netflix',599,'Entertainment',4],['Vitamin tablets',350,'Health',5],['DMart groceries',660,'Food',6],['Petrol',200,'Transport',8],['Dinner out',720,'Food',11],['Internet bill',699,'Bills',33],['Shirts',3200,'Shopping',36],['Groceries',1400,'Food',41],['Metro card',300,'Transport',47],['Doctor visit',500,'Health',52],['Movie tickets',520,'Entertainment',60],['Broadband',699,'Bills',64],['Lunch',380,'Food',70]];
  /* each sample entry is saved through the API, so it belongs to the signed-in user */
  const rows=S.map(([note,amount,category,ago])=>{const d=new Date();d.setDate(d.getDate()-ago);return{note,amount,category,date:iso(d)}});
  const res=await Promise.allSettled(rows.map(addExp));
  if(live())res.forEach(r=>{if(r.status==='fulfilled')exps.push(r.value)});
  const bad=res.find(r=>r.status==='rejected');if(bad)throw bad.reason;
}

document.addEventListener('click',async ev=>{const b=ev.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,v=b.dataset.v;
  if(a==='prev')month=addM(month,-1);
  else if(a==='next')month=addM(month,1);
  else if(a==='month')month=v;
  else if(a==='filter'){filter=filter===v?null:v;view='history'}
  else if(a==='go'){view=v;scrollTo(0,0)}
  else if(a==='logout'){Auth.logout();clearTimeout(undoTimer);undo=null;$('#snack').hidden=true;showAuth();return}
  else if(a==='scope')expScope=v;
  else if(a==='dclear'){dFrom=dTo=''}
  else if(a==='dtoday'){dFrom=dTo=today}
  else if(a==='export'){doExport(v);return}
  else if(a==='sample'){if(busy)return;busy=true;try{await sample()}catch(err){fail(err,'e_save')}busy=false}
  else if(a==='theme'){const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'}
  else if(a==='cancel'){resetForm();view='history'}
  else if(a==='edit'){const e=exps.find(x=>x.id===v);if(!e)return;editId=v;$('#amt').value=e.amount;$('#date').value=e.date;$('#note').value=e.note||'';$('#f').cat.value=e.category;$('#ftitle').textContent=t('t_edit');$('#save').textContent=t('b_edit');$('#cancel').hidden=false;$('#err').textContent='';view='add';render();scrollTo(0,0);$('#amt').focus();return}
  else if(a==='del'){
    const x=exps.find(e=>e.id===v);if(!x||busy)return;busy=true;
    try{await deleteExp(v)}catch(err){busy=false;fail(err,'e_del');return}
    busy=false;if(!live())return;
    undo=x;exps=exps.filter(e=>e.id!==v);if(editId===v)resetForm();flash('deleted',true)}
  else if(a==='undo'){
    if(busy)return;
    if(undo){const x=undo;undo=null;busy=true;
      /* undo = create the same expense again through the API (it gets a new id) */
      try{const n=await addExp(x);if(live())exps.push(n)}catch(err){busy=false;fail(err,'e_save');return}
      busy=false}
    $('#snack').hidden=true}
  if(a!=='theme')render();
});
['#dfrom','#dto'].forEach(q=>$(q).addEventListener('change',e=>{if(q==='#dfrom')dFrom=e.target.value;else dTo=e.target.value;view='history';render()}));
['#cdfrom','#cdto'].forEach(q=>$(q).addEventListener('change',e=>{if(q==='#cdfrom')dFrom=e.target.value;else dTo=e.target.value;render()}));   /* Categories: stay on this screen */
document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest&&ev.target.closest('.sl')){ev.preventDefault();ev.target.closest('.sl').dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
$('#lang').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('rozkakhata:lang',lang)}catch(_){}applyStatic();if(!$('#snack').hidden)$('#snack span').textContent=t(snackKey);render()});

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
  $('#asubmit').disabled=true;$('#aerr').textContent='';
  let u;
  try{u=await Auth[r?'register':'login']({name,email,password})}
  catch(e){$('#asubmit').disabled=false;return err(e.code==='exists'?'e_exists':e.code==='bad'?'e_bad':e.code==='net'?'e_net':e.code==='store'?'e_store':'e_server')}
  await showApp(u);$('#asubmit').disabled=false;
});
$('#aswitch').addEventListener('click',()=>{setMode(mode==='login'?'register':'login');$('#aemail').focus()});
$('#lang2').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('rozkakhata:lang',lang)}catch(_){}applyStatic()});

/* Opens the app AFTER the expenses have been loaded from the backend (so render() never runs on missing data). */
async function showApp(u){
  const tk=Auth.token();let list=[],failed=false;
  try{list=await loadExps()}catch(e){if(e.code==='auth')return;failed=true}   /* 'auth': already back on the login screen */
  if(Auth.token()!==tk)return;                                              /* signed out while loading */
  exps=list;document.body.classList.remove('authing');$('#auth').style.visibility='';
  month=today.slice(0,7);filter=null;dFrom=dTo='';view='home';$('#uname').textContent=u.name;$('#af').reset();applyStatic();resetForm();render();scrollTo(0,0);
  if(failed)flash('e_load',false);
}
function showAuth(){exps=[];dFrom=dTo='';busy=false;$('#save').disabled=false;$('#auth').style.visibility='';document.body.classList.add('authing');setMode('login');applyStatic()}
/* Page refresh: if a valid JWT is still stored, go straight to the app (keep the login form hidden while loading) */
const u0=Auth.current();if(u0){$('#auth').style.visibility='hidden';showApp(u0)}else showAuth();
