/* Pure state rules shared by GAS and local preview. */
const Engine=(()=>{
 const defaults={dailyLimit:6,rewardCoins:30,seedChance:.35,growthHours:24,harvestCount:3,treasureChance:.1};
 const legacyBoard=Array.from({length:12},(_,i)=>[{label:'ひと休み',effect:'rest',value:0},{label:'コインを拾う',effect:'coins',value:10},{label:'今日の宝探し運アップ',effect:'treasure',value:.1},{label:'今日の経験値アップ',effect:'xp',value:1.1},{label:'種を見つけた',effect:'seed',value:1},{label:'コインを拾う',effect:'coins',value:15}][i%6]);
 const recipes=[
  {id:'recipe_meat_potato',name:'肉じゃが',needs:{crop_potato:1,crop_carrot:1,crop_onion:1,material_meat:1},output:'dish_meat_potato'},
  {id:'recipe_curry_rice',name:'カレーライス',needs:{crop_potato:1,crop_carrot:1,crop_onion:1,material_meat:1},output:'dish_curry_rice'},
  {id:'recipe_vegetable_salad',name:'野菜サラダ',needs:{crop_tomato:1,crop_lettuce:1,crop_cabbage:1},output:'dish_vegetable_salad'},
  {id:'recipe_colorful_salad',name:'カラフルサラダ',needs:{crop_tomato:1,crop_corn:1,crop_carrot:1,crop_lettuce:1},output:'dish_colorful_salad'},
  {id:'recipe_spinach_saute',name:'緑のいためもの',needs:{crop_spinach:1,crop_pepper:1,crop_onion:1},output:'dish_spinach_saute'},
  {id:'recipe_pumpkin_soup',name:'かぼちゃスープ',needs:{crop_pumpkin:1,crop_onion:1,crop_corn:1},output:'dish_pumpkin_soup'},
  {id:'recipe_corn_soup',name:'コーンスープ',needs:{crop_corn:1,crop_onion:1},output:'dish_corn_soup'},
  {id:'recipe_root_soup',name:'根菜スープ',needs:{crop_radish:1,crop_leek:1,crop_carrot:1},output:'dish_root_soup'},
  {id:'recipe_cabbage_roll',name:'ロールキャベツ',needs:{crop_cabbage:1,crop_onion:1,material_meat:1},output:'dish_cabbage_roll'},
  {id:'recipe_roast_vegetables',name:'ごろごろ野菜焼き',needs:{crop_pumpkin:1,crop_potato:1,crop_carrot:1},output:'dish_roast_vegetables'},
  {id:'recipe_imoimo_paradise',name:'いもいもパラダイス',needs:{crop_potato:1,crop_sweetpotato:1},output:'dish_imoimo_paradise'},
  {id:'recipe_potato_salad',name:'ポテトサラダ',needs:{crop_potato:1,crop_carrot:1,crop_lettuce:1},output:'dish_potato_salad'},
  {id:'recipe_vegetable_juice',name:'野菜ジュース',needs:{crop_tomato:1,crop_carrot:1,crop_cabbage:1},output:'dish_vegetable_juice'},
  {id:'recipe_vegetable_stew',name:'野菜ごろごろスープ',needs:{crop_radish:1,crop_cabbage:1,crop_carrot:1,crop_onion:1},output:'dish_vegetable_stew'},
  {id:'recipe_autumn_stew',name:'秋色シチュー',needs:{crop_sweetpotato:1,crop_pumpkin:1,crop_corn:1},output:'dish_autumn_stew'},
  {id:'recipe_leafy_stirfry',name:'葉っぱ山盛りいため',needs:{crop_spinach:1,crop_cabbage:1,crop_pepper:1},output:'dish_leafy_stirfry'},
  {id:'recipe_peach_failure',name:'ももは混ぜるのに向いていない？',needs:{crop_peach:1},output:'failed_peach_mix',message:'ももは混ぜるのに、向いていないのかも…？'}
 ];
 const sellPrices={crop:10,crop_tomato:10,crop_pumpkin:10,crop_corn:10,crop_spinach:10,crop_pepper:10,crop_cabbage:10,crop_lettuce:10,crop_radish:10,crop_leek:10,crop_potato:10,crop_onion:10,crop_sweetpotato:10,crop_carrot:10,crop_peach:20,crop_copper_fruit:200,crop_silver_fruit:500,crop_gold_fruit:1000};
 const furniture=[
  {id:'simple_desk',name:'シンプルな机',price:80,width:2,height:1},
  {id:'simple_chair',name:'シンプルなイス',price:50,width:1,height:1},
  {id:'simple_tv',name:'シンプルなテレビ',price:120,width:2,height:1},
  {id:'simple_cushion',name:'シンプルなクッション',price:30,width:1,height:1}
 ];
 const otomoDefs=[
  {id:'cow',name:'モウ',kind:'うし',price:100,asset:'cow',favorites:['crop_corn','crop_cabbage']},
  {id:'pig',name:'ブー',kind:'ぶた',price:110,asset:'pig',favorites:['crop_potato','crop_sweetpotato']},
  {id:'rabbit',name:'ミミ',kind:'うさぎ',price:120,asset:'rabbit',favorites:['crop_cabbage','crop_carrot']},
  {id:'mouse',name:'チュー',kind:'ねずみ',price:100,asset:'mouse',favorites:['crop_tomato','crop_pumpkin']},
  {id:'sugar',name:'さとうくん',kind:'角砂糖のふしぎな子',price:150,asset:'sugar',favorites:['dish_']}
 ];
 const seedDefs=[['red','赤',['tomato']],['yellow','黄',['pumpkin','corn']],['blue','青',['spinach','pepper']],['green','緑',['cabbage','lettuce']],['white','白',['radish','leek']],['brown','茶',['potato','onion']],['purple','紫',['sweetpotato']],['orange','橙',['carrot']],['pink','桃',['peach']],['black','黒',[]],['gold','金',['gold_fruit']],['silver','銀',['silver_fruit']],['copper','銅',['copper_fruit']]].map(([id,name,crops])=>({id:'seed_'+id,name:name+'の種',crops:crops.map(x=>'crop_'+x)}));
 seedDefs[9].crops=seedDefs.slice(0,9).flatMap(x=>x.crops);
 const seedCount=s=>seedDefs.reduce((n,x)=>n+(s.items[x.id]||0),0);
 function giveSeed(s,random,qty=1){const def=seedDefs[Math.floor(random()*10)];s.items[def.id]=(s.items[def.id]||0)+qty;return def;}
 const fortunes=['今日の運勢は大吉！','すてきな発見がありそう！','今日は笑顔がいっぱい！','好きなことを楽しめそう！','だれかと仲良くなれる予感！','小さな幸せが見つかりそう！'];
 function expandBoard(cells){if(cells.length!==12||cells.filter(c=>c.effect!=='rest').length!==10)return cells;const special=cells.filter(c=>c.effect!=='rest');return Array.from({length:40},(_,i)=>i%4===1?{...special[Math.floor(i/4)]}:{label:fortunes[i%fortunes.length],effect:'rest',value:0});}
 const board=expandBoard(legacyBoard);
 const day=t=>new Date(t+32400000).toISOString().slice(0,10);
 function upgrade(raw,now){
  const s=JSON.parse(JSON.stringify(raw||{})),hadXP=Number.isFinite(s.xp);
  s.version=4;s.unlocked=Array.isArray(s.unlocked)?s.unlocked:[];
  for(const k of ['coins','seeds','crops','development','totalQuests','xp'])s[k]=Number.isFinite(s[k])?Math.max(0,s[k]):0;
  s.items=s.items&&typeof s.items==='object'?s.items:{};
  for(const [id,qty] of Object.entries(s.items))s.items[id]=Number.isInteger(qty)?Math.max(0,qty):0;
  const legacy=Math.floor(s.seeds||0)+(s.items.seed||0);if(legacy)s.items.seed_red=(s.items.seed_red||0)+legacy;delete s.seeds;delete s.items.seed;
  if(s.otomo&&typeof s.otomo==='object'){const def=otomoDefs.find(x=>x.id===s.otomo.id)||otomoDefs[0];s.otomo={id:def.id,name:def.name,asset:def.asset,kind:def.kind,stats:Object.fromEntries(['looks','shine','friendship','health','freedom'].map(k=>[k,Math.max(0,Math.min(100,Number(s.otomo.stats?.[k])||25))])),careDate:String(s.otomo.careDate||''),awards:Array.isArray(s.otomo.awards)?s.otomo.awards:[],badge:s.otomo.badge||null};}else s.otomo=null;
  s.otomoContest=s.otomoContest&&typeof s.otomoContest==='object'?s.otomoContest:null;
  if(!hadXP)s.xp=s.totalQuests*10;s.level=1+Math.floor(s.xp/50);
  s.farm=Array.from({length:6},(_,i)=>s.farm?.[i]||null);
  const today=day(now);s.daily=s.daily?.date===today?s.daily:{date:today,count:0};
  if(s.questDay!==today){s.questDay=today;s.active=null;}
  s.treasures=Number.isFinite(s.treasures)?s.treasures:0;
  const position=Number.isInteger(s.sugoroku?.position)?s.sugoroku.position:0;
  const laps=Number.isInteger(s.sugoroku?.laps)?Math.max(0,s.sugoroku.laps):0;
  s.sugoroku=s.sugoroku?.date===day(now)?s.sugoroku:{date:day(now),position,laps,count:0,xp:1,treasure:0,receipts:[]};s.sugoroku.laps=laps;
  if(s.active&&!s.active.bankVersion)s.active=null;
  // New chapter data replaces the early trial scenes once, so everyone sees the new opening.
  if(Number(s.storyVersion||0)<3){s.storySeen=[];s.storyVersion=3;}else{s.storySeen=Array.isArray(s.storySeen)?s.storySeen:[];}
  s.failedQuests=Number.isInteger(s.failedQuests)?Math.max(0,s.failedQuests):0;
  s.receipts=Array.isArray(s.receipts)?s.receipts:[];return s;
 }
 function start(s,unit,bank,id,now,random){
  const daily=unit==='daily';if(!daily&&!bank.units.some(u=>u.id===unit))throw Error('この単元は今は選べません。');
  if(s.active&&(daily||bank.units.some(u=>u.id===s.active.course)))return s.active;
  const pool=daily?bank.questions:bank.questions.filter(q=>q.unit===unit);if(!pool.length)throw Error('出題できる問題がありません。');
  const shuffled=pool.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  s.active={id,course:daily?'daily':unit,startedAt:now,bankVersion:5,questions:shuffled.slice(0,5)};return s.active;
 }
 const norm=v=>String(v??'').normalize('NFKC').replace(/\s/g,'').trim();
 function numeric(v){const s=norm(v);if(!/^-?\d+(?:\.\d+)?(?:\/-?\d+(?:\.\d+)?)?$/.test(s))return NaN;const a=s.split('/').map(Number);return a.length===2?(a[1]===0?NaN:a[0]/a[1]):a[0];}
 function correct(q,v){return q.type==='number'?Number.isFinite(numeric(v))&&Math.abs(numeric(v)-numeric(q.answer))<1e-9:norm(v)===norm(q.answer);}
 function finish(s,id,answers,now,cfg,random){
  const old=s.receipts.find(r=>r.id===id);if(old)return old;
  if(!s.active||s.active.id!==id)throw Error('途中の依頼を開き直してください。');
  if(!Array.isArray(answers)||answers.length!==s.active.questions.length||answers.some((a,i)=>!correct(s.active.questions[i],a)))throw Error('すべての問題を解いてから報告してください。');
  if(s.daily.date!==day(now))s.daily={date:day(now),count:0};
  const paid=true;
  const r={id,paid,coins:Math.max(1,cfg.rewardCoins||30),seeds:paid&&(s.daily.count===0||random()<cfg.seedChance)?1:0,development:paid?1:0};
  const bonus=s.sugoroku?.date===day(now)?s.sugoroku:{xp:1,treasure:0};
  r.treasures=paid&&random()<Math.min(1,(cfg.treasureChance??.1)+bonus.treasure)?1:0;
  if(paid){s.daily.count++;s.coins+=r.coins;if(r.seeds){const seed=giveSeed(s,random,r.seeds);r.seedId=seed.id;r.seedName=seed.name;}s.treasures=(s.treasures||0)+r.treasures;s.development++;s.xp+=Math.round(10*bonus.xp);}
  s.level=1+Math.floor(s.xp/50);s.totalQuests++;s.active=null;s.receipts.push(r);s.receipts=s.receipts.slice(-30);return r;
 }
 function fail(s,id){
  if(!s.active||s.active.id!==id)throw Error('途中の依頼を開き直してください。');
  s.active=null;s.failedQuests=(s.failedQuests||0)+1;
  return{id,failed:true};
 }
 function craft(s,id){
  const recipe=recipes.find(r=>r.id===id);if(!recipe)throw Error('その調合は見つかりません。');
  for(const [item,qty] of Object.entries(recipe.needs))if((s.items[item]||0)<qty)throw Error('材料が足りません。');
  for(const [item,qty] of Object.entries(recipe.needs))s.items[item]-=qty;
  s.items[recipe.output]=(s.items[recipe.output]||0)+1;
  return{recipeId:recipe.id,name:recipe.name,output:recipe.output,message:recipe.message||''};
 }
 function sell(s,item,quantity){
  const price=sellPrices[item];if(!price)throw Error('これはここでは売れません。');
  const qty=Math.max(1,Math.floor(Number(quantity)||0)),stock=item==='crop'?s.crops:(s.items[item]||0);
  if(stock<qty)throw Error('売る数が足りません。');
  if(item==='crop')s.crops-=qty;else s.items[item]-=qty;
  const coins=price*qty;s.coins+=coins;return{item,quantity:qty,coins};
 }
 function buyFurniture(s,id){
  const item=furniture.find(x=>x.id===id);if(!item)throw Error('その家具は売り切れです。');
  if(s.coins<item.price)throw Error('コインが足りません。');
  s.coins-=item.price;s.items[id]=(s.items[id]||0)+1;return{...item,quantity:s.items[id]};
 }
 function buyOtomo(s,id){const def=otomoDefs.find(x=>x.id===id);if(!def)throw Error('そのオトモは見つかりません。');if(s.otomo)throw Error('いま一緒に暮らしているオトモを大切にしてね。');if(s.coins<def.price)throw Error('コインが足りません。');s.coins-=def.price;s.otomo={id:def.id,name:def.name,asset:def.asset,kind:def.kind,stats:{looks:25,shine:25,friendship:25,health:25,freedom:25},careDate:'',awards:[],badge:null};return s.otomo;}
 function careOtomo(s,now,random=Math.random){if(!s.otomo)throw Error('まずはオトモを迎えてね。');const today=day(now);if(s.otomo.careDate===today)throw Error('今日のお世話はもう終わったよ。');const keys=['looks','shine','friendship','health','freedom'],key=keys[Math.floor(random()*keys.length)],up=5+Math.floor(random()*4);s.otomo.stats[key]=Math.min(100,s.otomo.stats[key]+up);s.otomo.careDate=today;return{key,up,value:s.otomo.stats[key]};}
 function feedOtomo(s,item){if(!s.otomo||(s.items[item]||0)<1)throw Error('あげられる食べ物を選んでね。');const def=otomoDefs.find(x=>x.id===s.otomo.id),favorite=def.favorites.some(x=>x.endsWith('_')?item.startsWith(x):item===x),a=s.otomo.stats;s.items[item]--;if(favorite){a.shine=Math.min(100,a.shine+10);a.friendship=Math.min(100,a.friendship+5);a.freedom=Math.max(0,a.freedom-3);return{favorite:true,up:['ツヤ +10','なかよし度 +5'],down:'のびのび度 -3'};}a.friendship=Math.min(100,a.friendship+5);a.health=Math.min(100,a.health+4);a.looks=Math.max(0,a.looks-2);return{favorite:false,up:['なかよし度 +5','健康度 +4'],down:'見た目 -2'};}
 function contestResult(s,correctAnswer){if(!s.otomo)throw Error('まずはオトモを迎えてね。');const avg=Math.round(Object.values(s.otomo.stats).reduce((a,b)=>a+b,0)/5),bonus=correctAnswer?20:0,score=avg+bonus;let prize='参加賞',coins=10,rank=0;if(score>=100){prize='金賞';coins=120;rank=3;}else if(score>=75){prize='銀賞';coins=70;rank=2;}else if(score>=50){prize='銅賞';coins=35;rank=1;}const old=s.otomo.badge?.rank||0;if(rank&&old>=rank)coins=0;else if(rank)s.otomo.badge={prize,rank};s.coins+=coins;s.otomo.awards.push({prize,score,at:Date.now()});s.otomo.awards=s.otomo.awards.slice(-20);for(const key of Object.keys(s.otomo.stats))s.otomo.stats[key]=Math.min(100,s.otomo.stats[key]+(correctAnswer?2:1));return{prize,coins,score,bonus,correct:correctAnswer,otomo:s.otomo};}
 function farm(s,op,index,plantId,now,cfg,seedId,random=Math.random){
  if(!Number.isInteger(index)||index<0||index>=6)throw Error('畑を選び直してください。');
  const p=s.farm[index];
  if(op==='plantSeed'){if(p)throw Error('この畑は使用中です。');const seed=seedDefs.find(x=>x.id===seedId);if(!seed||(s.items[seedId]||0)<1)throw Error('色付きの種を選んでください。');s.items[seedId]--;s.farm[index]={plantedAt:now,id:plantId,seedId,cropId:seed.crops[Math.floor(random()*seed.crops.length)]};}
  else{if(!p||String(p.id||p.plantedAt)!==plantId)throw Error('畑を開き直してください。');if(now-p.plantedAt<cfg.growthHours*10800000)throw Error('まだ育っています。');s.farm[index]=null;const crop=p.cropId||'crop_tomato';s.items[crop]=(s.items[crop]||0)+cfg.harvestCount;}
 }
 function roll(s,id,now,random,cells=board){
  if(typeof id!=='string'||!/^[a-zA-Z0-9-]{10,80}$/.test(id))throw Error('もう一度すごろくを開いてください。');
  if(s.sugoroku.date!==day(now))s.sugoroku={date:day(now),position:s.sugoroku.position,laps:s.sugoroku.laps||0,count:0,xp:1,treasure:0,receipts:[]};
  const g=s.sugoroku,old=g.receipts.find(r=>r.id===id);if(old)return old;
  if(g.count>=3)throw Error('今日のサイコロはおしまい。また明日！');
  const dice=1+Math.floor(random()*6),next=g.position+dice;g.laps=(g.laps||0)+Math.floor(next/cells.length);g.position=next%cells.length;g.count++;
  const cell=cells[g.position];if(cell.effect==='coins')s.coins+=cell.value;let seed;if(cell.effect==='seed')seed=giveSeed(s,random,cell.value);
  if(cell.effect==='xp')g.xp=Math.max(g.xp,cell.value);if(cell.effect==='treasure')g.treasure=Math.max(g.treasure,cell.value);
  const result={id,dice,position:g.position,label:seed?seed.name+'を見つけた！':cell.label,effect:cell.effect};g.receipts.push(result);return result;
 }
 return{seedDefs,seedCount,defaults,recipes,furniture,otomoDefs,sellPrices,board,expandBoard,day,upgrade,start,correct,numeric,finish,fail,craft,sell,buyFurniture,buyOtomo,careOtomo,feedOtomo,contestResult,farm,roll};
})();

