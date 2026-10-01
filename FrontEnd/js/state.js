/* App state and saving/loading expenses (localStorage). Swap save() for API calls when the backend is ready. */
let exps=[],month=today.slice(0,7),filter=null,editId=null,view='home',undo=null,undoTimer,canSave=true;
try{exps=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){exps=[]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(exps))}catch(e){canSave=false}}

$('#cats').innerHTML=Object.entries(CATS).map(([c,[col]],i)=>`<input type="radio" name="cat" id="c${i}" value="${c}" ${i?'':'checked'}><label for="c${i}" style="--c:${col}">${c}</label>`).join('');
