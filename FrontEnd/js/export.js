/* Export: CSV, Excel (.xlsx, built in the browser, no library) and PDF (print report -> "Save as PDF"). */
const fmt2=n=>'₹'+n.toLocaleString('en-IN',{maximumFractionDigits:2});
/* Custom dates from the History screen (dFrom / dTo): one date = that day, two = a range. They win over This month / All entries. */
function dateRange(){if(!(dFrom||dTo))return null;let lo=dFrom||dTo,hi=dTo||dFrom;if(lo>hi)[lo,hi]=[hi,lo];return[lo,hi]}
function exportRows(){const r=dateRange(),src=r?exps.filter(e=>e.date>=r[0]&&e.date<=r[1]):expScope==='all'?exps:exps.filter(e=>e.date.startsWith(month));return src.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id))}
const fdate=d=>new Date(d+'T00:00').toLocaleDateString(LOC[lang],{day:'numeric',month:'short',year:'numeric'});
const periodLabel=()=>{const r=dateRange();return r?(r[0]===r[1]?fdate(r[0]):fdate(r[0])+' – '+fdate(r[1])):expScope==='all'?t('sc_all'):long(month)};
const fileBase=()=>{const r=dateRange();return'roz-ka-khata-'+(r?(r[0]===r[1]?r[0]:r[0]+'_to_'+r[1]):expScope==='all'?'all':month)};
const clean=s=>String(s||'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
const heads=()=>[t('x_date'),t('x_cat'),t('x_note'),t('x_amt')];

/* CSV (UTF-8 with BOM so Excel shows Hindi/Marathi correctly; leading = + - @ are neutralised) */
function toCSV(rows){
  const q=v=>{v=clean(v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return/[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const lines=[heads(),...rows.map(e=>[e.date,tc(e.category),e.note||'',e.amount]),['','',t('x_total'),sum(rows)]];
  download(fileBase()+'.csv',new Blob(['\uFEFF'+lines.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
}

/* Excel: a minimal .xlsx = a zip (stored, no compression) of a few XML files */
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=-1;for(let i=0;i<u.length;i++)c=crcT[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0};
function zip(files){
  const enc=new TextEncoder(),parts=[],cen=[];let off=0;
  for(const[name,text]of files){
    const nb=enc.encode(name),d=enc.encode(text),c=crc32(d);
    const h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);
    h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nb.length,true);
    const g=new DataView(new ArrayBuffer(46));
    g.setUint32(0,0x02014b50,true);g.setUint16(4,20,true);g.setUint16(6,20,true);g.setUint16(8,0x0800,true);g.setUint16(14,0x21,true);
    g.setUint32(16,c,true);g.setUint32(20,d.length,true);g.setUint32(24,d.length,true);g.setUint16(28,nb.length,true);g.setUint32(42,off,true);
    parts.push(new Uint8Array(h.buffer),nb,d);cen.push(new Uint8Array(g.buffer),nb);off+=30+nb.length+d.length;
  }
  const cs=cen.reduce((s,a)=>s+a.length,0),e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function toXLSX(rows){
  const X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',col='ABCD';
  const s=(r,v,st)=>`<c r="${r}" t="inlineStr" s="${st||0}"><is><t xml:space="preserve">${esc(clean(v))}</t></is></c>`,n=(r,v,st)=>`<c r="${r}" s="${st}"><v>${v}</v></c>`;
  const last=rows.length+1,tr=last+1,total=sum(rows);
  const body=[`<row r="1">${heads().map((h,i)=>s(col[i]+1,h,1)).join('')}</row>`,
    ...rows.map((e,i)=>{const r=i+2;return`<row r="${r}">${s('A'+r,e.date)}${s('B'+r,tc(e.category))}${s('C'+r,e.note||'')}${n('D'+r,e.amount,2)}</row>`}),
    `<row r="${tr}">${s('C'+tr,t('x_total'),1)}<c r="D${tr}" s="3"><f>SUM(D2:D${last})</f><v>${total}</v></c></row>`].join('');
  const sheet=X+`<worksheet ${NS}><cols><col min="1" max="1" width="13" customWidth="1"/><col min="2" max="2" width="16" customWidth="1"/><col min="3" max="3" width="34" customWidth="1"/><col min="4" max="4" width="14" customWidth="1"/></cols><sheetData>${body}</sheetData></worksheet>`;
  const styles=X+`<styleSheet ${NS}><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="2" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  const R='http://schemas.openxmlformats.org/officeDocument/2006/relationships',P='http://schemas.openxmlformats.org/package/2006/relationships';
  download(fileBase()+'.xlsx',zip([
    ['[Content_Types].xml',X+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels',X+`<Relationships xmlns="${P}"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml',X+`<workbook ${NS} xmlns:r="${R}"><sheets><sheet name="Expenses" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels',X+`<Relationships xmlns="${P}"><Relationship Id="rId1" Type="${R}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${R}/styles" Target="styles.xml"/></Relationships>`],
    ['xl/worksheets/sheet1.xml',sheet],['xl/styles.xml',styles]]));
}

/* PDF: fills a print-only report, then opens the print window (choose "Save as PDF") */
function toPDF(rows){
  const total=sum(rows),u=Auth.current(),by=Object.keys(CATS).map(c=>[c,sum(rows.filter(e=>e.category===c))]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  const th=heads().map((h,i)=>`<th${i==3?' class="r"':''}>${esc(h)}</th>`).join('');
  $('#printArea').innerHTML=`<h1>Roz ka Khata – ${esc(t('x_rep'))}</h1>
  <p>${esc(t('x_acct'))}: <b>${esc(u?u.name:'')}</b>${u?' ('+esc(u.email)+')':''}<br>${esc(t('x_period'))}: <b>${esc(periodLabel())}</b><br>${esc(t('x_gen'))}: ${new Date().toLocaleDateString(LOC[lang],{day:'numeric',month:'long',year:'numeric'})}</p>
  <h2>${esc(t('x_by'))}</h2>
  <table><thead><tr><th>${esc(t('x_cat'))}</th><th class="r">${esc(t('x_amt'))}</th><th class="r">%</th></tr></thead><tbody>${by.map(([c,v])=>`<tr><td>${tc(c)}</td><td class="r">${fmt2(v)}</td><td class="r">${Math.round(v/total*100)}%</td></tr>`).join('')}<tr class="tot"><td>${esc(t('x_total'))}</td><td class="r">${fmt2(total)}</td><td></td></tr></tbody></table>
  <table><thead><tr>${th}</tr></thead><tbody>${rows.map(e=>`<tr><td>${e.date}</td><td>${tc(e.category)}</td><td>${esc(clean(e.note))}</td><td class="r">${fmt2(e.amount)}</td></tr>`).join('')}<tr class="tot"><td></td><td></td><td>${esc(t('x_total'))}</td><td class="r">${fmt2(total)}</td></tr></tbody></table>`;
  const old=document.title;document.title=fileBase();
  addEventListener('afterprint',()=>{document.title=old},{once:true});
  print();
}
function doExport(kind){
  const rows=exportRows();
  if(!rows.length){$('#xerr').textContent=t('x_none');return}
  ({csv:toCSV,xlsx:toXLSX,pdf:toPDF})[kind](rows);
}