const STORY_SEED={
 npcs:[['farmer','田んぼのおじいさん','田んぼのお世話係'],['avatar','イト','仕立て屋'],['companion','ムギ','オトモのお世話係'],['furniture','ダイチ','家具職人'],['gacha','ルリ','宝物集めが好きな店番'],['trade','ミノリ','交易所の店番'],['alchemy','シオン','錬金術師'],['guide','アカリ','集会所の案内人'],['cat','ハル','猫を探している町の子'],['gardener','ソウ','庭の手入れをするおじいさん'],['cook','コムギ','町の料理人'],['post','フミ','手紙を届ける配達人'],['research','リツ','町の記録を調べる研究家']],
 quests:[
 ['read','cat','迷子のミケを探して','ミケがいなくなっちゃった。目撃した場所のメモを、一緒に読んでくれる？','メモの道をたどったら、ミケがいたよ。ありがとう！'],
 ['write','post','かすれた手紙','雨で手紙の文字が消えてしまったんだ。読めるように書き直すのを手伝って。','文字が戻ったね。これなら大切な手紙を届けられるよ。'],
 ['grammar','research','だれが何をしたの？','町の古い記録がばらばらなんだ。だれが何をしたのか、一緒に整理しよう。','できごとのつながりが見えてきた。君の記憶の手がかりも、きっとある。'],
 ['honor','post','大切なお客さまへ','遠くから来るお客さまに、失礼のない案内を書きたいんだ。言葉選びを手伝って。','やさしい気持ちの伝わる案内になったよ。'],
 ['multiply','gardener','草刈り大作戦','広場の草が伸びてしまってね。必要な道具を計算して、手際よく準備しよう。','準備ができた！これで広場をきれいにできるよ。'],
 ['divide','cook','みんなで分けるスープ','お腹をすかせた人が待っているの。材料を同じ量ずつ分ける計算をお願い。','ぴったり分けられたね。みんなに温かいスープを届けよう。'],
 ['fraction','cook','思い出のパン','古いレシピが見つかったの。粉の量を合わせて、ふわふわのパンを作ろう。','焼けたよ！この香り、どこか懐かしくない？'],
 ['volume','gardener','新しい花壇の土','花壇の箱に土を入れたいんだ。どれだけ必要か調べてくれるかい？','ぴったりの土がそろったね。春には花でいっぱいになるよ。'],
 ['average','research','町の天気を調べよう','畑のために雨の記録を調べているんだ。平均を出すのを手伝ってほしい。','記録を比べやすくなった。町のみんなに知らせよう。'],
 ['percent','cat','お祭りのお買い物','お祭りの準備を頼まれたんだ。割引の札を見ながら、買い物の計算を手伝って！','準備できたよ。お祭り、君も一緒に行こうね。']
 ],
 scenes:[
 {id:'prologue-01',chapter:'プロローグ',required:0,shops:0,lines:[['narrator','・・・・・・。'],['narrator','ブクブクブク・・・・・・。'],['narrator','暗いところにいるみたいだ。目を開けても、何も見えない。'],['narrator','なんだか体がフワフワしている。足が地面についていないみたいで、こわい。'],['narrator','息をしようとすると、胸の奥がきゅっと苦しくなった。'],['narrator','遠くで、だれかの声がした。'],['narrator','「だいじょうぶ？　しっかりして！」'],['narrator','その声に手を伸ばした瞬間、まぶしい光が広がった。']]},
 {id:'ch1-01',chapter:'第一章　ノースタウン',required:0,shops:0,lines:[['guide','よかった！　気がついたんだね。ずっと大きな木のそばで眠っていたから、心配したよ。'],['hero','ここは…？　いったい…？'],['guide','ここ？　ここはノースタウン。森に囲まれた、小さな町だよ。'],['hero','ノースタウン……。でも、ここがどこなのか、どうして来たのか、思い出せない。'],['guide','大きな木のそばで眠っていたの。覚えてる？'],['hero','覚えていない…。名前だけは……分かる。'],['guide','そっか。混乱で記憶喪失になっちゃってるのかな？　無理に思い出そうとしなくていいからね。'],['guide','記憶を取り戻すまで、この町にいようよ。{{名前}}が困っているなら、わたしも一緒に考える。'],['guide','あ、そうだ！　集会所にはみんなの依頼が届くの。困っている人を手伝っていたら、記憶の手がかりも見つかるかもしれないよ。'],['hero','……うん。何もしないでいるより、できることを探してみたい。'],['guide','その意気だよ。まずは町を歩いてみよう。ノースタウンのみんな、きっと{{名前}}を歓迎してくれるよ。']]},
 {id:'ch1-02',chapter:'第一章　最初の記憶',required:0,shops:1,lines:[['narrator','新しいお店の扉が開いた瞬間、頭の中に景色が浮かんできた。'],['narrator','白い壁。黒板。机に置かれた、使いこんだ筆箱。'],['hero','……思い出した。{{一人称}}、小学生だった。'],['guide','本当に？　どんなところが見えたの？'],['hero','教室。みんながいて、先生がいて……。ランドセルもあった。'],['guide','じゃあ、{{名前}}には帰る場所があるのかもしれないね。'],['hero','でも、学校の名前も、友だちの顔も、まだぼんやりしてる。思い出せそうなのに、届かない。'],['guide','急がなくて大丈夫。一つ思い出せたんだから、次もきっと見つかるよ。'],['hero','うん。さっきより少しだけ、前に進めた気がする。']]},
 {id:'ch1-03',chapter:'第一章　教室の窓',required:0,shops:2,lines:[['narrator','新しいお店の扉が開いた瞬間、頭の中に景色が浮かんできた。'],['narrator','窓から入る風。黒板に書かれた文字。先生の声が、教室いっぱいに響いている。'],['hero','黒板……先生の声……。{{一人称}}、さっきまで授業を受けていたはずなのに……？'],['guide','授業中だったのに、ここへ来たの？　それは不思議だね。'],['hero','時計も見えた。休み時間じゃなかった。たしか、みんなで外に出る準備をしていて……。'],['guide','思い出せないところは、あとからつながるかもしれないよ。{{名前}}が見たもの、忘れないうちに教えて。'],['hero','うん。でも、どうしてノースタウンにいるのか、そこだけが思い出せない。'],['guide','あせらなくて大丈夫。次の手がかりも、きっと町のどこかで待っているよ。']]},
 {id:'ch1-04',chapter:'第一章　水の向こう側',required:0,shops:3,lines:[['narrator','新しいお店の扉が開いた瞬間、頭の中に景色が浮かんできた。'],['narrator','すると突然、冷たい水の感触が、急に背中を走った。'],['hero','池だ……。授業中に、池に落っこちたんだ！'],['guide','池に？'],['hero','水の中で、遠くに光が見えたんだ。その光を追っていったら…。'],['hero','その先は、まだ霧がかかったみたいで見えない。でも、こわかったことだけは覚えてる。'],['guide','大丈夫。ノースタウンで少しずつ探していこう。{{名前}}が一人で抱えなくていいんだよ。'],['hero','うん。これが、記憶を取り戻す旅の始まりなんだね。']]},
 {id:'ch1-05',chapter:'第一章　なかよし池',required:0,shops:4,lines:[['narrator','新しいお店の扉が開いた瞬間、頭の中に景色が浮かんできた。'],['narrator','白衣を着た先生。手には観察用のノート。校庭の端にある、なかよし池。'],['hero','理科の授業だ……。先生とみんなで、池の生きものを観察してた。'],['hero','{{一人称}}は池をのぞきこんでいた。水の下に、何か光るものが見えたんだ。'],['guide','光るもの？　それが、ノースタウンへ来た光と同じなのかな。'],['hero','分からない。でも、もっとよく見ようと顔を近づけたとき……誰かに押されたような気がする。'],['guide','だれが押したの？'],['hero','そこだけ覚えていない。わざとだったのか、ぶつかっただけだったのかも、まだ分からない。'],['guide','思い出せないことを、無理に決めつけなくていいよ。{{名前}}が見た光のこと、もう少し知りたいね。'],['hero','うん。池の水が、あのときだけ星みたいにきらきらしていた。']]},
 {id:'ch1-06',chapter:'第一章　菊地くん',required:0,shops:5,lines:[['narrator','新しいお店の扉が開いた瞬間、頭の中に景色が浮かんできた。'],['narrator','同じ班の子が、池のほうへ走ってくる。少し息を切らして、こちらを見ている。'],['hero','菊地くん……。同じ班だった菊地くんのことを思い出した。'],['hero','{{一人称}}が「池に光るものがある」って言ったら、菊地くんが見ようとして、こっちに走ってきたんだ。'],['guide','それで、ぶつかったの？'],['hero','うん。菊地くんも止まろうとしていた。でも間に合わなくて、そのまま{{一人称}}にぶつかっちゃって……。'],['hero','{{一人称}}はバランスをくずして、池に落っこちたんだった。誰かに押されたんじゃなかった。'],['guide','そっか。菊地くんも、きっとびっくりしただろうね。'],['hero','うん。わざとじゃないって分かる。菊地くん、あのあとどうしたかな。心配してるかな。'],['guide','{{名前}}が帰れる方法を見つけたら、ちゃんと会えるよ。あと少しだけ、一緒に手がかりを探そう。']]},
 {id:'ch1-07',chapter:'第一章　思い出したこと',required:0,shops:6,lines:[['narrator','新しいお店の扉が開いた瞬間、頭の中に景色が浮かんできた。'],['narrator','校門。教室。なかよし池。笑っている友だちと、白衣の先生。ばらばらだった景色が、一つにつながった。'],['hero','全部思い出した。{{一人称}}は……{{学年}}年{{組}}組{{番号}}番。北小に通っていた。'],['hero','でも今はノースタウンにいる。ここでの生活も楽しいけれど、やっぱり友だちや先生に会いたい。'],['hero','どうやったら、戻れるのかな。'],['guide','ねぇ、全部思い出したんだったら、せっかくだしここでもっと過ごすことにしたらどう？　きっと楽しいよ？'],['choice','ここでずっと過ごすことにする|それでも戻る方法を考える'],['hero','{{一人称}}は……ここを……'],['blackout','突然、頭がズキンと痛んだ。'],['hero','うっ……。'],['guide','{{名前}}！　大丈夫！？'],['hero','だい……じょ……。'],['narrator','………………。'],['narrator','そのまま{{一人称}}は、倒れこんでしまった。']]}
 ]
};

