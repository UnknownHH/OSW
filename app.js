const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

const requiredFields = [
  ['sku','SKU'], ['title','商品标题'], ['image','图片链接'], ['link','商品链接'], ['category','类目'], ['brand','品牌'],
  ['priceRmb','价格人民币'], ['priceRub','价格卢布'], ['originalRub','原价/划线价'], ['seller','卖家类型'], ['weekly','周销量'], ['monthly','月销量'], ['revenue','月销售额'],
  ['adPct','广告费用占比'], ['adDays','付费推广天数'], ['promoDays','促销天数'], ['followers','被跟数量'], ['followerPriceRange','被跟最低/最高价'], ['followerMinPrice','被跟最低价'], ['followerMaxPrice','被跟最高价'],
  ['impressions','商品展示总量'], ['displayConv','展示转化率'], ['clicks','商品点击总量'], ['searchViews','搜索中的浏览量'],
  ['turnoverDynamic','周转动态'], ['conv','成交率'], ['cartConv','购物车转化率'], ['created','商品创建时间'], ['stock','活动库存'], ['rating','评分'], ['reviews','评论数'],
  ['length','长/mm'], ['width','宽/mm'], ['height','高/mm'], ['weight','重量/g']
];
const aliases = {
  sku:['sku','商品id','商品编号','Артикул','id'],
  title:['商品标题','标题','名称','name','title','商品名称','Название'],
  image:['图片链接','图片url','主图','主图链接','图片','image','img','photo','Фото'],
  link:['商品链接','商品url','商品地址','product link','product url','ozon商品链接','url','link','Ссылка'],
  category:['类目','分类','category','Категория'], brand:['品牌','brand','Бренд'],
  priceRmb:['价格（人民币）','人民币','price rmb','价格人民币','成本','采购价'], priceRub:['价格','售价','卢布','price','当前价格','Цена'], originalRub:['原价','划线价','原价（卢布）','原价格','old price','original price','До скидки'],
  seller:['卖家类型','配送方式','seller','FBO','FBS'], weekly:['周销量','7天销量','weekly','week sales'], monthly:['月销量','30天销量','monthly','month sales'], revenue:['月销售额','销售额','GMV','revenue'],
  adPct:['广告费用占比','广告占比','acos','ad cost','推广占比'], adDays:['付费推广（28天参与）','付费推广','广告天数','推广天数','付费推广天数'], promoDays:['促销活动（28天参与）','促销天数','促销活动'],
  followers:['被跟数量','跟卖','被跟','竞争数','followers'], followerPriceRange:['被跟最低/最高价','被跟最低最高价','跟卖最低/最高价'], followerMinPrice:['被跟最低价','跟卖最低价','最低跟卖价','最低跟卖价格'], followerMaxPrice:['被跟最高价','跟卖最高价','最高跟卖价','最高跟卖价格'],
  impressions:['商品展示总量','展示总量','展示量','impressions'], displayConv:['展示转化率','展现转化率','浏览转化率','display conversion'], clicks:['商品点击总量','商品点击量','点击量','clicks'], searchViews:['搜索中的浏览量','搜索浏览量','搜索浏览','search views'],
  turnoverDynamic:['周转动态','周转','动销','turnover','turnover dynamic'], conv:['成交率','转化率','conversion'], cartConv:['购物车转化率','加购率','cart'],
  created:['商品创建时间','创建时间','上架时间','created'], stock:['活动库存','库存','stock'], rating:['评分','rating'], reviews:['评论数量','评论数','评价数','reviews'],
  length:['长度/mm','长度','长'], width:['宽度/mm','宽度','宽'], height:['高度/mm','高度','高'], weight:['重量/g','重量','weight']
};
const cardFieldOptions = [
  {key:'brand', label:'品牌', val:r=>r.hasBrand ? r.brand : '无品牌'},
  {key:'adDays', label:'付费推广天数', val:r=>fmt(r.adDays)},
  {key:'adPct', label:'广告占比', val:r=>fmt(r.adPct,1)+'%'},
  {key:'sales', label:'周/月销量', val:r=>`${fmt(r.weekly)}/${fmt(r.monthly)}`},
  {key:'turnoverDynamic', label:'周转动态', val:r=>r.turnoverDynamic || '-'},
  {key:'conv', label:'成交率', val:r=>fmt(r.conv,1)+'%'},
  {key:'impressions', label:'展示总量', val:r=>fmt(r.impressions)},
  {key:'displayConv', label:'展示转化率', val:r=>fmt(r.displayConv,1)+'%'},
  {key:'clicks', label:'点击总量', val:r=>fmt(r.clicks)},
  {key:'searchViews', label:'搜索浏览量', val:r=>fmt(r.searchViews)},
  {key:'created', label:'创建时间', val:r=>r.age>=9999 ? '-' : `已创建 ${r.age} 天`},
  {key:'followerPrices', label:'跟卖最低/最高价', val:r=>`${r.followerMinPrice?fmt(r.followerMinPrice):'-'}~ ${r.followerMaxPrice?fmt(r.followerMaxPrice):'-'}`, title:r=>`${r.followerMinPrice?fmt(r.followerMinPrice):'-'} / ${r.followerMaxPrice?fmt(r.followerMaxPrice):'-'}`},
  {key:'weight', label:'重量', val:r=>r.weight ? `${fmt(r.weight)}g` : '-'},
  {key:'ratingReviews', label:'评分/评论', val:r=>`${r.rating?fmt(r.rating,1):'-'} / ${fmt(r.reviews)}`},
  {key:'revenue', label:'月销售额', val:r=>fmt(r.revenue)},
  {key:'followers', label:'跟卖数', val:r=>fmt(r.followers)}
];
const defaultVisible = ['sales','revenue','followers','adPct'];
const defaultFieldOrder = cardFieldOptions.map(o=>o.key);
const state = {raw:[], headers:[], map:{}, rows:[], filtered:[], view:'card', preset:'', exchangeRate:12.5, visibleFields:new Set(defaultVisible), cardFieldOrder:[...defaultFieldOrder]};
const DEFAULT_CONSOLE_CONFIG = {
  app:'ozon_selection_workbench',
  version:'v5-defaultconfig',
  exchangeRate:12.5,
  sortBy:'score-desc',
  view:'card',
  preset:'',
  filters:{
    keyword:'', categoryFilter:'', sellerFilter:'', brandFilter:'', minScore:'0', minWeekly:'0', minFollowers:'', maxAdPct:'', maxWeight:'', maxAdDays:'', minConv:'', maxConv:'', minImpressions:'', minDisplayConv:'', minClicks:'', minSearchViews:'', maxAge:'', turnoverFilter:'', minFollowerPrice:'', maxFollowerPrice:'', minRating:'', minReviews:'', maxLength:'', maxWidth:'', maxHeight:''
  },
  visibleFields:[...defaultVisible],
  cardFieldOrder:[...defaultFieldOrder],
  mapping:{}
};

