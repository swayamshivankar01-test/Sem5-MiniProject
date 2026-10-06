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
d_h|Find by date|तारीख से खोजें|तारखेनुसार शोधा
d_from|From|से|पासून
d_to|To|तक|पर्यंत
d_today|Today|आज|आज
d_clear|Clear dates|तारीखें हटाएँ|तारखा काढा
d_hint|Pick one date to see that day only, or two dates for a range.|केवल उस दिन का खर्च देखने के लिए एक तारीख चुनें, या अवधि के लिए दो तारीखें।|फक्त त्या दिवसाचा खर्च पाहण्यासाठी एक तारीख निवडा, किंवा कालावधीसाठी दोन तारखा.
d_total|{n} entries · Total {a}|{n} खर्च · कुल {a}|{n} खर्च · एकूण {a}
d_none|No expenses on {r}.|{r} को कोई खर्च नहीं।|{r} रोजी काही खर्च नाही.
nocat_all|No {c} expenses yet.|{c} का कोई खर्च नहीं।|{c} चा खर्च नाही.
x_range|Exporting the dates you selected: {r}|चुनी हुई तारीखें एक्सपोर्ट होंगी: {r}|निवडलेल्या तारखा एक्सपोर्ट होतील: {r}
d_hint_c|Pick dates to see spending by category for that period.|उस अवधि में श्रेणी के अनुसार खर्च देखने के लिए तारीखें चुनें।|त्या कालावधीतील श्रेणीनुसार खर्च पाहण्यासाठी तारखा निवडा.
nodata|Add an expense to see where your money goes.|पैसा कहाँ जाता है यह देखने के लिए खर्च जोड़ें।|पैसे कुठे जातात ते पाहण्यासाठी खर्च जोडा.
deleted|Expense deleted.|खर्च हटाया गया।|खर्च हटवला.
undo|Undo|वापस लें|पूर्ववत करा
th_m|Month|महीना|महिना
th_s|Spent|खर्च|खर्च
th_v|vs previous|पिछले से|मागील तुलनेत
high|Highest spending in this range: {m} ({a}). Select a bar to open that month.|इस अवधि में सबसे ज़्यादा खर्च: {m} ({a})। उस महीने को खोलने के लिए बार चुनें।|या कालावधीत सर्वाधिक खर्च: {m} ({a}). तो महिना उघडण्यासाठी पट्टी निवडा.
pick|Select a bar to open that month.|उस महीने को खोलने के लिए बार चुनें।|तो महिना उघडण्यासाठी पट्टी निवडा.
l_title|Welcome back|वापसी पर स्वागत है|पुन्हा स्वागत आहे
l_sub|Sign in to open your ledger.|अपना खाता खोलने के लिए साइन इन करें।|तुमचे खाते उघडण्यासाठी साइन इन करा.
r_title|Create your ledger|अपना खाता बनाएँ|तुमचे खाते तयार करा
r_sub|One account keeps your expenses private.|एक अकाउंट आपके खर्च निजी रखता है।|एक अकाउंट तुमचे खर्च खाजगी ठेवते.
a_name|Name|नाम|नाव
a_email|Email|ईमेल|ईमेल
a_pw|Password|पासवर्ड|पासवर्ड
a_pw2|Confirm password|पासवर्ड दोबारा लिखें|पासवर्ड पुन्हा लिहा
b_login|Sign in|साइन इन|साइन इन
b_reg|Create account|अकाउंट बनाएँ|अकाउंट तयार करा
b_logout|Sign out|साइन आउट|साइन आउट
a_to_reg|New here? Create an account|नए हैं? अकाउंट बनाएँ|नवीन आहात? अकाउंट तयार करा
a_to_login|Already have an account? Sign in|अकाउंट है? साइन इन करें|अकाउंट आहे? साइन इन करा
e_name|Enter your name.|अपना नाम लिखें।|तुमचे नाव लिहा.
e_email|Enter a valid email address.|सही ईमेल पता लिखें।|योग्य ईमेल पत्ता लिहा.
e_pwlen|Password must be at least 6 characters.|पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।|पासवर्ड किमान 6 अक्षरांचा असावा.
e_pwmatch|The two passwords do not match.|दोनों पासवर्ड मेल नहीं खाते।|दोन्ही पासवर्ड जुळत नाहीत.
e_exists|An account with this email already exists. Sign in instead.|इस ईमेल से अकाउंट पहले से है। साइन इन करें।|या ईमेलचे अकाउंट आधीपासून आहे. साइन इन करा.
e_bad|Email or password is incorrect.|ईमेल या पासवर्ड ग़लत है।|ईमेल किंवा पासवर्ड चुकीचा आहे.
e_store|This browser is blocking saving, so the account could not be created.|यह ब्राउज़र सहेजने से रोक रहा है, इसलिए अकाउंट नहीं बन सका।|हा ब्राउझर साठवणे रोखत आहे, त्यामुळे अकाउंट तयार झाले नाही.
e_net|Cannot reach the server. Check your connection and try again.|सर्वर से संपर्क नहीं हो पा रहा। कनेक्शन जाँचें और फिर कोशिश करें।|सर्व्हरशी संपर्क होत नाही. कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.
e_server|Something went wrong on the server. Please try again.|सर्वर पर कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।|सर्व्हरवर काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.
e_session|Your session has expired. Please sign in again.|आपका सत्र समाप्त हो गया है। कृपया फिर से साइन इन करें।|तुमचे सत्र संपले आहे. कृपया पुन्हा साइन इन करा.
e_load|Unable to load expenses.|खर्च लोड नहीं हो सके।|खर्च लोड करता आले नाहीत.
e_save|Unable to save expense.|खर्च सहेजा नहीं जा सका।|खर्च जतन करता आला नाही.
e_upd|Unable to update expense.|खर्च अपडेट नहीं हो सका।|खर्च अपडेट करता आला नाही.
e_del|Unable to delete expense.|खर्च हटाया नहीं जा सका।|खर्च हटवता आला नाही.
exp_h|Export|निर्यात|निर्यात
exp_p|Download your entries as a file, or print a report.|अपनी प्रविष्टियाँ फ़ाइल में डाउनलोड करें या रिपोर्ट प्रिंट करें।|तुमच्या नोंदी फाइलमध्ये डाउनलोड करा किंवा अहवाल प्रिंट करा.
sc_month|This month|इस महीने|या महिन्याचे
sc_all|All entries|सभी प्रविष्टियाँ|सर्व नोंदी
x_pdfhint|For PDF, choose "Save as PDF" in the print window.|PDF के लिए प्रिंट विंडो में "Save as PDF" चुनें।|PDF साठी प्रिंट विंडोमध्ये "Save as PDF" निवडा.
x_none|There is nothing to export for this period.|इस अवधि के लिए निर्यात करने को कुछ नहीं है।|या कालावधीसाठी निर्यात करण्यासारखे काही नाही.
x_date|Date|तारीख|तारीख
x_cat|Category|श्रेणी|श्रेणी
x_note|Note|टिप्पणी|टीप
x_amt|Amount (₹)|राशि (₹)|रक्कम (₹)
x_total|Total|कुल|एकूण
x_rep|Expense report|खर्च रिपोर्ट|खर्च अहवाल
x_by|By category|श्रेणी के अनुसार|श्रेणीनुसार
x_period|Period|अवधि|कालावधी
x_acct|Account|अकाउंट|अकाउंट
x_gen|Generated on|बनाया गया|तयार केले
pie_aria|Spending by category|श्रेणी के अनुसार खर्च|श्रेणीनुसार खर्च
leg_more|Spent more than the month before|पिछले महीने से ज़्यादा खर्च|मागील महिन्यापेक्षा जास्त खर्च
leg_less|Spent less|कम खर्च|कमी खर्च
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
  $('#note').placeholder=t('ph');$('#ftitle').textContent=t(editId?'t_edit':'t_add');$('#save').textContent=t(editId?'b_edit':'b_add');applyAuth()}
