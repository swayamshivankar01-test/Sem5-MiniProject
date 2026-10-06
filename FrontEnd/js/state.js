/* App state and the expense API (Spring Boot backend). The data lives in PostgreSQL, not in the browser. */
let exps=[],month=today.slice(0,7),filter=null,editId=null,view='home',undo=null,undoTimer,canSave=true,expScope='month',dFrom='',dTo='';

/* Ids: the database uses numbers; the screens treat ids as sortable strings, so we pad them (000000000042).
   rid() turns a screen id back into the real number for URLs. */
const sid=n=>String(n).padStart(12,'0'),rid=id=>String(Number(id));
const norm=e=>({id:sid(e.id),amount:Number(e.amount),date:e.date,category:e.category,note:e.note||''});
const body=x=>JSON.stringify({amount:Math.round(x.amount*100)/100,date:x.date,category:x.category,note:x.note||''});
const apiErr=(code,status)=>{const e=new Error(code);e.code=code;e.status=status;return e};

/* One helper for every protected request: adds "Authorization: Bearer <JWT>", turns failures into
   Error.code = 'net' | 'auth' | 'server'. On HTTP 401 (expired/invalid token) it logs the user out. */
async function api(path,opts={}){
  const tk=Auth.token(),headers={};
  if(opts.body)headers['Content-Type']='application/json';
  if(tk)headers.Authorization='Bearer '+tk;
  let res;
  try{res=await fetch(API_BASE_URL+path,{...opts,headers})}catch(e){throw apiErr('net')}
  if(res.status===401){if(Auth.token()===tk)onUnauthorized();throw apiErr('auth',401)}  /* onUnauthorized() is in app.js */
  if(!res.ok)throw apiErr('server',res.status);
  try{return await res.json()}catch(e){return null}
}

/* GET /api/expenses */
async function loadExps(){const r=await api('/expenses');return(Array.isArray(r)?r:[]).map(norm)}
/* POST /api/expenses */
async function addExp(x){return norm(await api('/expenses',{method:'POST',body:body(x)}))}
/* PUT /api/expenses/{id} */
async function updateExp(id,x){return norm(await api('/expenses/'+rid(id),{method:'PUT',body:body(x)}))}
/* DELETE /api/expenses/{id}  (404 means it is already gone, which is fine) */
async function deleteExp(id){try{await api('/expenses/'+rid(id),{method:'DELETE'})}catch(e){if(e.status!==404)throw e}}

$('#cats').innerHTML=Object.entries(CATS).map(([c,[col]],i)=>`<input type="radio" name="cat" id="c${i}" value="${c}" ${i?'':'checked'}><label for="c${i}" style="--c:${col}">${c}</label>`).join('');