const els = {
  fileInput: $('#fileInput'), configInput: $('#configInput'), uploadBox: $('#uploadBox'), fileHint: $('#fileHint'), mappingPanel: $('#mappingPanel'), mappingGrid: $('#mappingGrid'), cardFieldChecks: $('#cardFieldChecks'),
  keyword: $('#keyword'), categoryFilter: $('#categoryFilter'), sellerFilter: $('#sellerFilter'), brandFilter: $('#brandFilter'), minScore: $('#minScore'), minWeekly: $('#minWeekly'), minFollowers: $('#minFollowers'), maxAdPct: $('#maxAdPct'), maxWeight: $('#maxWeight'), maxAdDays: $('#maxAdDays'), minConv: $('#minConv'), maxConv: $('#maxConv'), minImpressions: $('#minImpressions'), minDisplayConv: $('#minDisplayConv'), minClicks: $('#minClicks'), minSearchViews: $('#minSearchViews'), maxAge: $('#maxAge'), turnoverFilter: $('#turnoverFilter'), minFollowerPrice: $('#minFollowerPrice'), maxFollowerPrice: $('#maxFollowerPrice'), minRating: $('#minRating'), minReviews: $('#minReviews'), maxLength: $('#maxLength'), maxWidth: $('#maxWidth'), maxHeight: $('#maxHeight'), exchangeRate: $('#exchangeRate'),
  sortBy: $('#sortBy'), productGrid: $('#productGrid'), tableWrap: $('#tableWrap'), productTable: $('#productTable'), listStatus: $('#listStatus'), mainTitle: $('#mainTitle'),
  statsGrid: $('#statsGrid'), categoryList: $('#categoryList'), conclusionBox: $('#conclusionBox'), modal: $('#detailModal'), modalContent: $('#modalContent')
};

const filterControlIds = ['keyword','categoryFilter','sellerFilter','brandFilter','minScore','minWeekly','minFollowers','maxAdPct','maxWeight','maxAdDays','minConv','maxConv','minImpressions','minDisplayConv','minClicks','minSearchViews','maxAge','turnoverFilter','minFollowerPrice','maxFollowerPrice','minRating','minReviews','maxLength','maxWidth','maxHeight'];

