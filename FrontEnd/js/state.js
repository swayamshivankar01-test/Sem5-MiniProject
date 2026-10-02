/* App state and saving/loading expenses (localStorage). Swap loadExps()/save() for API calls when the backend is ready. */
let exps=[],month=today.slice(0,7),filter=null,editId=null,view='home',undo=null,undoTimer,canSave=true,expScope='month';
/* Each signed-in user has their own list. With the backend, loadExps() becomes GET /api/expenses and save() becomes POST/PUT/DELETE. */
const dataKey=()=>KEY+':'+(Auth.current()?.id||'guest');
function loadExps(){try{return JSON.parse(localStorage.getItem(dataKey())||'[]')}catch(e){return[]}}
function save(){try{localStorage.setItem(dataKey(),JSON.stringify(exps))}catch(e){canSave=false}}

$('#cats').innerHTML=Object.entries(CATS).map(([c,[col]],i)=>`<input type="radio" name="cat" id="c${i}" value="${c}" ${i?'':'checked'}><label for="c${i}" style="--c:${col}">${c}</label>`).join('');