/* 追加NPC10人と依頼50件。依頼列: 単元ID/NPC/依頼名/依頼の会話/達成の会話/報酬/クエストID */
const QUEST_REWARD='30コイン＋発展ポイント1＋色の種（抽選）';
const QUEST_NPCS=[
 ['librarian','ユズ','図書館で町の本を守る司書'],['fisher','ナギ','川と池を見回る釣り好き'],
 ['baker','パンナ','朝早くからパンを焼く職人'],['carpenter','レン','町の建物を直す大工'],
 ['florist','ハナ','花壇と花屋を手伝う子'],['doctor','ミコト','薬草に詳しい町のお医者さん'],
 ['musician','オト','町を旅する楽器弾き'],['weaver','キヌ','布と糸を扱う織物職人'],
 ['watchman','トウマ','夜道を見回る町の番人'],['scholar','スイ','不思議なものを調べる学者見習い']
];
const QUEST_MORE={
 read:[
  ['librarian','古い案内板を読もう','昔の言葉で書かれた案内板が見つかったの。読めるところから、一緒に確かめてくれる？','道の名前が全部分かったよ。これで古い地図も使えそう。'],
  ['librarian','図書館のしおり','返ってきた本から、知らない人のしおりが出てきたの。書かれた文を読んで、持ち主を探そう。','持ち主が見つかったよ。大切なしおりだったんだって。'],
  ['watchman','森の注意書き','森の入口の札が読みにくくなっているんだ。危ない場所がどこか、文から見つけてほしい。','危ない場所が分かった。新しい札を立てておくよ。'],
  ['doctor','薬草図鑑をひらいて','よく似た葉っぱが二つあるの。図鑑の説明を読んで、薬草のほうを選んでくれる？','正しい薬草を選べたね。これなら安心して薬を作れるよ。'],
  ['musician','お祭りのちらし','演奏する時間がちらしのどこかに書いてあるんだ。見つけるのを手伝って！','時間に間に合いそうだよ。いちばん前で聴いてね！']],
 write:[
  ['carpenter','新しいお店の看板','新しい看板に店の名前を書きたいんだ。読みやすい字になるよう、手伝ってくれないか？','立派な看板になったな。遠くからでもよく見えるよ。'],
  ['florist','花束にそえる手紙','花束に短い手紙をそえたいの。気持ちが伝わる字を、一緒に書いてほしいな。','とてもきれいに書けたね。花束を渡すのが楽しみ！'],
  ['companion','品評会の名札','オトモ品評会で使う名札が足りないの。名前をていねいに書いてくれる？','みんなの名札がそろったよ。これで品評会を始められるね。'],
  ['librarian','図書館カード作り','新しい貸出カードを作っているの。見本どおりに漢字を書いてみよう。','カードが完成したよ。本を借りる人も喜ぶね。'],
  ['watchman','町の掲示板','夜の見回り時間を掲示板に書きたい。まちがえないように清書してくれ。','読みやすい掲示になった。町のみんなにも伝わるよ。']],
 grammar:[
  ['scholar','おかしな日記','古い日記の文が入れ替わって、意味が分からなくなったの。言葉の順番を直してみよう。','ちゃんと読める日記に戻った！書いた人の気持ちも分かるね。'],
  ['fisher','主語を探せ','釣りの記録を書いたんだけど、だれのことか分からない文があるんだ。直してくれる？','だれが釣った魚か、はっきり分かるようになったよ。'],
  ['musician','ことばの迷路','歌の文がごちゃごちゃになっちゃった。主語と述語をつないで、元の歌に戻して！','歌が元どおりになった！町のみんなにも聞かせてくるよ。'],
  ['post','配達メモの整理','急いで書いたせいで、配達メモの文がおかしくなったんだ。正しい文に直してほしい。','これなら届け先をまちがえない。助かったよ。'],
  ['doctor','観察記録を整えよう','薬草の観察記録に、意味がつながらない文があるの。一緒に整理しよう。','記録がとても分かりやすくなったよ。次の観察に役立つね。']],
 honor:[
  ['scholar','先生への招待状','研究発表に先生を招待したいの。失礼のない言葉に直すのを手伝って。','これなら気持ちよく来てもらえそう。発表もがんばるね。'],
  ['doctor','お医者さんへのお願い','遠くのお医者さんに薬草を分けてもらう手紙を書くの。ていねいな言い方を考えよう。','とてもていねいな手紙になったよ。きっと協力してくれるね。'],
  ['baker','お客さまをご案内','パン作りを見学するお客さまが来るの。きれいな言葉で案内したいな。','すてきな案内になったよ。みんな安心して見学できるね。'],
  ['weaver','職人さんへのお礼','糸を分けてくれた職人さんに、お礼を伝えたいんだよ。どんな言葉がよいかねえ。','心のこもったお礼になったね。きっと喜んでくださるよ。'],
  ['watchman','町長への報告','夜の見回りのことを町長に報告するんだ。正しい敬語になっているか見てほしい。','これでしっかり報告できる。町を守る仕事も続けるよ。']],
 multiply:[
  ['baker','パンの袋詰め','同じ数ずつパンを袋に入れるよ。全部でいくつになるか計算してくれる？','全部の袋を用意できたよ。焼きたてを届けよう！'],
  ['florist','花壇に植える苗','同じ数の苗をいくつもの花壇に植えたいの。必要な数を計算しよう。','苗がぴったりそろったね。どんな花壇になるか楽しみ！'],
  ['carpenter','木材の長さ','同じ長さの板を何本も使うんだ。全部で何メートル必要か調べてくれ。','木材をむだなく用意できた。いい仕事になりそうだ。'],
  ['fisher','釣りえさの小袋','釣りえさを同じ数ずつ小袋に入れるんだ。全部の数を出してみよう。','これで釣り仲間みんなに配れるよ。大漁だといいな！'],
  ['weaver','布の値段を計算','同じ値段の布を何枚か買うんだよ。合計の値段を一緒に計算しておくれ。','予算どおりに買えそうだ。新しい服を縫えるよ。']],
 divide:[
  ['baker','クッキーを分けよう','焼けたクッキーを同じ数ずつ箱に入れたいの。仲よく分けられるかな？','どの箱も同じ数になったよ。けんかせずに食べられるね。'],
  ['doctor','薬草の小分け','集めた薬草を同じ量ずつ袋に分けたいの。いくつずつ入るか考えよう。','きれいに小分けできたよ。必要な人にすぐ渡せるね。'],
  ['fisher','魚の箱詰め','今日釣れた魚を何箱かに同じ数ずつ入れるよ。箱ごとの数を計算して！','全部きれいに箱へ入ったよ。交易所へ運ぼう。'],
  ['watchman','ランタンの油','見回り用の油を同じ量ずつランタンに入れたい。一本分はどれくらいかな。','全部のランタンが明るくなった。今夜も安心だ。'],
  ['weaver','リボンを切ろう','長いリボンを同じ長さに切り分けるよ。一本の長さを計算しておくれ。','同じ長さにそろったね。きれいな飾りが作れそうだ。']],
 fraction:[
  ['baker','パン生地の配合','二つの粉を合わせるんだけど、分数で書かれているの。全部でどれくらいか考えよう。','分量ぴったり！ふわふわのパンになりそう。'],
  ['florist','花の水やり','午前と午後で水を分けてあげたいの。合わせた量を分数で出してみよう。','どの花にも十分な水をあげられたよ。'],
  ['cook','スープの材料','野菜とだしの量を合わせたいの。レシピの分数を計算してくれる？','ちょうどよい味になったよ。あったかいうちに食べよう！'],
  ['weaver','布のつなぎ合わせ','短い布を二枚つないで使うよ。合わせた長さを分数で表しておくれ。','必要な長さになったね。これなら大きな服も作れるよ。'],
  ['fisher','釣り場の地図','川までの道のりを分数で書いたんだ。二つの区間を合わせるとどれくらいかな？','道のりが分かったよ。朝早く出れば間に合いそうだ。']],
 volume:[
  ['carpenter','木箱づくり','道具を入れる直方体の木箱を作るんだ。中の広さを計算してくれ。','全部の道具が入りそうだ。丈夫な箱に仕上げるよ。'],
  ['fisher','水そうの水','魚を入れる水そうを用意したよ。入る水の量を調べてほしいな。','魚がゆったり泳げる量だね。大切に運ぼう。'],
  ['doctor','薬びんの箱','薬びんをしまう箱を新しくするの。体積を計算して、入るか確かめよう。','ぴったりの箱だったよ。薬びんも倒れずにしまえるね。'],
  ['carpenter','収納棚の空間','家に置く収納棚を作っている。中にどれだけ入るか計算してみよう。','使いやすい大きさになった。家具屋へ届けてくるよ。'],
  ['florist','花壇の土を量ろう','四角い花壇に入る土の量を知りたいの。体積を出してみよう。','必要な土が分かったよ。花をいっぱい植えようね。']],
 average:[
  ['fisher','毎日の魚','一週間で釣れた魚の数を比べたいんだ。一日平均を出してくれる？','いつ釣れやすいか分かってきたよ。次はもっと釣れそう！'],
  ['baker','パンの売れ数','何日かのパンの売れ方を記録したの。平均を出して、明日の数を決めよう。','作る数の目安ができたよ。売り切れないように焼くね。'],
  ['scholar','町の気温','朝の気温を毎日調べたの。平均の気温を出して記録に残そう。','町の季節の変わり方が見えてきたよ。ありがとう！'],
  ['companion','オトモの運動時間','オトモたちが遊んだ時間を記録したよ。平均すると何分かな？','みんなよく動いているね。今日も元気いっぱい！'],
  ['watchman','ランタン点検','何日かに直したランタンの数をまとめたい。平均を計算してくれ。','次に必要な材料の数が分かった。早めに準備できるよ。']],
 percent:[
  ['baker','お祭りセール','お祭りだけパンを値引きするの。何コインになるか計算してくれる？','値札を作れたよ。たくさんの人が来てくれるといいな！'],
  ['doctor','薬草の乾燥','集めた薬草は乾くと軽くなるの。残る量を割合から計算しよう。','保存できる量が分かったよ。冬の分も足りそうだね。'],
  ['weaver','布の値引き','少し傷のある布を値引きして売るんだよ。新しい値段を計算しておくれ。','ちょうどよい値段になったね。大切に使ってもらえそうだ。'],
  ['carpenter','木材の使用量','用意した木材のうち何％使ったか知りたいんだ。残りも計算できるかな？','残った木材の使い道も考えられる。むだがなくていいな。'],
  ['musician','募金の目標','町の演奏会で集める募金が、目標の何％まで来たか知りたいんだ。','あとどれくらいか分かったよ。最後まで演奏をがんばる！']]
};

