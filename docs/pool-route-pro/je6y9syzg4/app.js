const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let page='Home';const originalDemo={business:{name:'My Pool Service',phone:'',currency:'USD',logo:''},clients:[{id:'c1',name:'Maria Gonzalez',phone:'',address:'North area',length:8,width:4,depth:1.5,pump:'1 HP pump',filter:'Sand filter',access:'Call before arriving'},{id:'c2',name:'Diego Lopez',phone:'',address:'Downtown',length:6,width:3,depth:1.4,pump:'¾ HP pump',filter:'Sand filter',access:''}],visits:[{id:'v1',client:'c1',date:'2026-10-03',next:'2026-10-10',ph:7.4,chlorine:2,alk:90,products:'',notes:'Surface and floor cleaning.',tasks:['Inspection','Cleaning','Equipment check'],photos:[]}],quotes:[],payments:[],expenses:[],backup:null};const initial={business:{name:'My Pool Service',phone:'',currency:'USD',logo:''},clients:[],visits:[],quotes:[],payments:[],expenses:[],backup:null};let db;try{db=JSON.parse(localStorage.getItem('pooltechpro-v1'))||structuredClone(initial)}catch{db=structuredClone(initial)}function sameRecord(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function cleanOriginalExamples(data){
 const result=structuredClone(data);
 result.visits=result.visits.filter(v=>!originalDemo.visits.some(d=>sameRecord(v,d)));
 result.clients=result.clients.filter(c=>{
  if(!originalDemo.clients.some(d=>sameRecord(c,d)))return true;
  return ['visits','quotes','payments','expenses'].some(k=>result[k].some(r=>r.client===c.id));
 });
 return result;
}
try{
 const cleaned=cleanOriginalExamples(db);
 if(JSON.stringify(cleaned)!==JSON.stringify(db)){
  localStorage.setItem('pooltechpro-before-example-cleanup',JSON.stringify(db));
  localStorage.setItem('pooltechpro-v1',JSON.stringify(cleaned));
  db=cleaned;
 }
}catch{/* Preserve existing records if storage is unavailable. */}
const money=x=>new Intl.NumberFormat('en-US',{style:'currency',currency:db.business.currency}).format(Number(x)||0);function save(){try{localStorage.setItem('pooltechpro-v1',JSON.stringify(db));return true}catch{notify('Could not save: storage is full. Download a backup.');return false}}function notify(t){$('toast').textContent=t;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',3500)}const client=id=>db.clients.find(c=>c.id===id);const gal=l=>Math.round(Number(l)/3.785).toLocaleString('en-US');const volume=c=>Number(c.length)*Number(c.width)*Number(c.depth)*1000;const pages=['Home','Clients','Visits','Water history','Calculators','Quotes','Payments & expenses','Quick guides','Settings'];function go(p){page=p;render();window.scrollTo(0,0)}function heading(t,sub,action=''){return '<div class="title"><div><h1>'+t+'</h1><p>'+sub+'</p></div>'+action+'</div>'}function btn(t,a,primary=false){return '<button '+(primary?'class="primary" ':'')+'onclick="'+a+'">'+t+'</button>'}function options(){return db.clients.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('')}function row(c){return '<div class="row"><div><b>'+esc(c.name)+'</b><small>'+esc(c.address)+' · '+volume(c).toLocaleString('en-US')+' L ('+gal(volume(c))+' gal) estimated</small></div>'+btn('View record',"detail('"+c.id+"')")+recordActions('client',c.id)+'</div>'}function render(){ $('nav').innerHTML=pages.map(p=>'<button class="'+(p===page?'active':'')+'" onclick="go(\''+p+'\')">'+p+'</button>').join('');let h='';if(page==='Home'){h=heading('Your workday, organized','Everything you need for your next pool.');h+='<div class="metrics"><div class="metric"><span>Clients</span><strong>'+db.clients.length+'</strong><span>with a pool record</span></div><div class="metric"><span>Logged visits</span><strong>'+db.visits.length+'</strong><span>with history</span></div><div class="metric"><span>Payments logged</span><strong>'+money(db.payments.reduce((a,p)=>a+Number(p.amount),0))+'</strong><span>running total</span></div></div><div class="grid"><div class="card"><h2>Your clients</h2>'+db.clients.map(row).join('')+'<div class="actions">'+btn('Add client',"edit('client')",true)+'</div></div><div><div class="hero"><h2>A well-logged visit</h2><p>Readings, tasks and photos in every pool record.</p>'+btn('Log a service visit',"edit('visit')",true)+'</div><div class="card" style="margin-top:18px"><h2>Protect your data</h2><p>Last backup: '+(db.backup?esc(new Date(db.backup).toLocaleDateString('en-US')):'not downloaded yet')+'</p>'+btn('Download backup','backup()')+'</div></div></div>'}
if(page==='Clients')h=heading('Clients & pools','Every pool, with its own record.',btn('Add client',"edit('client')",true))+'<div class="card">'+db.clients.map(row).join('')+'</div>';
if(page==='Visits')h=heading('Service visits','Log the work and schedule the next check.',btn('New visit',"edit('visit')",true))+'<div class="cards">'+db.visits.slice().reverse().map(v=>'<div class="card"><span class="badge">'+esc(v.date)+'</span><h2 style="margin-top:12px">'+esc(client(v.client)?.name)+'</h2><p>'+esc(v.notes)+'</p><div class="sub">pH '+v.ph+' · Chlorine '+v.chlorine+' ppm<br>Next visit: '+esc(v.next||'Not scheduled')+'</div><div class="actions">'+btn('View report',"report('"+v.id+"')")+recordActions('visit',v.id)+'</div></div>').join('')+'</div>';
if(page==='Water history'){h=heading('Water history','Compare readings for the same pool.')+'<div class="card"><label>Client</label><select id="historyClient" onchange="history()">'+options()+'</select><div id="history"></div></div>'}
if(page==='Calculators')h=heading('Calculators','Know your numbers before you quote.')+'<div class="grid"><div class="card"><h2>Service price</h2><p>Amounts per visit. Use the same currency in every field.</p>'+['Labor','Travel','Chemicals','Equipment wear','Other costs'].map((s,i)=>'<label>'+s+'</label><input id="cost'+i+'" type="number" min="0" value="'+[0,0,0,0,0][i]+'" oninput="calc()">').join('')+'<label>Margin on final price (%)</label><input id="margin" type="number" min="0" max="99" value="30" oninput="calc()"><div id="price" class="result"></div></div><div class="card"><h2>Rectangular pool volume</h2><p>Estimate using average depth (meters).</p>'+['Length (m)','Width (m)','Average depth (m)'].map((s,i)=>'<label>'+s+'</label><input id="vol'+i+'" type="number" min="0.01" step="0.1" value="'+[8,4,1.5][i]+'" oninput="calc()">').join('')+'<div id="volume" class="result"></div></div></div>';
if(page==='Quotes')h=heading('Quotes','Define the scope, chemicals and price.',btn('Create quote',"edit('quote')",true))+'<div class="cards">'+(db.quotes.length?db.quotes.map(q=>'<div class="card"><h2>'+esc(client(q.client)?.name)+'</h2><p>'+esc(q.scope)+'</p><strong>'+money(q.amount)+'</strong><div class="actions">'+btn('View quote',"quoteReport('"+q.id+"')")+recordActions('quote',q.id)+'</div></div>').join(''):'<div class="empty">No quotes yet. Create the first one for your client.</div>')+'</div>';
if(page==='Payments & expenses'){const income=db.payments.reduce((s,x)=>s+Number(x.amount),0),expense=db.expenses.reduce((s,x)=>s+Number(x.amount),0);h=heading('Payments & expenses','Logged transactions; not a replacement for bookkeeping.')+'<div class="metrics"><div class="metric"><span>Collected</span><strong>'+money(income)+'</strong></div><div class="metric"><span>Expenses</span><strong>'+money(expense)+'</strong></div><div class="metric"><span>Difference</span><strong>'+money(income-expense)+'</strong></div></div><div class="actions">'+btn('Log payment',"edit('payment')",true)+btn('Log expense',"edit('expense')")+'</div><div class="card">'+[...db.payments.map(x=>({...x,type:'Payment',recordType:'payment'})),...db.expenses.map(x=>({...x,type:'Expense',recordType:'expense'}))].map(x=>'<div class="row"><div><b>'+x.type+' · '+esc(client(x.client)?.name||'General')+'</b><small>'+esc(x.date)+' · '+esc(x.notes)+'</small></div><strong>'+money(x.amount)+'</strong>'+recordActions(x.recordType,x.id)+'</div>').join('')+'</div>'}
if(page==='Quick guides')h=heading('Getting-started guides','Practical reminders to organize every service.')+'<div class="card">'+[['First inspection','Ask what happened, when it started and which chemicals were added. Log dimensions, equipment and access conditions before you quote.'],['Maintenance routine','Observe, check, clean, test, inspect equipment, log and report. Compare with the previous visit.'],['Green or cloudy water','Log how it looks and the readings. Check how the system is running and follow the protocol in the manual before you act.'],['Before you quote','Define scope, frequency, included chemicals, travel and terms. Add up your costs and choose your margin.'],['Using chemicals','Read the product label and follow the manufacturer instructions. The app logs amounts; it does not prescribe treatments.'],['Backups and new devices','Download a backup often. To use your data on another device, open the app and import the file. Changes do not sync automatically.']].map(([t,p])=>'<details class="guide"><summary>'+t+'</summary><p>'+p+'</p></details>').join('')+'</div>';
if(page==='Settings')h=heading('My business','Customize your documents and manage backups.')+'<div class="grid"><div class="card"><form onsubmit="business(event)"><label>Business name</label><input name="name" required value="'+esc(db.business.name)+'"><label>Phone</label><input name="phone" value="'+esc(db.business.phone)+'"><label>Currency</label><select name="currency">'+['USD','AUD','CAD','GBP','NZD','EUR'].map(c=>'<option '+(c===db.business.currency?'selected':'')+'>'+c+'</option>').join('')+'</select><p class="sub">Changing the currency changes how amounts are shown; it does not convert them.</p><label>Logo (image)</label><input name="logo" type="file" accept="image/*"><div class="actions"><button class="primary">Save my business</button></div></form></div><div class="card"><h2>Full backup</h2><p>Includes clients, visits, photos and transactions. Keep it somewhere private.</p>'+btn('Download backup','backup()',true)+'<label>Restore backup</label><input type="file" accept=".json" onchange="restore(this.files[0])"><p class="sub">Importing replaces the data on this device. You will be asked to confirm.</p><h3>Your data stays on this device</h3><p class="sub">No account or password needed. Download a backup regularly.</p></div></div>';
$('view').innerHTML=h;showUndo();if(page==='Calculators')calc();if(page==='Water history')history()}
function field(name,label,type='text',value=''){return '<label>'+label+'</label><input name="'+name+'" type="'+type+'" '+(type==='number'?'min="0" step="any" ':'')+'value="'+esc(value)+'" required>'}const recordKeys={client:'clients',visit:'visits',quote:'quotes',payment:'payments',expense:'expenses'};
const recordLabels={client:'client',visit:'visit',quote:'quote',payment:'payment',expense:'expense'};
let lastRemoved=null;
function recordActions(type,id){return '<div class="record-actions">'+btn('Edit',"edit('"+type+"','"+id+"')")+btn('Delete',"removeRecord('"+type+"','"+id+"')")+'</div>'}
function removeRecord(type,id){
 const key=recordKeys[type],index=db[key]?.findIndex(x=>x.id===id);
 if(index===undefined||index<0)return;
 if(type==='client'){
  const linked=['visits','quotes','payments','expenses'].filter(k=>db[k].some(x=>x.client===id));
  if(linked.length){notify('This client has linked records. Delete their visits, quotes, payments and expenses first, or edit the record.');return}
 }
 if(!confirm('Delete this '+recordLabels[type]+'? You can restore it with Undo while this page stays open.'))return;
 const item=db[key].splice(index,1)[0];
 if(!save()){db[key].splice(index,0,item);return}
 lastRemoved={key,index,item};render();notify('Record deleted. You can undo it.');
}
function showUndo(){
 if(!lastRemoved)return;
 $('view').insertAdjacentHTML('afterbegin','<div class="undo-banner" role="status">Deleted a '+recordLabels[Object.keys(recordKeys).find(k=>recordKeys[k]===lastRemoved.key)]+'. '+btn('Undo','undoRemove()')+'</div>');
}
function undoRemove(){
 if(!lastRemoved)return;
 const {key,index,item}=lastRemoved;
 if(item.client&&!client(item.client)){notify('Restore the client from a backup first.');return}
 db[key].splice(Math.min(index,db[key].length),0,item);
 if(!save()){db[key].splice(db[key].findIndex(x=>x.id===item.id),1);return}
 lastRemoved=null;render();notify('Record restored');
}
function edit(type,id=null){
 const key=recordKeys[type],existing=id?db[key].find(x=>x.id===id):null;
 if(id&&!existing){notify('Record not found.');return}
 if(type!=='client'&&!db.clients.length){notify('Add a client first to log this work.');go('Clients');return}
 $('modalTitle').textContent=existing?'Edit '+recordLabels[type]:{client:'New client',visit:'Log a service visit',quote:'New quote',payment:'Log payment',expense:'Log expense'}[type];
 let h='';
 if(type!=='client')h='<label>Client</label><select name="client" required>'+options()+'</select>';
 if(type==='client')h+=field('name','Name')+field('phone','Phone')+field('address','Address / area')+'<div class="split">'+field('length','Length (m)','number')+field('width','Width (m)','number')+'</div>'+field('depth','Average depth (m)','number')+field('pump','Pump')+field('filter','Filter')+'<label>Access notes</label><textarea name="access"></textarea>';
 if(type==='visit')h+=field('date','Date','date',new Date().toLocaleDateString('en-CA'))+'<div class="split">'+field('ph','pH','number')+field('chlorine','Free chlorine (ppm)','number')+'</div>'+field('alk','Total alkalinity (ppm)','number')+'<label>Tasks done</label>'+['Inspection','Cleaning','Equipment check','Water testing'].map(t=>'<label><input style="width:auto" type="checkbox" name="tasks" value="'+t+'"> '+t+'</label>').join('')+'<label>Chemicals and amounts used</label><textarea name="products"></textarea><label>Notes</label><textarea name="notes"></textarea>'+(existing?.photos?.length?'<label>Saved photos</label>'+existing.photos.map((src,i)=>'<div><img class="photo" src="'+esc(src)+'" alt="Photo '+(i+1)+'"><label><input style="width:auto" type="checkbox" name="removePhoto" value="'+i+'"> Remove this photo</label></div>').join(''):'')+'<label>'+(existing?'Add photos':'Photos')+'</label><input type="file" name="photos" accept="image/*" multiple><label>Next visit</label><input type="date" name="next">';
 if(type==='quote')h+='<label>Work and scope</label><textarea name="scope" required></textarea>'+field('frequency','Frequency')+'<label>Chemicals included / excluded</label><textarea name="products"></textarea>'+field('amount','Price','number')+field('valid','Valid until','date');
 if(['payment','expense'].includes(type))h+=field('date','Date','date',new Date().toLocaleDateString('en-CA'))+field('amount','Amount','number')+'<label>Description / notes</label><textarea name="notes"></textarea>';
 $('fields').innerHTML=h;
 const form=$('form');
 form.querySelector('button.primary').textContent=existing?'Save changes':'Save';
 if(existing){
  for(const control of form.elements){
   if(!control.name||control.type==='file'||control.name==='removePhoto')continue;
   if(control.type==='checkbox'){control.checked=(existing.tasks||[]).includes(control.value);continue}
   if(existing[control.name]!==undefined)control.value=existing[control.name];
  }
 }
 form.onsubmit=async e=>{
  e.preventDefault();
  const submit=form.querySelector('button.primary');submit.disabled=true;
  try{
   const data=new FormData(form),x=Object.fromEntries([...data].filter(([k,v])=>!(v instanceof File)&&k!=='removePhoto'));
   x.id=existing?existing.id:crypto.randomUUID();
   if(type==='visit'){
    x.tasks=data.getAll('tasks');
    const removed=data.getAll('removePhoto').map(Number);
    const added=await Promise.all([...form.elements.namedItem('photos').files].map(readImage));
    x.photos=[...(existing?.photos||[]).filter((_,i)=>!removed.includes(i)),...added];
   }
   const updated=commitRecord(type,x);
   if(!updated)return;
   $('modal').close();render();notify(existing?'Changes saved':'Saved on this device');
  }catch{notify('Could not save. Check the photos and try again.')}
  finally{submit.disabled=false}
 };
 $('modal').showModal();
}
function commitRecord(type,x){
 const key=recordKeys[type],index=db[key].findIndex(r=>r.id===x.id),old=index>=0?db[key][index]:null;
 if(index>=0)db[key][index]={...old,...x};else db[key].push(x);
 if(!save()){if(index>=0)db[key][index]=old;else db[key].pop();return false}
 return true;
}
function readImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas'),scale=Math.min(1,1400/img.width);c.width=img.width*scale;c.height=img.height*scale;c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.75))};img.onerror=()=>reject(new Error('Invalid image'));img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
function detail(id){const c=client(id);$('view').innerHTML=heading(esc(c.name),esc(c.address),btn('Back to clients',"go('Clients')"))+'<div class="grid"><div class="card"><h2>Pool record</h2><p>'+esc(c.length)+' × '+esc(c.width)+' m · Average depth '+esc(c.depth)+' m</p><div class="result"><span>Estimated volume</span><strong>'+volume(c).toLocaleString('en-US')+' L · '+gal(volume(c))+' gal</strong></div><p>Pump: '+esc(c.pump)+'<br>Filter: '+esc(c.filter)+'<br>Access: '+esc(c.access)+'<br>Phone: '+esc(c.phone)+'</p></div><div class="card"><h2>Visit history</h2>'+db.visits.filter(v=>v.client===id).map(v=>'<div class="row"><span>'+esc(v.date)+'</span>'+btn('Report',"report('"+v.id+"')")+'</div>').join('')+'</div></div>'}
function history(){const records=db.visits.filter(v=>v.client===$('historyClient').value).sort((a,b)=>a.date.localeCompare(b.date));$('history').innerHTML='<h3 style="margin-top:20px">pH trend</h3><div class="bars">'+records.map(v=>'<div title="'+esc(v.date)+' · pH '+v.ph+'"><div class="bar" style="height:'+Math.min(95,Math.max(1,Number(v.ph)*6))+'px"></div><small>'+esc(v.ph)+'</small></div>').join('')+'</div><div class="tablewrap"><table><tr><th>Date</th><th>pH</th><th>Chlorine ppm</th><th>Alkalinity ppm</th><th>Chemicals</th></tr>'+records.map(v=>'<tr><td>'+esc(v.date)+'</td><td>'+esc(v.ph)+'</td><td>'+esc(v.chlorine)+'</td><td>'+esc(v.alk)+'</td><td>'+esc(v.products)+'</td></tr>').join('')+'</table></div>'}
function calc(){const cost=[0,1,2,3,4].reduce((s,i)=>s+Math.max(0,Number($('cost'+i).value)),0),m=Number($('margin').value);$('price').innerHTML=m>=0&&m<100?'<span>Suggested price per visit</span><strong>'+money(cost/(1-m/100))+'</strong><p>Cost: '+money(cost)+'<br>Estimated profit: '+money(cost/(1-m/100)-cost)+'</p><small>Price = cost ÷ (1 − margin / 100). Taxes not included.</small>':'Enter a margin between 0 and 99%.';const v=[0,1,2].reduce((p,i)=>p*Math.max(0,Number($('vol'+i).value)),1);$('volume').innerHTML='<span>Estimated volume</span><strong>'+(v*1000).toLocaleString('en-US')+' L · '+gal(v*1000)+' gal</strong><small>'+v.toLocaleString('en-US')+' m³ · Length × width × average depth</small>'}
function documentHeader(){return(db.business.logo?'<img class="photo" src="'+db.business.logo+'" alt="Logo">':'')+'<h2>'+esc(db.business.name)+'</h2><p>'+esc(db.business.phone)+'</p>'}function report(id){const v=db.visits.find(x=>x.id===id),c=client(v.client);$('view').innerHTML=heading('Service report',esc(c?.name)+' · '+esc(v.date))+'<div class="actions">'+btn('Save PDF / print','window.print()',true)+btn('Share summary',"shareVisit('"+id+"')")+btn('Back',"go('Visits')")+'</div><p class="noprint sub">In the print window, choose “Save as PDF”.</p><article class="card">'+documentHeader()+'<h2>Service report</h2><p>Client: '+esc(c?.name)+'<br>Date: '+esc(v.date)+'<br>Address: '+esc(c?.address)+'</p><h3>Readings</h3><p>pH: '+esc(v.ph)+' · Free chlorine: '+esc(v.chlorine)+' ppm · Alkalinity: '+esc(v.alk)+' ppm</p><h3>Work done</h3><p>'+esc(v.tasks.join(', '))+'</p><h3>Chemicals used</h3><p>'+esc(v.products||'Not logged')+'</p><h3>Notes</h3><p>'+esc(v.notes)+'</p>'+v.photos.map(src=>'<img class="photo" src="'+src+'" alt="Service photo">').join('')+'<p>Next visit: '+esc(v.next||'To be scheduled')+'</p></article>'}
function quoteReport(id){const q=db.quotes.find(x=>x.id===id);$('view').innerHTML=heading('Quote',esc(client(q.client)?.name))+'<div class="actions">'+btn('Save PDF / print','window.print()',true)+btn('Back',"go('Quotes')")+'</div><article class="card">'+documentHeader()+'<h2>Quote for '+esc(client(q.client)?.name)+'</h2><h3>Scope</h3><p>'+esc(q.scope)+'</p><p>Frequency: '+esc(q.frequency)+'<br>Chemicals: '+esc(q.products)+'<br>Valid until: '+esc(q.valid)+'</p><h2>'+money(q.amount)+'</h2></article>'}
function shareVisit(id){const v=db.visits.find(x=>x.id===id);const t=db.business.name+' — Service report for '+client(v.client)?.name+'\nDate: '+v.date+'\npH: '+v.ph+' · Chlorine: '+v.chlorine+' ppm\n'+v.notes+'\nNext visit: '+(v.next||'To be scheduled');if(navigator.share){navigator.share({text:t}).catch(()=>{})}else{window.open('sms:?&body='+encodeURIComponent(t),'_blank','noopener')}}
function download(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function backup(){db.backup=new Date().toISOString();save();download({format:'pool-tech-pro',version:1,data:db},'pool-tech-pro-backup-'+new Date().toISOString().slice(0,10)+'.json');render()}
async function restore(f){if(!f)return;try{const r=JSON.parse(await f.text());if(r.format!=='pool-tech-pro'||r.version!==1||!r.data.business||!['clients','visits','quotes','payments','expenses'].every(k=>Array.isArray(r.data[k])))throw Error();if(!confirm('Replace the data on this device with the backup? Download the current data first if you want to keep it.'))return;const old=db;db=r.data;if(!save()){db=old;return}render();notify('Backup restored')}catch{notify('This file is not a valid backup.')}}
async function business(e){e.preventDefault();const f=e.target,b={name:f.elements.namedItem('name').value,phone:f.phone.value,currency:f.currency.value,logo:db.business.logo};if(f.logo.files[0])b.logo=await readImage(f.logo.files[0]);const prev=db.business;db.business=b;if(!save()){db.business=prev;return}notify('Settings saved');render()}
window.addEventListener('online',()=>{$('connection').textContent='Online · local storage'});window.addEventListener('offline',()=>{$('connection').textContent='Offline · local storage'});if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});render();