function normHeader(s){return String(s||'').trim().toLowerCase().replace(/[\s_()（）\-/]/g,'');}
function detectMap(headers){
  const normalized = headers.map(h => [h, normHeader(h)]), map = {};
  const exactPreferred = {image:['图片链接','主图链接','图片url'], link:['商品链接','商品url','商品地址','productlink','producturl'], brand:['品牌'], followers:['被跟数量'], weight:['重量/g','重量'], priceRub:['价格'], priceRmb:['价格（人民币）'], originalRub:['原价','划线价']};
  for(const [key] of requiredFields){
    const exacts=(exactPreferred[key]||[]).map(normHeader); let hit=normalized.find(([h,n])=>exacts.includes(n));
    if(!hit){
      const terms=(aliases[key]||[]).map(normHeader); let best=null;
      for(const item of normalized){const [h,n]=item; let score=0; for(const t of terms){if(n===t) score=Math.max(score,100); else if(n.includes(t)||t.includes(n)) score=Math.max(score,50-Math.abs(n.length-t.length));}
        if(key==='link' && /图片|image|img|photo/.test(String(h).toLowerCase())) score-=80;
        if(key==='image' && /商品链接|productlink|producturl/.test(n)) score-=80;
        if(score>0 && (!best || score>best.score)) best={item,score};}
      hit=best?.item;
    }
    map[key]=hit?hit[0]:'';
  }
  return map;
}
function cleanNum(v){ if(v===null||v===undefined) return 0; let s=String(v).replace(/\u00a0|\u2009/g,'').replace(/,/g,'.').replace(/−/g,'-').trim(); if(!s||/^null$/i.test(s)) return 0; const m=s.match(/-?\d+(?:\.\d+)?/); return m?Number(m[0]):0; }
function text(v){return v===null||v===undefined?'':String(v).trim();}
function isNoBrand(v){const s=text(v).toLowerCase(); return !s || ['无品牌','нетбренда','nobrand','none','null','-','/'].includes(s.replace(/\s+/g,''));}
function findUrl(row, preferProduct=false){const vals=Object.values(row).map(text).filter(Boolean); const ozon=vals.find(v=>/^https?:\/\/.*ozon\.ru\/product\//i.test(v)); if(preferProduct&&ozon) return ozon; return vals.find(v=>/^https?:\/\//i.test(v)&&(preferProduct?!/ozonstatic|multimedia|\.(jpg|jpeg|png|webp)(\?|$)/i.test(v):/ozonstatic|multimedia|\.(jpg|jpeg|png|webp)(\?|$)/i.test(v)))||'';}
function get(row,key){return state.map[key] ? row[state.map[key]] : '';}
function getNum(row,key){return cleanNum(get(row,key));}
function ageDays(v){const s=text(v); const m=s.match(/已创建\s*(\d+)\s*天/); if(m) return Number(m[1]); const d=s.match(/(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/); if(d){const dt=new Date(+d[1],+d[2]-1,+d[3]); if(!isNaN(dt)) return Math.max(0,Math.round((Date.now()-dt.getTime())/86400000));} return 9999;}
function parseFollowerRange(v){const nums=String(v||'').replace(/,/g,'.').match(/\d+(?:\.\d+)?/g)||[]; const arr=nums.map(Number).filter(n=>!isNaN(n)); return {min:arr[0]||0,max:arr[1]||arr[0]||0};}
function clamp(n,min=0,max=100){return Math.max(min,Math.min(max,n));}
function scoreRow(r){
  const weekly=getNum(r,'weekly'), monthly=getNum(r,'monthly'), revenue=getNum(r,'revenue'), followers=getNum(r,'followers'), adPct=getNum(r,'adPct'), reviews=getNum(r,'reviews'), impressions=getNum(r,'impressions'), price=getNum(r,'priceRub')||getNum(r,'priceRmb');
  const age=ageDays(get(r,'created')), weight=getNum(r,'weight'), l=getNum(r,'length'), w=getNum(r,'width'), h=getNum(r,'height');
  const demand=clamp(Math.log1p(weekly*4+monthly+revenue/1200+impressions/900)*16), comp=clamp(100-followers*2.4-Math.log1p(reviews)*7), organic=clamp(100-adPct*2.1+(weekly>0&&adPct<5?12:0)), newness=age<7?82:age<30?96:age<90?76:age<180?55:35;
  const logistics=clamp(100-((weight>800?18:0)+(weight>2000?18:0)+((l*w*h)>800000?18:0)+(price>15000?8:0)));
  const score=clamp(demand*.36+comp*.24+organic*.16+newness*.12+logistics*.12), risk=followers>40||adPct>35||reviews>800||(weekly===0&&revenue===0)||age>3000;
  const tags=[]; if(score>=75) tags.push(['高机会','good']); else if(score>=58) tags.push(['可观察','warn']); else tags.push(['谨慎','bad']); if(followers<=8&&weekly>=5) tags.push(['低跟卖','good']); if(age<=30&&weekly>=3) tags.push(['新品起量','good']); if(adPct<=5&&weekly>=5) tags.push(['自然流','good']); if(risk) tags.push(['风险项','bad']);
  return {score:Math.round(score), age, risk, tags, demand:Math.round(demand), comp:Math.round(comp), organic:Math.round(organic)};
}
function normalizeRows(){
  state.rows=state.raw.map((r,i)=>{
    const m=scoreRow(r); const priceRub=getNum(r,'priceRub'), priceRmb=getNum(r,'priceRmb');
    const range=parseFollowerRange(get(r,'followerPriceRange'));
    const followerMinPrice=getNum(r,'followerMinPrice') || range.min;
    const followerMaxPrice=getNum(r,'followerMaxPrice') || range.max;
    return {idx:i+1, raw:r, sku:text(get(r,'sku')), title:text(get(r,'title'))||'未命名商品', image:(text(get(r,'image'))||findUrl(r,false)), link:(/^https?:\/\/.*ozon\.ru\/product\//i.test(text(get(r,'link')))?text(get(r,'link')):findUrl(r,true)), category:text(get(r,'category'))||'未分类', brand:text(get(r,'brand')), hasBrand:!isNoBrand(get(r,'brand')), length:getNum(r,'length'), width:getNum(r,'width'), height:getNum(r,'height'), weight:getNum(r,'weight'), priceRmb, priceRub, originalRub:getNum(r,'originalRub'), seller:text(get(r,'seller')), weekly:getNum(r,'weekly'), monthly:getNum(r,'monthly'), revenue:getNum(r,'revenue'), adPct:getNum(r,'adPct'), adDays:getNum(r,'adDays'), followers:getNum(r,'followers'), followerPriceRange:text(get(r,'followerPriceRange')), followerMinPrice, followerMaxPrice, impressions:getNum(r,'impressions'), displayConv:getNum(r,'displayConv'), clicks:getNum(r,'clicks'), searchViews:getNum(r,'searchViews'), turnoverDynamic:text(get(r,'turnoverDynamic')), conv:getNum(r,'conv'), cartConv:getNum(r,'cartConv'), stock:getNum(r,'stock'), rating:getNum(r,'rating'), reviews:getNum(r,'reviews'), createdText:text(get(r,'created')), age:m.age, score:m.score, risk:m.risk, tags:m.tags, demand:m.demand, comp:m.comp, organic:m.organic};
  }); fillFilterOptions(); applyFilters();
}
function fillFilterOptions(){const cats=[...new Set(state.rows.map(r=>r.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-Hans-CN')); const sellers=[...new Set(state.rows.map(r=>r.seller).filter(Boolean))].sort(); const brands=[...new Set(state.rows.filter(r=>r.hasBrand).map(r=>r.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-Hans-CN')); els.categoryFilter.innerHTML='<option value="">全部类目</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join(''); els.sellerFilter.innerHTML='<option value="">全部类型</option>'+sellers.map(c=>`<option>${esc(c)}</option>`).join(''); els.brandFilter.innerHTML='<option value="">全部品牌</option><option value="__NO_BRAND__">无品牌</option>'+brands.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');}
function inputNum(id, fallback){const el=els[id]; return !el || el.value==='' ? fallback : cleanNum(el.value);}
function applyFilters(){
  const kw=els.keyword.value.trim().toLowerCase(), cat=els.categoryFilter.value, seller=els.sellerFilter.value, brandFilter=els.brandFilter.value;
  const minScore=inputNum('minScore',0), minWeekly=inputNum('minWeekly',0), minF=inputNum('minFollowers',0), maxAd=inputNum('maxAdPct',Infinity), maxWeight=inputNum('maxWeight',Infinity), maxAdDays=inputNum('maxAdDays',Infinity), minConv=inputNum('minConv',0), maxConv=inputNum('maxConv',Infinity), minImpressions=inputNum('minImpressions',0), minDisplayConv=inputNum('minDisplayConv',0), minClicks=inputNum('minClicks',0), minSearchViews=inputNum('minSearchViews',0), maxAge=inputNum('maxAge',Infinity), minFollowerPrice=inputNum('minFollowerPrice',0), maxFollowerPrice=inputNum('maxFollowerPrice',Infinity), minRating=inputNum('minRating',0), minReviews=inputNum('minReviews',0), maxLength=inputNum('maxLength',Infinity), maxWidth=inputNum('maxWidth',Infinity), maxHeight=inputNum('maxHeight',Infinity);
  const minTurnover=inputNum('turnoverFilter',0);
  state.filtered=state.rows.filter(r=>{
    const hay=[r.title,r.sku,r.brand,r.category].join(' ').toLowerCase();
    if(kw&&!hay.includes(kw)) return false; if(cat&&r.category!==cat) return false; if(seller&&r.seller!==seller) return false;
    if(brandFilter==='__NO_BRAND__'&&r.hasBrand) return false; if(brandFilter && brandFilter!=='__NO_BRAND__' && r.brand!==brandFilter) return false;
    if(r.score<minScore||r.weekly<minWeekly||r.followers<minF||r.adPct>maxAd) return false;
    if(r.weight&&r.weight>maxWeight) return false; if(r.adDays&&r.adDays>maxAdDays) return false; if(r.conv<minConv||r.conv>maxConv) return false;
    if(r.impressions<minImpressions||r.displayConv<minDisplayConv||r.clicks<minClicks||r.searchViews<minSearchViews) return false;
    if(r.age>maxAge) return false; if(cleanNum(r.turnoverDynamic)<minTurnover) return false;
    if(r.followerMinPrice && r.followerMinPrice<minFollowerPrice) return false; if(r.followerMaxPrice && r.followerMaxPrice>maxFollowerPrice) return false;
    if(r.rating<minRating||r.reviews<minReviews) return false; if(r.length&&r.length>maxLength) return false; if(r.width&&r.width>maxWidth) return false; if(r.height&&r.height>maxHeight) return false;
    if(state.preset==='blue'&&!(r.score>=65&&r.followers<=12&&r.weekly>=3)) return false; if(state.preset==='new'&&!(r.age<=45&&r.weekly>=3)) return false; if(state.preset==='organic'&&!(r.adPct<=5&&r.weekly>=5)) return false; if(state.preset==='risk'&&!r.risk) return false; return true;
  });
  sortRows(); renderAll();
}
function sortRows(){const v=els.sortBy.value; const sorters={'score-desc':(a,b)=>b.score-a.score,'weekly-desc':(a,b)=>b.weekly-a.weekly,'revenue-desc':(a,b)=>b.revenue-a.revenue,'followers-asc':(a,b)=>a.followers-b.followers,'ad-asc':(a,b)=>a.adPct-b.adPct,'price-asc':(a,b)=>(rubPrice(a)||0)-(rubPrice(b)||0)}; state.filtered.sort(sorters[v]||sorters['score-desc']);}
function renderAll(){renderStatus(); renderCards(); renderTable(); renderStats(); renderCategories(); renderConclusion();}
function renderStatus(){const total=state.rows.length,n=state.filtered.length; els.mainTitle.textContent=total?`已导入 ${total.toLocaleString()} 个商品`:'请先导入数据'; els.listStatus.textContent=total?`当前显示 ${n.toLocaleString()} / ${total.toLocaleString()} 个商品。左侧可设置筛选和商品卡显示字段。`:'导入表格后，这里会显示商品列表。';}
function esc(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function fmt(n,d=0){n=Number(n)||0; return n.toLocaleString('zh-CN',{maximumFractionDigits:d});}
function rubPrice(r){return r.priceRub || (state.exchangeRate ? r.priceRmb*state.exchangeRate : 0);}
function cnyPrice(r){return r.priceRmb || (state.exchangeRate ? rubPrice(r)/state.exchangeRate : 0);}
function fmtRub(r){const v=rubPrice(r); return v ? '₽ '+fmt(v,0) : '₽ -';}
function fmtCny(r){const v=cnyPrice(r); return v ? '≈ ¥ '+fmt(v,2) : '≈ ¥ -';}
function fmtOriginalRub(r){const v=r.originalRub||0, cur=rubPrice(r)||0; return v && (!cur || Math.round(v)!==Math.round(cur)) ? '₽ '+fmt(v,0) : '';}
function orderedCardFieldOptions(){
  const byKey = new Map(cardFieldOptions.map(o=>[o.key,o]));
  const ordered = state.cardFieldOrder.map(k=>byKey.get(k)).filter(Boolean);
  const missing = cardFieldOptions.filter(o=>!state.cardFieldOrder.includes(o.key));
  return [...ordered, ...missing];
}
function metricHtml(r){return orderedCardFieldOptions().filter(o=>state.visibleFields.has(o.key)).map(o=>{const val=o.val(r); const body=o.html?o.html(r):esc(val); const title=o.title?o.title(r):val; return `<div class="metric ${esc(o.key)}"><span>${o.label}</span><b title="${esc(title)}">${body}</b></div>`;}).join('');}
function renderCards(){
  if(!state.filtered.length){els.productGrid.innerHTML=state.rows.length?'<p class="empty-card">没有符合筛选条件的商品。</p>':''; return;}
  els.productGrid.innerHTML=state.filtered.slice(0,600).map(r=>`
    <article class="card">
      <div class="pic">${r.image?`<img loading="lazy" src="${esc(r.image)}" onerror="this.remove();this.parentNode.insertAdjacentHTML('beforeend','<span class=no-img>图片不可用</span>')">`:'<span class="no-img">无图片</span>'}<span class="score-badge">${r.score}</span></div>
      <div class="card-body">
        <div class="title" title="${esc(r.title)}">${esc(r.title)}</div>
        <div class="price-block"><div class="price-line"><span class="price-left"><span class="rub-price">${fmtRub(r)}</span>${fmtOriginalRub(r)?`<del class="origin-price">${fmtOriginalRub(r)}</del>`:""}</span><span class="cny-price">${fmtCny(r)}</span></div><div class="price-divider"></div></div>
        <div class="metrics">${metricHtml(r)}</div>
        <div class="meta">${r.tags.slice(0,3).map(t=>`<span class="pill ${t[1]}">${t[0]}</span>`).join('')}<span class="pill">${esc(r.category.split('/').slice(-1)[0])}</span></div>
        <div class="card-actions"><button onclick="showDetail(${r.idx})">详情</button>${r.link?`<a href="${esc(r.link)}" target="_blank" rel="noreferrer">打开 OZON</a>`:'<a class="disabled">无链接</a>'}</div>
      </div>
    </article>`).join('');
}
function renderTable(){const head=['图片','机会分','标题','类目','价格₽','人民币¥','周/月销量','月销售额','跟卖','广告%','卖家','操作']; $('#productTable thead').innerHTML='<tr>'+head.map(h=>`<th>${h}</th>`).join('')+'</tr>'; $('#productTable tbody').innerHTML=state.filtered.slice(0,1000).map(r=>`<tr><td><div class="thumb">${r.image?`<img src="${esc(r.image)}">`:''}</div></td><td><b>${r.score}</b></td><td>${esc(r.title)}</td><td>${esc(r.category)}</td><td>${fmt(rubPrice(r),0)}</td><td>${fmt(cnyPrice(r),2)}</td><td>${fmt(r.weekly)}/${fmt(r.monthly)}</td><td>${fmt(r.revenue)}</td><td>${fmt(r.followers)}</td><td>${fmt(r.adPct,1)}</td><td>${esc(r.seller)}</td><td><a class="linkish" href="javascript:showDetail(${r.idx})">详情</a>${r.link?` · <a class="linkish" target="_blank" href="${esc(r.link)}">打开</a>`:''}</td></tr>`).join('');}
function renderStats(){const a=state.filtered,n=a.length||1,avg=x=>a.reduce((s,r)=>s+r[x],0)/n; const stats=[['商品数',a.length],['平均机会分',Math.round(avg('score'))],['周销量合计',fmt(a.reduce((s,r)=>s+r.weekly,0))],['平均跟卖',fmt(avg('followers'),1)]]; els.statsGrid.innerHTML=stats.map(s=>`<div class="stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join('');}
function categoryAgg(){const map=new Map(); for(const r of state.filtered){const k=r.category||'未分类'; if(!map.has(k)) map.set(k,{cat:k,count:0,score:0,weekly:0,followers:0,ad:0}); const o=map.get(k); o.count++; o.score+=r.score; o.weekly+=r.weekly; o.followers+=r.followers; o.ad+=r.adPct;} return [...map.values()].map(o=>({...o,avgScore:o.score/o.count,avgFollowers:o.followers/o.count,avgAd:o.ad/o.count})).sort((a,b)=>b.avgScore-a.avgScore||b.weekly-a.weekly).slice(0,15);}
function renderCategories(){const cats=categoryAgg(); if(!cats.length){els.categoryList.innerHTML='<p class="empty">暂无可统计数据。</p>';return;} const max=Math.max(...cats.map(c=>c.avgScore),1); els.categoryList.innerHTML=cats.map(c=>`<div class="cat-item"><div class="cat-line"><b title="${esc(c.cat)}">${esc(c.cat.split('/').slice(-2).join('/'))}</b><span>${Math.round(c.avgScore)}分</span></div><div class="cat-line"><span>${c.count}款 · 周销${fmt(c.weekly)}</span><span>跟卖${fmt(c.avgFollowers,1)}</span></div><div class="bar"><i style="width:${Math.round(c.avgScore/max*100)}%"></i></div></div>`).join('');}
function renderConclusion(){if(!state.filtered.length){els.conclusionBox.innerHTML='<p class="empty">暂无符合条件的数据。</p>';return;} const top=state.filtered.slice(0,5),cats=categoryAgg().slice(0,3); els.conclusionBox.innerHTML=`<p><b>优先看：</b>${cats.map(c=>esc(c.cat.split('/').slice(-1)[0])).join('、')||'暂无'}。</p><p><b>选品判断：</b>优先选择机会分 ≥ 70、周销量有起量、跟卖数较低、广告占比不高的商品。</p><p><b>当前 Top：</b>${top.map(r=>esc(r.title).slice(0,18)).join('；')}</p>`;}
function detailMetricHtml(r){
  const main = orderedCardFieldOptions().map(o=>{
    const val=o.val(r); const body=o.html?o.html(r):esc(val); const title=o.title?o.title(r):val;
    return `<div class="metric ${esc(o.key)}"><span>${o.label}</span><b title="${esc(title)}">${body}</b></div>`;
  }).join('');
  const extra = [
    `<div class="metric score"><span>机会分</span><b>${r.score}</b></div>`,
    `<div class="metric priceRub"><span>售价₽</span><b class="rub-price">${fmt(rubPrice(r))}</b></div>`,
    `<div class="metric originalRub"><span>原价₽</span><b>${fmtOriginalRub(r)?`<del>${fmtOriginalRub(r).replace('₽ ','')}</del>`:'-'}</b></div>`,
    `<div class="metric priceCny"><span>人民币¥</span><b>${fmt(cnyPrice(r),2)}</b></div>`
  ].join('');
  return main + extra;
}
window.showDetail=function(idx){
  const r=state.rows.find(x=>x.idx===idx); if(!r) return;
  els.modalContent.innerHTML=`<div class="detail detail-v2">
    <aside class="detail-media">
      <div class="pic">${r.image?`<img src="${esc(r.image)}">`:'<span class="no-img">无图片</span>'}</div>
      <div class="detail-score"><span>机会分</span><b>${r.score}</b></div>
      ${r.link?`<a class="detail-open" target="_blank" rel="noreferrer" href="${esc(r.link)}">打开 OZON 商品页</a>`:''}
    </aside>
    <section class="detail-main">
      <div class="detail-header">
        <h3>${esc(r.title)}</h3>
        <div class="detail-sub"><span>SKU：${esc(r.sku||'无')}</span><span>品牌：${esc(r.brand||'无品牌')}</span></div>
        <div class="detail-cat" title="${esc(r.category)}">${esc(r.category||'未分类')}</div>
        <div class="tags-line">${r.tags.map(t=>`<span class="pill ${t[1]}">${t[0]}</span>`).join('')}</div>
      </div>
      <div class="detail-price-card">
        <div><span>售价</span><b class="rub-price">${fmtRub(r)}</b>${fmtOriginalRub(r)?`<del>${fmtOriginalRub(r)}</del>`:''}</div>
        <div><span>人民币估算</span><b class="cny-price">${fmtCny(r)}</b></div>
      </div>
      <div class="detail-grid">${detailMetricHtml(r)}</div>
      <p class="reason"><b>分析：</b>需求强度 ${r.demand}/100，竞争友好度 ${r.comp}/100，自然流友好度 ${r.organic}/100。${r.risk?'存在明显风险项，建议重点核查价格战、品牌授权、物流尺寸或销量真实性。':'风险项较少，可进入二次核价、利润和合规检查。'}</p>
    </section>
  </div>`;
  els.modal.classList.remove('is-hidden');
};
function buildMappingUI(){els.mappingGrid.innerHTML=requiredFields.map(([key,label])=>`<div class="map-row"><label>${label}</label><select data-key="${key}"><option value="">不映射</option>${state.headers.map(h=>`<option value="${esc(h)}" ${state.map[key]===h?'selected':''}>${esc(h)}</option>`).join('')}</select></div>`).join(''); els.mappingPanel.classList.remove('is-hidden');}
function readMappingUI(){ $$('#mappingGrid select').forEach(s=>state.map[s.dataset.key]=s.value); }
function syncVisibleFieldsFromUI(){
  state.visibleFields = new Set($$('#cardFieldChecks input:checked').map(x=>x.value));
}
function syncCardFieldOrderFromUI(){
  state.cardFieldOrder = $$('#cardFieldChecks .check-item').map(x=>x.dataset.key).filter(Boolean);
}
function buildCardFieldUI(){
  els.cardFieldChecks.innerHTML=orderedCardFieldOptions().map(o=>`<label class="check-item" draggable="true" data-key="${o.key}"><span class="drag-handle" title="拖拽排序">☰</span><input type="checkbox" value="${o.key}" ${state.visibleFields.has(o.key)?'checked':''}><span>${o.label}</span></label>`).join('');
  let dragKey='';
  $$('#cardFieldChecks input').forEach(cb=>cb.addEventListener('change',()=>{syncVisibleFieldsFromUI(); renderCards();}));
  $$('#cardFieldChecks .check-item').forEach(item=>{
    item.addEventListener('dragstart',e=>{dragKey=item.dataset.key; item.classList.add('is-dragging'); e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',dragKey);});
    item.addEventListener('dragend',()=>{item.classList.remove('is-dragging'); $$('#cardFieldChecks .check-item').forEach(x=>x.classList.remove('is-over')); syncCardFieldOrderFromUI(); renderCards();});
    item.addEventListener('dragover',e=>{e.preventDefault(); const dragging=$('#cardFieldChecks .is-dragging'); if(!dragging||dragging===item) return; const rect=item.getBoundingClientRect(); const after=e.clientY>rect.top+rect.height/2; item.parentNode.insertBefore(dragging, after?item.nextSibling:item); item.classList.add('is-over');});
    item.addEventListener('dragleave',()=>item.classList.remove('is-over'));
    item.addEventListener('drop',e=>{e.preventDefault(); item.classList.remove('is-over'); syncCardFieldOrderFromUI(); renderCards();});
  });
}
async function handleFile(file){els.fileHint.textContent='正在解析：'+file.name; const ext=file.name.split('.').pop().toLowerCase(); try{let rows=[]; if(['csv','tsv'].includes(ext)||!window.XLSX){const txt=await file.text(); rows=parseDelimited(txt,ext==='tsv'?'\t':',');}else{const buf=await file.arrayBuffer(); const wb=XLSX.read(buf,{type:'array',cellDates:false}); const ws=wb.Sheets[wb.SheetNames[0]]; rows=XLSX.utils.sheet_to_json(ws,{defval:''});} if(!rows.length) throw new Error('表格为空'); state.raw=rows; state.headers=Object.keys(rows[0]); state.map=detectMap(state.headers); buildMappingUI(); normalizeRows(); $('#exportCsv').disabled=false; els.fileHint.textContent=`已导入 ${file.name}，共 ${rows.length.toLocaleString()} 行。`; }catch(e){console.error(e); els.fileHint.textContent='导入失败：'+e.message; alert('导入失败：'+e.message);}}
function parseDelimited(txt,sep=','){const lines=txt.replace(/^\ufeff/,'').split(/\r?\n/).filter(Boolean); if(!lines.length) return []; const parseLine=line=>{const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i]; if(ch==='"'){ if(q&&line[i+1]==='"'){cur+='"';i++;} else q=!q;} else if(ch===sep&&!q){out.push(cur);cur='';} else cur+=ch;} out.push(cur); return out;}; const headers=parseLine(lines[0]); return lines.slice(1).map(l=>{const cells=parseLine(l),o={}; headers.forEach((h,i)=>o[h]=cells[i]??''); return o;});}
function exportCsv(){if(!state.filtered.length) return; const headers=['机会分','标题','SKU','类目','品牌','是否有品牌','价格卢布','折算人民币','周销量','月销量','月销售额','跟卖数','广告占比','重量/g','创建天数','商品链接']; const lines=[headers,...state.filtered.map(r=>[r.score,r.title,r.sku,r.category,r.brand,r.hasBrand?'有品牌':'无品牌',rubPrice(r),cnyPrice(r),r.weekly,r.monthly,r.revenue,r.followers,r.adPct,r.weight,r.age,r.link])]; const csv=lines.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n'); const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ozon_selection_filtered.csv'; a.click(); URL.revokeObjectURL(a.href);}

function collectConsoleConfig(){
  const filters={};
  filterControlIds.forEach(id=>{ if(els[id]) filters[id]=els[id].value; });
  const mapping={...state.map};
  $$('#mappingGrid select').forEach(s=>{ mapping[s.dataset.key]=s.value; });
  return {
    app:'ozon_selection_workbench', version:'v5-defaultconfig', savedAt:new Date().toISOString(),
    exchangeRate: els.exchangeRate.value,
    sortBy: els.sortBy.value,
    view: state.view,
    preset: state.preset,
    filters,
    visibleFields:[...state.visibleFields],
    cardFieldOrder:[...state.cardFieldOrder],
    mapping
  };
}
function exportConsoleConfig(){
  const cfg=collectConsoleConfig();
  const blob=new Blob([JSON.stringify(cfg,null,2)],{type:'application/json;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ozon_console_config.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function applyConsoleConfig(cfg, sourceName='ozon_console_config.json'){
  if(!cfg || typeof cfg!=='object') throw new Error('配置文件格式不正确');
  if(cfg.exchangeRate!==undefined){ els.exchangeRate.value=cfg.exchangeRate; state.exchangeRate=cleanNum(cfg.exchangeRate)||0; }
  if(cfg.filters){ filterControlIds.forEach(id=>{ if(els[id] && cfg.filters[id]!==undefined) els[id].value=cfg.filters[id]; }); }
  if(Array.isArray(cfg.cardFieldOrder)){
    const valid=cfg.cardFieldOrder.filter(k=>cardFieldOptions.some(o=>o.key===k));
    const missing=defaultFieldOrder.filter(k=>!valid.includes(k));
    state.cardFieldOrder=[...valid,...missing];
  }
  if(Array.isArray(cfg.visibleFields)){ state.visibleFields=new Set(cfg.visibleFields.filter(k=>cardFieldOptions.some(o=>o.key===k))); }
  buildCardFieldUI();
  if(cfg.sortBy && els.sortBy.querySelector(`option[value="${CSS.escape(cfg.sortBy)}"]`)) els.sortBy.value=cfg.sortBy;
  if(cfg.view){
    state.view=cfg.view;
    $$('.view-btn').forEach(x=>x.classList.toggle('is-active',x.dataset.view===state.view));
    els.productGrid.classList.toggle('is-hidden',state.view!=='card');
    els.tableWrap.classList.toggle('is-hidden',state.view!=='table');
  }
  state.preset=cfg.preset||'';
  $$('.quick-tags button').forEach(b=>b.classList.toggle('is-active',b.dataset.preset===state.preset));
  if(cfg.mapping){
    state.map={...state.map,...cfg.mapping};
    $$('#mappingGrid select').forEach(s=>{ if(state.map[s.dataset.key]!==undefined) s.value=state.map[s.dataset.key]; });
    if(state.raw.length) normalizeRows(); else applyFilters();
  }else{
    applyFilters();
  }
  els.fileHint.textContent='已读取控制台配置：'+sourceName;
}
async function importConsoleConfig(file){
  try{
    const cfg=JSON.parse(await file.text());
    applyConsoleConfig(cfg, file.name);
  }catch(e){
    console.error(e);
    alert('读取配置失败：'+e.message);
  }finally{
    els.configInput.value='';
  }
}
async function autoLoadConsoleConfig(){
  // 先应用内置默认配置，确保双击 file:// 打开时也有默认控制台状态。
  applyConsoleConfig(DEFAULT_CONSOLE_CONFIG,'内置默认配置');
  try{
    const res=await fetch('ozon_console_config.json?ts='+Date.now(),{cache:'no-store'});
    if(!res.ok) return;
    const cfg=await res.json();
    applyConsoleConfig(cfg,'ozon_console_config.json');
  }catch(e){
    console.info('未自动读取同目录 ozon_console_config.json；如果是直接双击 file:// 打开，浏览器可能会限制自动读取本地 JSON，已使用内置默认配置。', e);
  }
}
function setPreset(p){state.preset=state.preset===p?'':p; $$('.quick-tags button').forEach(b=>b.classList.toggle('is-active',b.dataset.preset===state.preset)); applyFilters();}
function toggleSidebar(force){const mobile=matchMedia('(max-width:920px)').matches; if(mobile){document.body.classList.toggle('sidebar-open',force??!document.body.classList.contains('sidebar-open'));} else{document.body.classList.toggle('sidebar-collapsed',force??!document.body.classList.contains('sidebar-collapsed'));}}
function resetAll(){state.preset=''; ['keyword','categoryFilter','sellerFilter','brandFilter','minFollowers','maxAdPct','maxWeight','maxAdDays','minConv','maxConv','minImpressions','minDisplayConv','minClicks','minSearchViews','maxAge','turnoverFilter','minFollowerPrice','maxFollowerPrice','minRating','minReviews','maxLength','maxWidth','maxHeight'].forEach(id=>els[id].value=''); els.minScore.value=0; els.minWeekly.value=0; $$('.quick-tags button').forEach(b=>b.classList.remove('is-active')); applyFilters();}

buildCardFieldUI();
autoLoadConsoleConfig();
els.fileInput.addEventListener('change',e=>{const f=e.target.files[0]; if(f) handleFile(f);});
$('#importConfig').addEventListener('click',()=>els.configInput.click());
els.configInput.addEventListener('change',e=>{const f=e.target.files[0]; if(f) importConsoleConfig(f);});
$('#exportConfig').addEventListener('click',exportConsoleConfig);
['dragenter','dragover'].forEach(ev=>els.uploadBox.addEventListener(ev,e=>{e.preventDefault(); els.uploadBox.classList.add('is-dragover');}));
['dragleave','drop'].forEach(ev=>els.uploadBox.addEventListener(ev,e=>{e.preventDefault(); els.uploadBox.classList.remove('is-dragover');}));
els.uploadBox.addEventListener('drop',e=>{const f=e.dataTransfer.files&&e.dataTransfer.files[0]; if(f) handleFile(f);});
filterControlIds.forEach(id=>els[id].addEventListener('input',applyFilters));
els.exchangeRate.addEventListener('input',()=>{state.exchangeRate=cleanNum(els.exchangeRate.value)||0; renderCards(); renderTable();});
els.sortBy.addEventListener('change',()=>{sortRows(); renderCards(); renderTable();});
$('#applyMapping').addEventListener('click',()=>{readMappingUI(); normalizeRows();});
$('#toggleMapping').addEventListener('click',()=>$('#mappingGrid').classList.toggle('is-hidden'));
$('#exportCsv').addEventListener('click',exportCsv); $('#resetAll').addEventListener('click',resetAll);
$$('.quick-tags button').forEach(b=>b.addEventListener('click',()=>setPreset(b.dataset.preset)));
$$('.view-btn').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view; $$('.view-btn').forEach(x=>x.classList.toggle('is-active',x===b)); els.productGrid.classList.toggle('is-hidden',state.view!=='card'); els.tableWrap.classList.toggle('is-hidden',state.view!=='table');}));
$('#openSidebar').addEventListener('click',()=>toggleSidebar()); $('#mobileMask').addEventListener('click',()=>toggleSidebar(false)); $('#modalClose').addEventListener('click',()=>els.modal.classList.add('is-hidden'));
els.modal.addEventListener('click',e=>{if(e.target===els.modal) els.modal.classList.add('is-hidden');}); window.addEventListener('resize',()=>{if(!matchMedia('(max-width:920px)').matches) document.body.classList.remove('sidebar-open');});