STORY_SEED.npcs.push(...QUEST_NPCS);
STORY_SEED.quests.forEach((q,i)=>{q[5]=q[5]||QUEST_REWARD;q[6]=q[6]||('QST-'+String(q[0]).toUpperCase()+'-01');});
Object.entries(QUEST_MORE).forEach(([unit,rows])=>rows.forEach((r,i)=>STORY_SEED.quests.push([unit,...r,QUEST_REWARD,'QST-'+unit.toUpperCase()+'-'+String(i+2).padStart(2,'0')])));
if(typeof EXTRA_ASSETS==='object'&&typeof QUEST_NPC_ASSETS==='object')Object.assign(EXTRA_ASSETS,QUEST_NPC_ASSETS);

const DEMO={"units":[["read","国語","漢字の読み"],["write","国語","漢字の書き"],["grammar","国語","主語・述語"],["honor","国語","敬語"],["multiply","算数","小数のかけ算"],["divide","算数","小数のわり算"],["fraction","算数","分数のたし算"],["volume","算数","体積"],["average","算数","平均"],["percent","算数","割合"]],"questions":[{"id":"Q001","grade":5,"unit":"read","type":"choice","text":"「経験」の読みは？","answer":"けいけん","choices":["けいけん","けいげん","けんけい","きけん"],"explanation":"「経験」は「けいけん」と読みます。","memo":false,"enabled":true},{"id":"Q002","grade":5,"unit":"read","type":"choice","text":"「豊富」の読みは？","answer":"ほうふ","choices":["ほうふ","ほうと","とよとみ","ほうふう"],"explanation":"「豊富」は「ほうふ」と読みます。","memo":false,"enabled":true},{"id":"Q003","grade":5,"unit":"read","type":"choice","text":"「貿易」の読みは？","answer":"ぼうえき","choices":["ぼうえき","ぼうい","もうえき","ぼえき"],"explanation":"「貿易」は「ぼうえき」と読みます。","memo":false,"enabled":true},{"id":"Q004","grade":5,"unit":"read","type":"choice","text":"「複雑」の読みは？","answer":"ふくざつ","choices":["ふくざつ","ふくさつ","ふうざつ","ふくぞう"],"explanation":"「複雑」は「ふくざつ」と読みます。","memo":false,"enabled":true},{"id":"Q005","grade":5,"unit":"read","type":"choice","text":"「判断」の読みは？","answer":"はんだん","choices":["はんだん","ばんだん","はんたん","はだん"],"explanation":"「判断」は「はんだん」と読みます。","memo":false,"enabled":true},{"id":"Q006","grade":5,"unit":"read","type":"choice","text":"「賛成」の読みは？","answer":"さんせい","choices":["さんせい","ざんせい","さんしょう","さんせ"],"explanation":"「賛成」は「さんせい」と読みます。","memo":false,"enabled":true},{"id":"Q007","grade":5,"unit":"read","type":"choice","text":"「責任」の読みは？","answer":"せきにん","choices":["せきにん","せにん","せきじん","せっにん"],"explanation":"「責任」は「せきにん」と読みます。","memo":false,"enabled":true},{"id":"Q008","grade":5,"unit":"read","type":"choice","text":"「支持」の読みは？","answer":"しじ","choices":["しじ","しもち","じじ","しち"],"explanation":"「支持」は「しじ」と読みます。","memo":false,"enabled":true},{"id":"Q009","grade":5,"unit":"read","type":"choice","text":"「状態」の読みは？","answer":"じょうたい","choices":["じょうたい","しょうたい","じょたい","じょうだい"],"explanation":"「状態」は「じょうたい」と読みます。","memo":false,"enabled":true},{"id":"Q010","grade":5,"unit":"read","type":"choice","text":"「条件」の読みは？","answer":"じょうけん","choices":["じょうけん","しょうけん","じょけん","じょうげん"],"explanation":"「条件」は「じょうけん」と読みます。","memo":false,"enabled":true},{"id":"Q011","grade":5,"unit":"read","type":"choice","text":"「検査」の読みは？","answer":"けんさ","choices":["けんさ","けんざ","げんさ","けいさ"],"explanation":"「検査」は「けんさ」と読みます。","memo":false,"enabled":true},{"id":"Q012","grade":5,"unit":"read","type":"choice","text":"「準備」の読みは？","answer":"じゅんび","choices":["じゅんび","しゅんび","じゅび","じゅんひ"],"explanation":"「準備」は「じゅんび」と読みます。","memo":false,"enabled":true},{"id":"Q013","grade":5,"unit":"read","type":"choice","text":"「確認」の読みは？","answer":"かくにん","choices":["かくにん","かっにん","かくじん","かにん"],"explanation":"「確認」は「かくにん」と読みます。","memo":false,"enabled":true},{"id":"Q014","grade":5,"unit":"read","type":"choice","text":"「防災」の読みは？","answer":"ぼうさい","choices":["ぼうさい","ほうさい","ぼうざい","ぼさい"],"explanation":"「防災」は「ぼうさい」と読みます。","memo":false,"enabled":true},{"id":"Q015","grade":5,"unit":"read","type":"choice","text":"「提案」の読みは？","answer":"ていあん","choices":["ていあん","だいあん","てあん","ていなん"],"explanation":"「提案」は「ていあん」と読みます。","memo":false,"enabled":true},{"id":"Q016","grade":5,"unit":"read","type":"choice","text":"「祖先」の読みは？","answer":"そせん","choices":["そせん","そぜん","しょせん","そうせん"],"explanation":"「祖先」は「そせん」と読みます。","memo":false,"enabled":true},{"id":"Q017","grade":5,"unit":"read","type":"choice","text":"「能力」の読みは？","answer":"のうりょく","choices":["のうりょく","のりょく","のうりき","のうろく"],"explanation":"「能力」は「のうりょく」と読みます。","memo":false,"enabled":true},{"id":"Q018","grade":5,"unit":"read","type":"choice","text":"「解決」の読みは？","answer":"かいけつ","choices":["かいけつ","かいげつ","げけつ","かけつ"],"explanation":"「解決」は「かいけつ」と読みます。","memo":false,"enabled":true},{"id":"Q019","grade":5,"unit":"read","type":"choice","text":"「証明」の読みは？","answer":"しょうめい","choices":["しょうめい","しょうみょう","じょうめい","しょめい"],"explanation":"「証明」は「しょうめい」と読みます。","memo":false,"enabled":true},{"id":"Q020","grade":5,"unit":"read","type":"choice","text":"「技術」の読みは？","answer":"ぎじゅつ","choices":["ぎじゅつ","ぎじつ","きじゅつ","ぎしゅつ"],"explanation":"「技術」は「ぎじゅつ」と読みます。","memo":false,"enabled":true},{"id":"Q021","grade":5,"unit":"write","type":"handwriting","text":"「えいきゅう（□久）」の□に入る漢字を一字書こう。","answer":"永","choices":[],"explanation":"「永久」の「えい」は「永」です。","memo":false,"enabled":true},{"id":"Q022","grade":5,"unit":"write","type":"handwriting","text":"「きゅうか（□家）」の□に入る漢字を一字書こう。","answer":"旧","choices":[],"explanation":"「旧家」の「きゅう」は「旧」です。","memo":false,"enabled":true},{"id":"Q023","grade":5,"unit":"write","type":"handwriting","text":"「かのう（□能）」の□に入る漢字を一字書こう。","answer":"可","choices":[],"explanation":"「可能」の「か」は「可」です。","memo":false,"enabled":true},{"id":"Q024","grade":5,"unit":"write","type":"handwriting","text":"「はいく（俳□）」の□に入る漢字を一字書こう。","answer":"句","choices":[],"explanation":"「俳句」の「く」は「句」です。","memo":false,"enabled":true},{"id":"Q025","grade":5,"unit":"write","type":"handwriting","text":"「れきし（歴□）」の□に入る漢字を一字書こう。","answer":"史","choices":[],"explanation":"「歴史」の「し」は「史」です。","memo":false,"enabled":true},{"id":"Q026","grade":5,"unit":"write","type":"handwriting","text":"「しじ（指□）」の□に入る漢字を一字書こう。","answer":"示","choices":[],"explanation":"「指示」の「じ」は「示」です。","memo":false,"enabled":true},{"id":"Q027","grade":5,"unit":"write","type":"handwriting","text":"「かり（□）」の□に入る漢字を一字書こう。","answer":"仮","choices":[],"explanation":"「仮」の「かり」は「仮」です。","memo":false,"enabled":true},{"id":"Q028","grade":5,"unit":"write","type":"handwriting","text":"「じょうけん（条□）」の□に入る漢字を一字書こう。","answer":"件","choices":[],"explanation":"「条件」の「けん」は「件」です。","memo":false,"enabled":true},{"id":"Q029","grade":5,"unit":"write","type":"handwriting","text":"「さいかい（□開）」の□に入る漢字を一字書こう。","answer":"再","choices":[],"explanation":"「再開」の「さい」は「再」です。","memo":false,"enabled":true},{"id":"Q030","grade":5,"unit":"write","type":"handwriting","text":"「あつりょく（□力）」の□に入る漢字を一字書こう。","answer":"圧","choices":[],"explanation":"「圧力」の「あつ」は「圧」です。","memo":false,"enabled":true},{"id":"Q031","grade":5,"unit":"grammar","type":"choice","text":"「小鳥が空を飛ぶ。」の主語は？","answer":"小鳥が","choices":["小鳥が","飛ぶ","主語はない","文全体"],"explanation":"「だれが・何が」に当たる「小鳥が」が主語です。","memo":false,"enabled":true},{"id":"Q032","grade":5,"unit":"grammar","type":"choice","text":"「小鳥が空を飛ぶ。」の述語は？","answer":"飛ぶ","choices":["飛ぶ","小鳥が","述語はない","文全体"],"explanation":"「どうする」に当たる「飛ぶ」が述語です。","memo":false,"enabled":true},{"id":"Q033","grade":5,"unit":"grammar","type":"choice","text":"「わたしは毎朝本を読む。」の主語は？","answer":"わたしは","choices":["わたしは","読む","主語はない","文全体"],"explanation":"「だれが・何が」に当たる「わたしは」が主語です。","memo":false,"enabled":true},{"id":"Q034","grade":5,"unit":"grammar","type":"choice","text":"「わたしは毎朝本を読む。」の述語は？","answer":"読む","choices":["読む","わたしは","述語はない","文全体"],"explanation":"「どうする」に当たる「読む」が述語です。","memo":false,"enabled":true},{"id":"Q035","grade":5,"unit":"grammar","type":"choice","text":"「妹が庭で遊ぶ。」の主語は？","answer":"妹が","choices":["妹が","遊ぶ","主語はない","文全体"],"explanation":"「だれが・何が」に当たる「妹が」が主語です。","memo":false,"enabled":true},{"id":"Q036","grade":5,"unit":"grammar","type":"choice","text":"「妹が庭で遊ぶ。」の述語は？","answer":"遊ぶ","choices":["遊ぶ","妹が","述語はない","文全体"],"explanation":"「どうする」に当たる「遊ぶ」が述語です。","memo":false,"enabled":true},{"id":"Q037","grade":5,"unit":"grammar","type":"choice","text":"「雨が静かに降る。」の主語は？","answer":"雨が","choices":["雨が","降る","主語はない","文全体"],"explanation":"「だれが・何が」に当たる「雨が」が主語です。","memo":false,"enabled":true},{"id":"Q038","grade":5,"unit":"grammar","type":"choice","text":"「雨が静かに降る。」の述語は？","answer":"降る","choices":["降る","雨が","述語はない","文全体"],"explanation":"「どうする」に当たる「降る」が述語です。","memo":false,"enabled":true},{"id":"Q039","grade":5,"unit":"grammar","type":"choice","text":"「先生は黒板に書く。」の主語は？","answer":"先生は","choices":["先生は","書く","主語はない","文全体"],"explanation":"「だれが・何が」に当たる「先生は」が主語です。","memo":false,"enabled":true},{"id":"Q040","grade":5,"unit":"grammar","type":"choice","text":"「先生は黒板に書く。」の述語は？","answer":"書く","choices":["書く","先生は","述語はない","文全体"],"explanation":"「どうする」に当たる「書く」が述語です。","memo":false,"enabled":true},{"id":"Q041","grade":5,"unit":"honor","type":"choice","text":"先生が「言う」を尊敬語にすると？","answer":"おっしゃる","choices":["おっしゃる","申す","申し上げる","言わせる"],"explanation":"この場面では「おっしゃる」を使います。","memo":false,"enabled":true},{"id":"Q042","grade":5,"unit":"honor","type":"choice","text":"先生が「見る」を尊敬語にすると？","answer":"ご覧になる","choices":["ご覧になる","拝見する","見せる","見てもらう"],"explanation":"この場面では「ご覧になる」を使います。","memo":false,"enabled":true},{"id":"Q043","grade":5,"unit":"honor","type":"choice","text":"自分が先生に「言う」を謙譲語にすると？","answer":"申し上げる","choices":["申し上げる","おっしゃる","言われる","言わせる"],"explanation":"この場面では「申し上げる」を使います。","memo":false,"enabled":true},{"id":"Q044","grade":5,"unit":"honor","type":"choice","text":"自分が先生の作品を「見る」を謙譲語にすると？","answer":"拝見する","choices":["拝見する","ご覧になる","見られる","お見せになる"],"explanation":"この場面では「拝見する」を使います。","memo":false,"enabled":true},{"id":"Q045","grade":5,"unit":"honor","type":"choice","text":"先生が「食べる」を尊敬語にすると？","answer":"召し上がる","choices":["召し上がる","いただく","食べさせる","食べてもらう"],"explanation":"この場面では「召し上がる」を使います。","memo":false,"enabled":true},{"id":"Q046","grade":5,"unit":"honor","type":"choice","text":"自分が先生からお菓子を「もらう」を謙譲語にすると？","answer":"いただく","choices":["いただく","くださる","召し上がる","差し上げる"],"explanation":"この場面では「いただく」を使います。","memo":false,"enabled":true},{"id":"Q047","grade":5,"unit":"honor","type":"choice","text":"先生が学校に「来る」を尊敬語にすると？","answer":"いらっしゃる","choices":["いらっしゃる","うかがう","参る","来させる"],"explanation":"この場面では「いらっしゃる」を使います。","memo":false,"enabled":true},{"id":"Q048","grade":5,"unit":"honor","type":"choice","text":"自分が先生の家に「行く」を謙譲語にすると？","answer":"うかがう","choices":["うかがう","いらっしゃる","おいでになる","行かれる"],"explanation":"この場面では「うかがう」を使います。","memo":false,"enabled":true},{"id":"Q049","grade":5,"unit":"honor","type":"choice","text":"「読む」を「です・ます」の丁寧な言い方にすると？","answer":"読みます","choices":["読みます","お読みになる","拝読する","読ませる"],"explanation":"この場面では「読みます」を使います。","memo":false,"enabled":true},{"id":"Q050","grade":5,"unit":"honor","type":"choice","text":"先生がわたしに本を「くれる」を尊敬語にすると？","answer":"くださる","choices":["くださる","いただく","差し上げる","もらわれる"],"explanation":"この場面では「くださる」を使います。","memo":false,"enabled":true},{"id":"Q051","grade":5,"unit":"multiply","type":"number","text":"2.4 × 1.3 = ？","answer":"3.12","choices":[],"explanation":"24 × 13 = 312。小数点を合わせて2けた戻すと 3.12 です。","memo":true,"enabled":true},{"id":"Q052","grade":5,"unit":"multiply","type":"number","text":"3.6 × 1.2 = ？","answer":"4.32","choices":[],"explanation":"36 × 12 = 432。小数点を合わせて2けた戻すと 4.32 です。","memo":true,"enabled":true},{"id":"Q053","grade":5,"unit":"multiply","type":"number","text":"1.5 × 2.4 = ？","answer":"3.6","choices":[],"explanation":"15 × 24 = 360。小数点を合わせて2けた戻すと 3.6 です。","memo":true,"enabled":true},{"id":"Q054","grade":5,"unit":"multiply","type":"number","text":"4.8 × 1.5 = ？","answer":"7.2","choices":[],"explanation":"48 × 15 = 720。小数点を合わせて2けた戻すと 7.2 です。","memo":true,"enabled":true},{"id":"Q055","grade":5,"unit":"multiply","type":"number","text":"2.7 × 1.4 = ？","answer":"3.78","choices":[],"explanation":"27 × 14 = 378。小数点を合わせて2けた戻すと 3.78 です。","memo":true,"enabled":true},{"id":"Q056","grade":5,"unit":"multiply","type":"number","text":"3.2 × 2.5 = ？","answer":"8","choices":[],"explanation":"32 × 25 = 800。小数点を合わせて2けた戻すと 8 です。","memo":true,"enabled":true},{"id":"Q057","grade":5,"unit":"multiply","type":"number","text":"6.4 × 1.2 = ？","answer":"7.68","choices":[],"explanation":"64 × 12 = 768。小数点を合わせて2けた戻すと 7.68 です。","memo":true,"enabled":true},{"id":"Q058","grade":5,"unit":"multiply","type":"number","text":"1.8 × 3.5 = ？","answer":"6.3","choices":[],"explanation":"18 × 35 = 630。小数点を合わせて2けた戻すと 6.3 です。","memo":true,"enabled":true},{"id":"Q059","grade":5,"unit":"multiply","type":"number","text":"4.2 × 1.6 = ？","answer":"6.72","choices":[],"explanation":"42 × 16 = 672。小数点を合わせて2けた戻すと 6.72 です。","memo":true,"enabled":true},{"id":"Q060","grade":5,"unit":"multiply","type":"number","text":"7.5 × 2.4 = ？","answer":"18","choices":[],"explanation":"75 × 24 = 1800。小数点を合わせて2けた戻すと 18 です。","memo":true,"enabled":true},{"id":"Q061","grade":5,"unit":"divide","type":"number","text":"3.6 ÷ 1.2 = ？","answer":"3","choices":[],"explanation":"両方を10倍して 36 ÷ 12 を計算すると 3 です。","memo":true,"enabled":true},{"id":"Q062","grade":5,"unit":"divide","type":"number","text":"8.4 ÷ 2.4 = ？","answer":"3.5","choices":[],"explanation":"両方を10倍して 84 ÷ 24 を計算すると 3.5 です。","memo":true,"enabled":true},{"id":"Q063","grade":5,"unit":"divide","type":"number","text":"9.1 ÷ 3.5 = ？","answer":"2.6","choices":[],"explanation":"両方を10倍して 91 ÷ 35 を計算すると 2.6 です。","memo":true,"enabled":true},{"id":"Q064","grade":5,"unit":"divide","type":"number","text":"4.8 ÷ 1.5 = ？","answer":"3.2","choices":[],"explanation":"両方を10倍して 48 ÷ 15 を計算すると 3.2 です。","memo":true,"enabled":true},{"id":"Q065","grade":5,"unit":"divide","type":"number","text":"7.2 ÷ 1.6 = ？","answer":"4.5","choices":[],"explanation":"両方を10倍して 72 ÷ 16 を計算すると 4.5 です。","memo":true,"enabled":true},{"id":"Q066","grade":5,"unit":"divide","type":"number","text":"6.3 ÷ 1.4 = ？","answer":"4.5","choices":[],"explanation":"両方を10倍して 63 ÷ 14 を計算すると 4.5 です。","memo":true,"enabled":true},{"id":"Q067","grade":5,"unit":"divide","type":"number","text":"9.6 ÷ 3.2 = ？","answer":"3","choices":[],"explanation":"両方を10倍して 96 ÷ 32 を計算すると 3 です。","memo":true,"enabled":true},{"id":"Q068","grade":5,"unit":"divide","type":"number","text":"5.4 ÷ 1.2 = ？","answer":"4.5","choices":[],"explanation":"両方を10倍して 54 ÷ 12 を計算すると 4.5 です。","memo":true,"enabled":true},{"id":"Q069","grade":5,"unit":"divide","type":"number","text":"8.1 ÷ 1.8 = ？","answer":"4.5","choices":[],"explanation":"両方を10倍して 81 ÷ 18 を計算すると 4.5 です。","memo":true,"enabled":true},{"id":"Q070","grade":5,"unit":"divide","type":"number","text":"6.8 ÷ 2.5 = ？","answer":"2.72","choices":[],"explanation":"両方を10倍して 68 ÷ 25 を計算すると 2.72 です。","memo":true,"enabled":true},{"id":"Q071","grade":5,"unit":"fraction","type":"number","text":"1/2 ＋ 1/3 = ？（分数で答えよう）","answer":"5/6","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 5/6 です。","memo":true,"enabled":true},{"id":"Q072","grade":5,"unit":"fraction","type":"number","text":"1/3 ＋ 1/4 = ？（分数で答えよう）","answer":"7/12","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 7/12 です。","memo":true,"enabled":true},{"id":"Q073","grade":5,"unit":"fraction","type":"number","text":"1/4 ＋ 1/2 = ？（分数で答えよう）","answer":"3/4","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 3/4 です。","memo":true,"enabled":true},{"id":"Q074","grade":5,"unit":"fraction","type":"number","text":"2/3 ＋ 1/6 = ？（分数で答えよう）","answer":"5/6","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 5/6 です。","memo":true,"enabled":true},{"id":"Q075","grade":5,"unit":"fraction","type":"number","text":"1/5 ＋ 1/2 = ？（分数で答えよう）","answer":"7/10","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 7/10 です。","memo":true,"enabled":true},{"id":"Q076","grade":5,"unit":"fraction","type":"number","text":"1/6 ＋ 1/3 = ？（分数で答えよう）","answer":"1/2","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 1/2 です。","memo":true,"enabled":true},{"id":"Q077","grade":5,"unit":"fraction","type":"number","text":"3/8 ＋ 1/4 = ？（分数で答えよう）","answer":"5/8","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 5/8 です。","memo":true,"enabled":true},{"id":"Q078","grade":5,"unit":"fraction","type":"number","text":"1/2 ＋ 1/8 = ？（分数で答えよう）","answer":"5/8","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 5/8 です。","memo":true,"enabled":true},{"id":"Q079","grade":5,"unit":"fraction","type":"number","text":"2/5 ＋ 1/10 = ？（分数で答えよう）","answer":"1/2","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 1/2 です。","memo":true,"enabled":true},{"id":"Q080","grade":5,"unit":"fraction","type":"number","text":"1/3 ＋ 1/9 = ？（分数で答えよう）","answer":"4/9","choices":[],"explanation":"分母をそろえて分子をたし、約分すると 4/9 です。","memo":true,"enabled":true},{"id":"Q081","grade":5,"unit":"volume","type":"number","text":"たて2cm、横3cm、高さ4cmの直方体の体積は？（cm³）","answer":"24","choices":[],"explanation":"たて × 横 × 高さ = 2 × 3 × 4 = 24 cm³。","memo":true,"enabled":true},{"id":"Q082","grade":5,"unit":"volume","type":"number","text":"たて5cm、横3cm、高さ2cmの直方体の体積は？（cm³）","answer":"30","choices":[],"explanation":"たて × 横 × 高さ = 5 × 3 × 2 = 30 cm³。","memo":true,"enabled":true},{"id":"Q083","grade":5,"unit":"volume","type":"number","text":"たて6cm、横4cm、高さ5cmの直方体の体積は？（cm³）","answer":"120","choices":[],"explanation":"たて × 横 × 高さ = 6 × 4 × 5 = 120 cm³。","memo":true,"enabled":true},{"id":"Q084","grade":5,"unit":"volume","type":"number","text":"たて3cm、横3cm、高さ3cmの直方体の体積は？（cm³）","answer":"27","choices":[],"explanation":"たて × 横 × 高さ = 3 × 3 × 3 = 27 cm³。","memo":true,"enabled":true},{"id":"Q085","grade":5,"unit":"volume","type":"number","text":"たて8cm、横2cm、高さ5cmの直方体の体積は？（cm³）","answer":"80","choices":[],"explanation":"たて × 横 × 高さ = 8 × 2 × 5 = 80 cm³。","memo":true,"enabled":true},{"id":"Q086","grade":5,"unit":"volume","type":"number","text":"たて4cm、横5cm、高さ6cmの直方体の体積は？（cm³）","answer":"120","choices":[],"explanation":"たて × 横 × 高さ = 4 × 5 × 6 = 120 cm³。","memo":true,"enabled":true},{"id":"Q087","grade":5,"unit":"volume","type":"number","text":"たて7cm、横3cm、高さ2cmの直方体の体積は？（cm³）","answer":"42","choices":[],"explanation":"たて × 横 × 高さ = 7 × 3 × 2 = 42 cm³。","memo":true,"enabled":true},{"id":"Q088","grade":5,"unit":"volume","type":"number","text":"たて9cm、横2cm、高さ4cmの直方体の体積は？（cm³）","answer":"72","choices":[],"explanation":"たて × 横 × 高さ = 9 × 2 × 4 = 72 cm³。","memo":true,"enabled":true},{"id":"Q089","grade":5,"unit":"volume","type":"number","text":"たて5cm、横5cm、高さ5cmの直方体の体積は？（cm³）","answer":"125","choices":[],"explanation":"たて × 横 × 高さ = 5 × 5 × 5 = 125 cm³。","memo":true,"enabled":true},{"id":"Q090","grade":5,"unit":"volume","type":"number","text":"たて10cm、横3cm、高さ4cmの直方体の体積は？（cm³）","answer":"120","choices":[],"explanation":"たて × 横 × 高さ = 10 × 3 × 4 = 120 cm³。","memo":true,"enabled":true},{"id":"Q091","grade":5,"unit":"average","type":"number","text":"6、8、10 の平均は？","answer":"8","choices":[],"explanation":"合計24を3でわると 8 です。","memo":true,"enabled":true},{"id":"Q092","grade":5,"unit":"average","type":"number","text":"12、15、18 の平均は？","answer":"15","choices":[],"explanation":"合計45を3でわると 15 です。","memo":true,"enabled":true},{"id":"Q093","grade":5,"unit":"average","type":"number","text":"70、80、90 の平均は？","answer":"80","choices":[],"explanation":"合計240を3でわると 80 です。","memo":true,"enabled":true},{"id":"Q094","grade":5,"unit":"average","type":"number","text":"3、5、7 の平均は？","answer":"5","choices":[],"explanation":"合計15を3でわると 5 です。","memo":true,"enabled":true},{"id":"Q095","grade":5,"unit":"average","type":"number","text":"20、22、24 の平均は？","answer":"22","choices":[],"explanation":"合計66を3でわると 22 です。","memo":true,"enabled":true},{"id":"Q096","grade":5,"unit":"percent","type":"number","text":"200 の 25% はいくつ？","answer":"50","choices":[],"explanation":"25% = 0.25。200 × 0.25 = 50。","memo":true,"enabled":true},{"id":"Q097","grade":5,"unit":"percent","type":"number","text":"80 の 50% はいくつ？","answer":"40","choices":[],"explanation":"50% = 0.5。80 × 0.5 = 40。","memo":true,"enabled":true},{"id":"Q098","grade":5,"unit":"percent","type":"number","text":"300 の 10% はいくつ？","answer":"30","choices":[],"explanation":"10% = 0.1。300 × 0.1 = 30。","memo":true,"enabled":true},{"id":"Q099","grade":5,"unit":"percent","type":"number","text":"120 の 75% はいくつ？","answer":"90","choices":[],"explanation":"75% = 0.75。120 × 0.75 = 90。","memo":true,"enabled":true},{"id":"Q100","grade":5,"unit":"percent","type":"number","text":"250 の 20% はいくつ？","answer":"50","choices":[],"explanation":"20% = 0.2。250 × 0.2 = 50。","memo":true,"enabled":true}],"shops":{"avatar":1,"otomo":3,"furniture":5,"trade":7,"gacha":9,"alchemy":12}};
const SHOPS=DEMO.shops;
const DAY=86400000;
const enc=new TextEncoder();
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const error=(message,status=400)=>json({error:message},status);
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',enc.encode(String(value)));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
const randomToken=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const validName=name=>/^[ぁ-ゖァ-ヺ一-龯ー]{1,6}$/.test(String(name||''));
function credential(c){if(!c||![5,6].includes(Number(c.grade))||!Number.isInteger(Number(c.group))||Number(c.group)<1||Number(c.group)>20||!Number.isInteger(Number(c.number))||Number(c.number)<1||Number(c.number)>99||!Array.isArray(c.code)||c.code.length!==1||!Number.isInteger(c.code[0])||c.code[0]<0||c.code[0]>7)throw Error('学年・組・番号と、絵を1つ選んでください。');return `${Number(c.grade)}-${Number(c.group)}-${Number(c.number)}`;}
const title=()=>({units:DEMO.units.map(([id,subject,name])=>({id,subject,name})),shops:SHOPS,dailyLimit:6,growthHours:24,serverTime:Date.now(),board:Engine.board,story:STORY_SEED});
async function cleanup(db,now=Date.now()){await db.batch([db.prepare('DELETE FROM sessions WHERE expires_at<=?').bind(now),db.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(now)]);}
async function playerByToken(db,token){if(typeof token!=='string'||token.length<32)throw Error('ログインし直してください。');const hash=await digest(token),row=await db.prepare('SELECT p.* FROM sessions s JOIN players p ON p.id=s.player_id WHERE s.token_hash=? AND s.expires_at>?').bind(hash,Date.now()).first();if(!row)throw Error('ログインし直してください。');return row;}
async function savePlayer(db,row,state,login=false){const now=Date.now();state=Engine.upgrade(state,now);if(login)state.lastLogin=now;await db.prepare('UPDATE players SET name=?,appearance=?,state_json=?,level=?,xp=?,coins=?,development=?,unlocked_count=?,last_login=?,updated_at=? WHERE id=?').bind(state.name||row.name,state.appearance||row.appearance,JSON.stringify(state),state.level||1,state.xp||0,state.coins||0,state.development||0,(state.unlocked||[]).length,login?now:Number(row.last_login||now),now,row.id).run();return state;}
async function newSession(db,playerId){const token=randomToken();await db.prepare('INSERT INTO sessions(token_hash,player_id,expires_at) VALUES(?,?,?)').bind(await digest(token),playerId,Date.now()+7*DAY).run();return token;}
function questOffers(s,force){const today=Engine.day(Date.now()),available=new Set(title().units.map(u=>u.id)),quests=STORY_SEED.quests.filter(q=>available.has(String(q[0]))),idOf=q=>String(q[6]||q[0]);if(!force&&s.dailyOffers?.date===today&&s.dailyOffers.ids?.length){s.dailyOffers.completed=Array.isArray(s.dailyOffers.completed)?s.dailyOffers.completed:[];return quests.filter(q=>s.dailyOffers.ids.includes(idOf(q))).sort((a,b)=>s.dailyOffers.ids.indexOf(idOf(a))-s.dailyOffers.ids.indexOf(idOf(b)));}const shuffled=quests.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}const chosen=shuffled.slice(0,5);s.dailyOffers={date:today,ids:chosen.map(idOf),completed:[]};return chosen;}
async function gameRpc(db,method,args){
 if(method==='getTitleData')return title();
 if(method==='registerCharacter'){const c=args[0],accountId=credential(c),name=String(args[1]||'').trim(),appearance=args[3];if(!validName(name))throw Error('名前は、ひらがな・カタカナ・漢字だけで6文字以内にしてください。');if(!['a','b'].includes(appearance))throw Error('見た目を選んでください。');if(await db.prepare('SELECT id FROM players WHERE account_id=?').bind(accountId).first())throw Error('この番号は登録済みです。「つづきから」で入ってください。');const now=Date.now(),id=crypto.randomUUID(),salt=crypto.randomUUID(),state=Engine.upgrade({},now);state.id=id;state.name=name;state.accountId=accountId;state.appearance=appearance;state.lastLogin=now;await db.prepare('INSERT INTO players(id,account_id,name,appearance,salt,pass_hash,state_json,level,xp,coins,development,unlocked_count,created_at,last_login,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,accountId,name,appearance,salt,await digest(salt+':'+c.code[0]),JSON.stringify(state),state.level,state.xp,state.coins,state.development,0,now,now,now).run();return{token:await newSession(db,id),state,...title()};}
 if(method==='loginCharacter'){const c=args[0],accountId=credential(c),row=await db.prepare('SELECT * FROM players WHERE account_id=?').bind(accountId).first();if(!row||await digest(row.salt+':'+c.code[0])!==row.pass_hash)throw Error('組・番号と合い言葉の絵を確認してください。');const state=await savePlayer(db,row,JSON.parse(row.state_json),true);return{token:await newSession(db,row.id),state,...title()};}
 if(method==='bootstrap'){const row=await playerByToken(db,args[0]),state=JSON.parse(row.state_json);return{state,...title()};}
 const row=await playerByToken(db,args[0]),s=Engine.upgrade(JSON.parse(row.state_json),Date.now());let result=s;
 if(method==='selectAppearance'){if(!['a','b'].includes(args[1]))throw Error('見た目を選んでください。');if(!s.appearance)s.appearance=args[1];}
 else if(method==='completeScene'){if(!STORY_SEED.scenes.some(x=>x.id===args[1]))throw Error('物語を開き直してください。');s.storySeen=s.storySeen||[];if(!s.storySeen.includes(args[1]))s.storySeen.push(args[1]);}
 else if(method==='getDailyQuestOffers')result={state:s,offers:questOffers(s,false),completed:s.dailyOffers.completed};
 else if(method==='refreshDailyQuestOffers'){questOffers(s,false);if(s.dailyOffers.completed.length<s.dailyOffers.ids.length)throw Error('表示中の依頼をすべて終えてから探してください。');result={state:s,offers:questOffers(s,true),completed:[]};}
 else if(method==='startQuest'){Engine.start(s,args[1],{units:title().units,questions:DEMO.questions},crypto.randomUUID(),Date.now(),Math.random);s.active.questId=String(args[2]||args[1]);}
 else if(method==='finishQuest'){const offerId=s.active&&(s.active.questId||s.active.course);result={state:s,reward:Engine.finish(s,args[1],args[2],Date.now(),Engine.defaults,Math.random)};if(offerId&&s.dailyOffers?.ids.includes(offerId)&&!s.dailyOffers.completed.includes(offerId))s.dailyOffers.completed.push(offerId);}
 else if(method==='failQuest')result={state:s,failure:Engine.fail(s,args[1])};
 else if(method==='craftAlchemy')result={state:s,result:Engine.craft(s,args[1])};
 else if(method==='sellItems')result={state:s,result:Engine.sell(s,args[1],args[2])};
 else if(method==='buyFurniture')result={state:s,result:Engine.buyFurniture(s,args[1])};
 else if(method==='buyOtomo')result={state:s,result:Engine.buyOtomo(s,args[1])};
 else if(method==='careOtomo')result={state:s,result:Engine.careOtomo(s,Date.now(),Math.random)};
 else if(method==='feedOtomo')result={state:s,result:Engine.feedOtomo(s,args[1])};
 else if(method==='startOtomoContest'){if(!s.otomo)throw Error('まずはオトモを迎えてね。');const pool=DEMO.questions.filter(q=>q.type==='choice'),q=pool[Math.floor(Math.random()*pool.length)],id=crypto.randomUUID();s.otomoContest={id,questionId:q.id};result={state:s,contest:{id,text:q.text,choices:q.choices}};}
 else if(method==='finishOtomoContest'){const contest=s.otomoContest,q=contest&&DEMO.questions.find(x=>x.id===contest.questionId);if(!q||contest.id!==args[1])throw Error('品評会を開き直してください。');const r=Engine.contestResult(s,Engine.correct(q,args[2]));s.otomoContest=null;result={state:s,result:r};}
 else if(method==='unlockShop'){if(!(args[1] in SHOPS)||s.development<SHOPS[args[1]])throw Error('まだ開けません。');if(!s.unlocked.includes(args[1]))s.unlocked.push(args[1]);}
 else if(method==='rollDice')result={state:s,roll:Engine.roll(s,args[1],Date.now(),Math.random,Engine.board)};
 else if(method==='plantSeed')Engine.farm(s,method,args[1],crypto.randomUUID(),Date.now(),Engine.defaults,args[2]);
 else if(method==='harvestCrop'){Engine.farm(s,method,args[1],args[2],Date.now(),Engine.defaults);result={state:s};}
 else throw Error('不明な操作です。');
 await savePlayer(db,row,s);return result;
}
async function adminAuth(db,request){const url=new URL(request.url),token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')||url.searchParams.get('token')||'';if(!token)return false;return !!await db.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await digest(token),Date.now()).first();}
async function adminApi(db,request,url,env){
 if(url.pathname==='/api/admin/login'&&request.method==='POST'){const body=await request.json();if(!env.ADMIN_PASSWORD||String(body.password)!==String(env.ADMIN_PASSWORD))return error('管理者パスワードが違います。',401);const token=randomToken();await db.prepare('INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)').bind(await digest(token),Date.now()+8*60*60*1000).run();return json({token});}
 if(!await adminAuth(db,request))return error('管理者としてログインしてください。',401);
 if(url.pathname==='/api/admin/players'&&request.method==='GET'){const q=(url.searchParams.get('q')||'').trim(),like='%'+q+'%';const rows=await db.prepare('SELECT id,account_id,name,appearance,level,xp,coins,development,unlocked_count,created_at,last_login,updated_at FROM players WHERE ?="" OR account_id LIKE ? OR name LIKE ? ORDER BY account_id LIMIT 500').bind(q,like,like).all();return json({players:rows.results});}
 const m=url.pathname.match(/^\/api\/admin\/players\/([^/]+)\/(reset-passphrase|revoke-sessions|export)$/);if(!m)return error('管理画面の操作が見つかりません。',404);const id=decodeURIComponent(m[1]),row=await db.prepare('SELECT * FROM players WHERE id=?').bind(id).first();if(!row)return error('児童が見つかりません。',404);
 if(m[2]==='export'&&request.method==='GET')return new Response(row.state_json,{headers:{'content-type':'application/json; charset=utf-8','content-disposition':`attachment; filename="kitakko-${row.account_id}.json"`}});
 if(request.method!=='POST')return error('操作方法が違います。',405);
 if(m[2]==='revoke-sessions'){await db.prepare('DELETE FROM sessions WHERE player_id=?').bind(id).run();await db.prepare('INSERT INTO admin_audit(action,player_id,detail,created_at) VALUES(?,?,?,?)').bind('revoke-sessions',id,'',Date.now()).run();return json({ok:true});}
 const body=await request.json(),code=Number(body.code);if(!Number.isInteger(code)||code<0||code>7)return error('新しい合い言葉の絵を選んでください。');const salt=crypto.randomUUID();await db.batch([db.prepare('UPDATE players SET salt=?,pass_hash=?,updated_at=? WHERE id=?').bind(salt,await digest(salt+':'+code),Date.now(),id),db.prepare('DELETE FROM sessions WHERE player_id=?').bind(id),db.prepare('INSERT INTO admin_audit(action,player_id,detail,created_at) VALUES(?,?,?,?)').bind('reset-passphrase',id,'picture:'+code,Date.now())]);return json({ok:true});
}
export default{async fetch(request,env){try{const url=new URL(request.url);if(url.pathname.startsWith('/api/')){if(!env.DB)return error('D1データベースが接続されていません。',503);await cleanup(env.DB);if(url.pathname.startsWith('/api/admin/'))return adminApi(env.DB,request,url,env);if(url.pathname==='/api/rpc'&&request.method==='POST'){const body=await request.json();return json(await gameRpc(env.DB,String(body.method||''),Array.isArray(body.args)?body.args:[]));}return error('APIが見つかりません。',404);}return env.ASSETS.fetch(request);}catch(e){return error(e&&e.message?e.message:'処理に失敗しました。',400);}}};
