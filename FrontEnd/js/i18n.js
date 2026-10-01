/* Languages: translation table (English, Hindi, Marathi) and applyStatic(). */
const LOC={en:'en-IN',hi:'hi-IN',mr:'mr-IN'},L={en:{},hi:{},mr:{}};
(`home|Home|मुखपृष्ठ|मुख्यपृष्ठ
add|Add|जोड़ें|जोडा
history|History|इतिहास|इतिहास
categories|Categories|श्रेणी|श्रेणी
compare|Compare|तुलना|तुलना
spent|Spent in {m}|{m} का खर्च|{m} चा खर्च
more|{p}% more than {m}|{m} से {p}% ज़्यादा|{m} पेक्षा {p}% जास्त
less|{p}% less than {m}|{m} से {p}% कम|{m} पेक्षा {p}% कमी
extra|extra|ज़्यादा|जास्त
saved|saved|बचत|बचत
same|Same as {m}|{m} के बराबर|{m} इतकाच
nocmp|No entries in {m} to compare|तुलना के लिए {m} में कोई प्रविष्टि नहीं|तुलनेसाठी {m} मध्ये नोंद नाही
today|Today|आज|आज
avg|Daily average|दैनिक औसत|दैनिक सरासरी
entries|Entries|प्रविष्टियाँ|नोंदी
blocked|Saving is blocked in this browser, so entries last only until you close the tab.|इस ब्राउज़र में सहेजना बंद है, इसलिए टैब बंद करने तक ही प्रविष्टियाँ रहेंगी।|या ब्राउझरमध्ये साठवणे बंद आहे, त्यामुळे टॅब बंद करेपर्यंतच नोंदी राहतील.
h_home|Today's page|आज का पन्ना|आजचे पान
p_home|The latest entries in your ledger.|आपके खाते की ताज़ा प्रविष्टियाँ।|तुमच्या खात्यातील ताज्या नोंदी.
recent|Recent expenses|हाल के खर्च|अलीकडील खर्च
seeall|See all|सभी देखें|सर्व पहा
where|Where it went|पैसा कहाँ गया|पैसे कुठे गेले
details|Details|विवरण|तपशील
h_add|Write a new entry|नई प्रविष्टि लिखें|नवीन नोंद लिहा
p_add|Log it as it happens. It takes a few seconds.|जैसे ही खर्च हो, लिख लें। बस कुछ सेकंड लगते हैं।|खर्च होताच नोंदवा. फक्त काही सेकंद लागतात.
h_hist|History|इतिहास|इतिहास
p_hist|Every expense this month, with a total for each day.|इस महीने के सभी खर्च, हर दिन के जोड़ के साथ।|या महिन्यातील सर्व खर्च, प्रत्येक दिवसाच्या बेरजेसह.
h_cat|Categories|श्रेणियाँ|श्रेण्या
p_cat|Select one to see only its expenses.|केवल उसके खर्च देखने के लिए चुनें।|फक्त त्याचे खर्च पाहण्यासाठी निवडा.
h_cmp|Compare months|महीनों की तुलना|महिन्यांची तुलना
p_cmp|Your last six months. Select a bar to open that month.|पिछले छह महीने। उस महीने को खोलने के लिए बार चुनें।|मागील सहा महिने. तो महिना उघडण्यासाठी पट्टी निवडा.
t_add|Add an expense|खर्च जोड़ें|खर्च जोडा
t_edit|Edit expense|खर्च बदलें|खर्च बदला
b_add|Add expense|खर्च जोड़ें|खर्च जोडा
b_edit|Save changes|बदलाव सहेजें|बदल जतन करा
cancel|Cancel|रद्द करें|रद्द करा
amount|Amount|राशि|रक्कम
category|Category|श्रेणी|श्रेणी
date|Date|तारीख|तारीख
note|Note (optional)|टिप्पणी (वैकल्पिक)|टीप (ऐच्छिक)
ph|e.g. Chai at tapri|जैसे टपरी पर चाय|उदा. टपरीवर चहा
e_amt|Enter an amount greater than 0.|0 से अधिक राशि डालें।|० पेक्षा जास्त रक्कम टाका.
e_date|Choose the date of the expense.|खर्च की तारीख चुनें।|खर्चाची तारीख निवडा.
yest|Yesterday|कल|काल
nothing|Nothing logged in {m}.|{m} में कुछ दर्ज नहीं है।|{m} मध्ये काही नोंद नाही.
noexp|No expenses yet. Log your first chai, auto fare or bill.|अभी कोई खर्च नहीं। अपनी पहली चाय, ऑटो किराया या बिल दर्ज करें।|अजून खर्च नाही. तुमचा पहिला चहा, रिक्षा भाडे किंवा बिल नोंदवा.
sample|Fill with sample data|नमूना डेटा भरें|नमुना डेटा भरा
showing|Showing {c} only|केवल {c} दिखा रहे हैं|फक्त {c} दाखवत आहे
clear|Clear filter|फ़िल्टर हटाएँ|फिल्टर काढा
nocat|No {c} expenses in {m}.|{m} में {c} का कोई खर्च नहीं।|{m} मध्ये {c} चा खर्च नाही.
nodata|Add an expense to see where your money goes.|पैसा कहाँ जाता है यह देखने के लिए खर्च जोड़ें।|पैसे कुठे जातात ते पाहण्यासाठी खर्च जोडा.
deleted|Expense deleted.|खर्च हटाया गया।|खर्च हटवला.
undo|Undo|वापस लें|पूर्ववत करा
th_m|Month|महीना|महिना
th_s|Spent|खर्च|खर्च
th_v|vs previous|पिछले से|मागील तुलनेत
high|Highest spending in this range: {m} ({a}). Select a bar to open that month.|इस अवधि में सबसे ज़्यादा खर्च: {m} ({a})। उस महीने को खोलने के लिए बार चुनें।|या कालावधीत सर्वाधिक खर्च: {m} ({a}). तो महिना उघडण्यासाठी पट्टी निवडा.
pick|Select a bar to open that month.|उस महीने को खोलने के लिए बार चुनें।|तो महिना उघडण्यासाठी पट्टी निवडा.
c_Food|Food|खाना|जेवण
c_Transport|Transport|यात्रा|प्रवास
c_Bills|Bills|बिल|बिले
c_Shopping|Shopping|खरीदारी|खरेदी
c_Health|Health|स्वास्थ्य|आरोग्य
c_Entertainment|Entertainment|मनोरंजन|मनोरंजन
c_Other|Other|अन्य|इतर`).split('\n').forEach(r=>{const[k,a,b,c]=r.split('|');L.en[k]=a;L.hi[k]=b;L.mr[k]=c});
let lang='en';try{lang=localStorage.getItem('rozkakhata:lang')||''}catch(e){}if(!L[lang])lang=L[(navigator.language||'').slice(0,2)]?(navigator.language||'').slice(0,2):'en';
const t=k=>L[lang][k]??L.en[k]??k,t2=k=>L[lang==='en'?'hi':'en'][k]??'',tc=c=>t('c_'+c);
function applyStatic(){document.documentElement.lang=lang;$('#lang').value=lang;
  [["#v-home .ph h2", "h_home"], ["#v-home .ph p", "p_home"], ["#v-home section:nth-of-type(1) h2", "recent"], ["#v-home section:nth-of-type(1) button", "seeall"], ["#v-home section:nth-of-type(2) h2", "where"], ["#v-home section:nth-of-type(2) button", "details"], ["#v-add .ph h2", "h_add"], ["#v-add .ph p", "p_add"], ["#v-history .ph h2", "h_hist"], ["#v-history .ph p", "p_hist"], ["#v-categories .ph h2", "h_cat"], ["#v-categories .ph p", "p_cat"], ["#v-compare .ph h2", "h_cmp"], ["#v-compare .ph p", "p_cmp"], ["label[for=amt]", "amount"], ["#f>label:not([for])", "category"], ["label[for=date]", "date"], ["label[for=note]", "note"], ["#cancel", "cancel"], ["#snack span", "deleted"], ["#snack button", "undo"]].forEach(([q,k])=>{const e=document.querySelector(q);if(e)e.textContent=t(k)});
  document.querySelectorAll('.nav button').forEach(b=>b.innerHTML=t(b.dataset.v)+'<small>'+t2(b.dataset.v)+'</small>');
  document.querySelectorAll('#cats label').forEach(l=>l.textContent=tc(l.previousElementSibling.value));
  const fv=$('#f').cat?$('#f').cat.value:'Food';
  $('#f').cat.value=fv;
  $('#note').placeholder=t('ph');$('#ftitle').textContent=t(editId?'t_edit':'t_add');$('#save').textContent=t(editId?'b_edit':'b_add')}
