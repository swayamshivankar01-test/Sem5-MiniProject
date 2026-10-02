/* Auth service: register, login, logout, current user.
   TODAY: a local stand-in (accounts kept in localStorage) so the screens work without a server.
   LATER: replace the four methods with fetch() calls to the Java backend and keep the same inputs/outputs:
     register({name,email,password}) -> POST /api/auth/register   -> user
     login({email,password})         -> POST /api/auth/login      -> user (+ token)
     logout()                        -> clear token
     current()                       -> user from the stored token, or null
   Errors are thrown as Error with .code = 'exists' | 'bad' | 'store'. */
const Auth=(()=>{
  const UK='rozkakhata:users',SK='rozkakhata:session';
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const rnd=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,10);
  const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const pub=u=>({id:u.id,name:u.name,email:u.email});
  const fail=code=>{const e=new Error(code);e.code=code;return e};
  async function hash(pw,salt){
    if(!(window.crypto&&crypto.subtle))return 'x'+btoa(unescape(encodeURIComponent(salt+pw)));
    const enc=new TextEncoder(),k=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);
    return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},k,256));
  }
  return{
    current(){const id=read(SK),u=id&&(read(UK)||[]).find(x=>x.id===id);return u?pub(u):null},
    async register({name,email,password}){
      email=email.trim().toLowerCase();const users=read(UK)||[];
      if(users.some(u=>u.email===email))throw fail('exists');
      const salt=rnd(),u={id:'u'+rnd(),name:name.trim(),email,salt,hash:await hash(password,salt)};
      try{
        /* first account adopts entries saved before accounts existed */
        const old=!users.length&&localStorage.getItem(KEY);
        if(old){localStorage.setItem(KEY+':'+u.id,old);localStorage.removeItem(KEY)}
        users.push(u);write(UK,users);write(SK,u.id);
      }catch(e){throw fail('store')}
      return pub(u);
    },
    async login({email,password}){
      email=email.trim().toLowerCase();
      const u=(read(UK)||[]).find(x=>x.email===email);
      if(!u||await hash(password,u.salt)!==u.hash)throw fail('bad');
      try{write(SK,u.id)}catch(e){throw fail('store')}
      return pub(u);
    },
    logout(){try{localStorage.removeItem(SK)}catch(e){}}
  };
})();
