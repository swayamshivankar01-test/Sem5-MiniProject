/* Categories, constants and small helpers (money format, dates, escaping). */
const CATS={Food:['#F97316','🍽️'],Transport:['#2563EB','🚌'],Bills:['#7C3AED','💡'],Shopping:['#EC4899','🛍️'],Health:['#EF4444','💊'],Entertainment:['#F59E0B','🎬'],Other:['#64748B','📦']};
const KEY='rozkakhata:v1',$=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=iso(new Date()),fmt=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const sum=a=>a.reduce((s,e)=>s+e.amount,0);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const addM=(k,n)=>{const[y,m]=k.split('-').map(Number);return iso(new Date(y,m-1+n,1)).slice(0,7)};
const mDate=k=>new Date(+k.slice(0,4),+k.slice(5,7)-1,1);
const long=k=>mDate(k).toLocaleDateString(LOC[lang],{month:'long',year:'numeric'}),short=k=>mDate(k).toLocaleDateString(LOC[lang],{month:'short'});
const dayLabel=d=>{if(d===today)return t('today');const y=new Date();y.setDate(y.getDate()-1);if(d===iso(y))return t('yest');return new Date(d+'T00:00').toLocaleDateString(LOC[lang],{weekday:'short',day:'numeric',month:'short'})};
