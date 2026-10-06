/* Auth service: register, login, logout, current user. Talks to the Spring Boot backend.
     register({name,email,password}) -> POST /api/auth/register, then logs in -> user
     login({email,password})         -> POST /api/auth/login   -> stores the JWT -> user
     logout()                        -> clears the stored JWT and user
     current()                       -> user from the stored (non-expired) JWT, or null
   The JWT and the public user info are kept in localStorage. The password is never stored.
   Errors are thrown as Error with .code = 'exists' | 'bad' | 'net' | 'server' | 'store'. */
const Auth=(()=>{
  const TK='rozkakhata:token',UK='rozkakhata:user';
  const fail=code=>{const e=new Error(code);e.code=code;return e};
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const clear=()=>{try{localStorage.removeItem(TK);localStorage.removeItem(UK)}catch(e){}};
  const pub=u=>({id:u.id,name:u.name,email:u.email});
  /* expiry time (ms) read from the JWT payload; 0 if the token cannot be read */
  const expiry=tk=>{try{return JSON.parse(atob(tk.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp*1000||0}catch(e){return 0}};
  /* the old local-only accounts (password hashes) are not used any more, so remove them */
  try{localStorage.removeItem('rozkakhata:users');localStorage.removeItem('rozkakhata:session')}catch(e){}

  async function post(path,body){
    let res;
    try{res=await fetch(`${API_BASE_URL}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
    catch(e){throw fail('net')}
    let data=null;try{data=await res.json()}catch(e){}
    return{res,data};
  }
  return{
    /* the JWT if there is a valid, non-expired one, else null (also clears a dead session) */
    token(){const tk=get(TK);if(!tk)return null;if(expiry(tk)<=Date.now()){clear();return null}return tk},
    current(){
      if(!this.token())return null;
      try{const u=JSON.parse(get(UK)||'null');if(u&&u.name)return pub(u)}catch(e){}
      clear();return null;
    },
    async register({name,email,password}){
      email=email.trim().toLowerCase();
      const{res}=await post('/auth/register',{name:name.trim(),email,password});
      if(res.status===409)throw fail('exists');
      if(!res.ok)throw fail('server');
      return this.login({email,password});   /* register returns no token, so sign in right after */
    },
    async login({email,password}){
      const{res,data}=await post('/auth/login',{email:email.trim().toLowerCase(),password});
      if(res.status===400||res.status===401)throw fail('bad');
      if(!res.ok||!data||!data.token||!data.user)throw fail('server');
      try{localStorage.setItem(TK,data.token);localStorage.setItem(UK,JSON.stringify(pub(data.user)))}catch(e){throw fail('store')}
      return pub(data.user);
    },
    logout(){clear()}
  };
})();
