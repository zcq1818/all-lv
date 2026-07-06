const fs = require('fs');
const path = require('path');

const citiesDir = path.join(__dirname, '..', 'city');

// ============ SANYA ============
const sanya = {
  attractions: [
    { name: '亚龙湾', intro: '被誉为"天下第一湾"，拥有7千米长的银白色海滩，沙质细腻，海水清澈透明，是三亚最美的海湾之一。这里热带风情浓郁，椰林树影，水清沙白。', ticket: '免费（部分水上项目另收费）', time: '半天至一天' },
    { name: '天涯海角', intro: '三亚标志性景点，巨石上刻有"天涯""海角"字样，象征着爱情与浪漫。这里背依马岭山，面向大海，是情侣打卡的热门目的地。', ticket: '68元', time: '2-3小时' },
    { name: '南山文化旅游区', intro: '以108米高的南海观音像闻名，是集佛教文化、热带风光于一体的大型景区。南山寺气势恢宏，海上观音巍峨壮观，是心灵净化的好去处。', ticket: '129元', time: '半天' },
    { name: '蜈支洲岛', intro: '被称为"中国的马尔代夫"，海水能见度极高，是潜水爱好者的天堂。岛上热带植物茂盛，海水呈渐变的蓝绿色，风景如画。', ticket: '144元（含往返船票）', time: '一天' },
    { name: '呀诺达雨林文化旅游区', intro: '海南岛五大热带雨林精品的浓缩，有高空滑索、踏瀑戏水等体验项目。在这里可以近距离感受热带雨林的神秘与壮美。', ticket: '158元', time: '半天' },
    { name: '三亚湾', intro: '三亚最长的海湾，以椰梦长廊闻名，傍晚时分夕阳西下，椰林剪影美不胜收。这里靠近市区，交通便利，是休闲散步的好去处。', ticket: '免费', time: '2-3小时' },
    { name: '大东海', intro: '三亚最早开发的滨海度假区，沙滩平缓，海水温暖，适合游泳和日光浴。周边餐饮住宿丰富，夜生活热闹，是游客最密集的海滩之一。', ticket: '免费', time: '2-3小时' }
  ],
  food: [
    { name: '文昌鸡', feature: '海南四大名菜之首，皮薄骨酥，肉质嫩滑，蘸上特制酱汁鲜美无比。', reason: '来海南必吃的第一道菜，三亚各大餐厅均有供应，推荐白切做法最正宗。' },
    { name: '和乐蟹', feature: '海南四大名菜之一，蟹膏饱满，肉质鲜甜，以清蒸为最佳烹饪方式。', reason: '每年9-11月蟹黄最肥美，来三亚不吃和乐蟹等于白来。' },
    { name: '海鲜大餐（第一市场）', feature: '三亚第一市场是当地最大的海鲜市场，现买现做，品种丰富，价格实惠。', reason: '自己挑选新鲜海鲜，拿到旁边加工店烹饪，性价比极高，是三亚最地道的海鲜体验。' },
    { name: '椰子鸡', feature: '用新鲜椰子水炖煮文昌鸡，椰香浓郁，汤鲜味美，清甜不腻。', reason: '三亚特色火锅，椰子的清甜与鸡肉的鲜嫩完美结合，老少皆宜。' },
    { name: '清补凉', feature: '海南经典甜品，用椰奶或糖水搭配红豆、薏米、椰肉、西瓜等多种配料。', reason: '三亚街头随处可见，清凉解暑，是热带水果与传统甜品的完美融合。' },
    { name: '抱罗粉', feature: '海南特色米粉，粉条爽滑，汤头鲜美，配上牛肉或猪杂，味道醇厚。', reason: '三亚人日常早餐首选，正宗的抱罗粉汤底用猪骨熬制数小时，回味无穷。' },
    { name: '东山羊', feature: '海南四大名菜之一，肉质鲜嫩无膻味，以红烧或白汁炖煮为佳。', reason: '万宁东山羊品质最佳，在三亚也能品尝到正宗做法，值得一试。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>三亚凤凰国际机场是海南最大的机场，全国各大城市均有直飞航班。机场距市区约15公里，可乘坐机场大巴、公交或出租车前往。</p>
<h3>高铁/火车</h3><p>海南环岛高铁连接海口与三亚，全程约1.5小时。三亚站位于市区南部，交通便利。</p>
<h3>市内交通</h3><p>公交线路覆盖主要景点，28路可直达亚龙湾，26路到天涯海角。建议租车自驾，自由度更高，适合环岛游。打车建议使用滴滴等网约车平台。</p>`,
    accommodation: `<h3>亚龙湾/海棠湾（高端度假）</h3><p>五星级酒店集中区域，私家沙滩、无边泳池是标配，适合蜜月和家庭度假。预算：800-3000元/晚。</p>
<h3>三亚湾（性价比之选）</h3><p>靠近市区和第一市场，公寓式酒店和民宿众多，适合自由行。预算：200-600元/晚。</p>
<h3>大东海（便利地段）</h3><p>商业配套成熟，夜生活丰富，中档酒店为主。预算：300-800元/晚。</p>`,
    bestTime: `<p>三亚全年温暖，最佳旅游时间为<strong>10月至次年3月</strong>，此时气温20-28℃，降雨少，是避寒度假的黄金期。</p>
<p>4-9月为夏季，气温较高（28-35℃），偶有台风，但酒店价格较低，适合预算有限的游客。春节期间为旅游旺季，建议提前预订。</p>`,
    notes: `<ul><li>三亚紫外线强烈，务必做好防晒（SPF50+防晒霜、遮阳帽、墨镜）</li><li>第一市场海鲜加工需注意价格，建议提前做好攻略或选择口碑好的加工店</li><li>雨季出行需关注天气预报，台风期间部分景区会关闭</li><li>海边游泳注意安全，选择有救生员的海滩</li><li>建议购买旅游意外险，水上项目有一定风险</li><li>三亚消费水平较高，建议提前规划预算</li></ul>`
  }
};

// ============ CHENGDU ============
const chengdu = {
  attractions: [
    { name: '大熊猫繁育研究基地', intro: '全球最大的大熊猫人工繁育机构，可以近距离观赏大熊猫的生活状态。基地内竹林茂密，环境优美，还有小熊猫、孔雀等其他珍稀动物。', ticket: '55元', time: '3-4小时' },
    { name: '武侯祠', intro: '中国唯一的君臣合祀祠庙，纪念诸葛亮、刘备等蜀汉英雄。祠内古柏森森，红墙竹影，是三国文化的重要载体。', ticket: '50元', time: '2-3小时' },
    { name: '锦里古街', intro: '紧邻武侯祠的仿古商业街，集美食、购物、娱乐于一体。红灯笼高挂，古色古香，是体验成都民俗文化的好去处。', ticket: '免费', time: '2-3小时' },
    { name: '宽窄巷子', intro: '由宽巷子、窄巷子、井巷子组成的清朝古街，是成都最具代表性的历史文化街区。这里汇集了各类茶馆、餐厅、手工艺品店。', ticket: '免费', time: '2-3小时' },
    { name: '都江堰', intro: '公元前256年修建的大型水利工程，至今仍在发挥作用，是世界文化遗产。鱼嘴、飞沙堰、宝瓶口三大工程巧夺天工。', ticket: '80元', time: '半天' },
    { name: '青城山', intro: '道教发源地之一，素有"青城天下幽"的美誉。前山道教文化深厚，后山自然风光秀美，是徒步登山的好去处。', ticket: '前山80元，后山20元', time: '一天' },
    { name: '杜甫草堂', intro: '唐代诗人杜甫流寓成都时的故居，园内亭台楼阁，竹林幽径，充满诗情画意。是了解杜甫生平和唐代文学的重要场所。', ticket: '50元', time: '2小时' }
  ],
  food: [
    { name: '成都火锅', feature: '牛油锅底麻辣鲜香，涮菜种类丰富，是成都美食的灵魂。蘸料以香油蒜泥为主。', reason: '来成都不吃火锅等于没来。推荐小龙坎、蜀大侠等品牌，也可以尝试社区老火锅店。' },
    { name: '串串香', feature: '将各种食材穿在竹签上，放入麻辣锅中涮煮，按签计费，热闹有趣。', reason: '成都街头最受欢迎的小吃之一，马路边边、钢管厂五区小郡肝串串是热门选择。' },
    { name: '担担面', feature: '面条细薄，浇头用猪肉末、芽菜、花生碎等制成，麻辣酸鲜，层次丰富。', reason: '成都经典面食，陈麻婆豆腐店旁的担担面和龙抄手的都很正宗。' },
    { name: '钟水饺', feature: '皮薄馅嫩，淋上红油和蒜泥，甜辣交织，口感独特。', reason: '成都老字号小吃，与北方水饺风味截然不同，是体验川味的必吃之选。' },
    { name: '兔头', feature: '成都人最爱的零食用，卤制或麻辣口味，肉质紧实入味。', reason: '外地人可能不太敢尝试，但这是最地道的成都味道。双流老妈兔头是经典品牌。' },
    { name: '麻婆豆腐', feature: '豆腐嫩滑，肉末酥香，麻辣烫鲜，是川菜的代表作之一。', reason: '陈麻婆豆腐创始店就在成都，百年老店的味道值得专程前往。' },
    { name: '甜水面', feature: '面条粗壮有嚼劲，配上甜辣酱汁和花生碎，甜中带辣，风味独特。', reason: '成都特色面食，口感独特，是老成都人记忆中的味道。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>成都双流国际机场和天府国际机场均有航班，双流机场距市中心约16公里，天府机场约50公里。地铁10号线、18号线分别连接两个机场。</p>
<h3>高铁/火车</h3><p>成都东站是主要高铁站，可直达北京、上海、广州、重庆等城市。成都站（火车北站）也有部分线路。</p>
<h3>市内交通</h3><p>成都地铁覆盖主城区和主要景点，公交线路密集。打车和网约车方便，起步价8元。共享单车在市区随处可见，适合短途出行。</p>`,
    accommodation: `<h3>春熙路/太古里（核心商圈）</h3><p>成都最繁华的商业区，酒店选择丰富，步行可达IFS、太古里、春熙路。预算：300-1000元/晚。</p>
<h3>宽窄巷子/人民公园附近</h3><p>老成都风情浓厚，民宿和精品酒店众多，适合体验成都慢生活。预算：200-600元/晚。</p>
<h3>锦里/武侯祠附近</h3><p>靠近景点，出行方便，酒店性价比高。预算：200-500元/晚。</p>`,
    bestTime: `<p>成都最佳旅游时间为<strong>3-6月和9-11月</strong>。春季（3-5月）气候温和，花开满城；秋季（9-11月）天高气爽，银杏金黄。</p>
<p>夏季（7-8月）较热且潮湿，但可前往周边避暑。冬季（12-2月）阴冷多雾，但游客较少，酒店价格较低。成都一年四季都适合吃火锅。</p>`,
    notes: `<ul><li>成都菜普遍偏辣偏麻，不能吃辣的朋友记得提前告知店家"微辣"或"不辣"</li><li>大熊猫基地建议早上8点前到达，上午是大熊猫最活跃的时间</li><li>成都人生活节奏慢，茶馆文化浓厚，建议体验一次盖碗茶</li><li>春熙路和太古里是购物天堂，但注意防扒窃</li><li>成都周边景点（都江堰、青城山）建议安排一整天</li><li>出行建议使用地铁，高峰期路面交通较拥堵</li></ul>`
  }
};

// ============ XIAN ============
const xian = {
  attractions: [
    { name: '秦始皇兵马俑博物馆', intro: '世界第八大奇迹，展示了秦始皇陵的陪葬坑，数千个真人大小的陶俑形态各异，栩栩如生。一号坑最为壮观，是必看的核心展区。', ticket: '120元', time: '3-4小时' },
    { name: '西安城墙', intro: '中国现存最完整的古城墙，始建于明朝，周长13.74公里。可以骑自行车或步行环城墙一圈，俯瞰古城全貌，感受千年古都的雄伟。', ticket: '54元', time: '2-3小时' },
    { name: '大雁塔', intro: '唐代高僧玄奘为保存从印度带回的经卷而修建，是西安的标志性建筑。塔高64米，登塔可远眺西安城市风光。', ticket: '登塔30元', time: '2小时' },
    { name: '华清宫', intro: '唐代皇家温泉行宫，杨贵妃沐浴的海棠汤至今保存完好。晚上的《长恨歌》实景演出震撼人心，值得一看。', ticket: '120元', time: '半天' },
    { name: '回民街', intro: '西安最有名的美食街区，数百家小吃店林立。羊肉泡馍、肉夹馍、凉皮等美食应有尽有，是体验西安美食文化的必到之处。', ticket: '免费', time: '2-3小时' },
    { name: '陕西历史博物馆', intro: '中国第一座大型现代化国家级博物馆，馆藏文物37万余件。从远古到明清的珍贵文物让人目不暇接，是了解中华文明的最佳窗口。', ticket: '免费（需预约）', time: '3-4小时' },
    { name: '钟鼓楼', intro: '位于西安市中心，钟楼与鼓楼遥相呼应，是古城的地标性建筑。夜晚灯光璀璨，登上钟楼可俯瞰东、西、南、北四条大街。', ticket: '各30元（联票50元）', time: '1-2小时' }
  ],
  food: [
    { name: '羊肉泡馍', feature: '将烤制的馍掰成小块，配上浓郁的羊肉汤，粉丝、木耳等配料，汤浓味醇。', reason: '西安第一美食，老孙家、老米家是百年老字号，自己掰馍是独特的仪式感。' },
    { name: '肉夹馍', feature: '白吉馍外酥里嫩，夹入卤制的腊汁肉，肉香四溢，被称为"中式汉堡"。', reason: '回民街和永兴坊都有正宗肉夹馍，推荐樊记和子午路张记。' },
    { name: 'biangbiang面', feature: '面条宽厚筋道，一根面条就是一碗面，配上油泼辣子和蒜末，香辣过瘾。', reason: '陕西八大怪之一，面条像裤带，是体验关中面食文化的最佳选择。' },
    { name: '凉皮', feature: '米皮或面皮搭配黄瓜丝、豆芽，淋上辣椒油和醋，酸辣爽口。', reason: '西安街头最常见的小吃，魏家凉皮和盛志望麻酱酿皮是热门品牌。' },
    { name: '甑糕', feature: '用糯米、红枣、红豆蒸制而成，软糯香甜，是西安传统早点。', reason: '回民街的东南亚甑糕最正宗，清晨排队购买是老西安人的习惯。' },
    { name: '葫芦头泡馍', feature: '用猪大肠为主要食材的泡馍，汤底浓郁，搭配掰碎的馍，别有风味。', reason: '西安特色美食，春发生饭店是百年老店，是本地人的心头好。' },
    { name: '冰峰汽水', feature: '西安本地橘子味汽水，被称为"西安人的可乐"，是吃肉夹馍的标配饮品。', reason: '来西安不喝冰峰，等于没来。三秦套餐：肉夹馍+凉皮+冰峰。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>西安咸阳国际机场距市区约25公里，机场大巴和地铁14号线可直达市区，车程约1小时。</p>
<h3>高铁/火车</h3><p>西安北站是主要高铁站，可直达北京、上海、成都、郑州等城市。西安站位于市中心，靠近城墙。</p>
<h3>市内交通</h3><p>西安地铁已开通多条线路，覆盖主要景点。公交线路密集，2元起步。去兵马俑可乘坐游5路（306路）公交，从火车站出发。</p>`,
    accommodation: `<h3>钟楼/鼓楼附近（最佳地段）</h3><p>位于市中心，步行可达回民街、城墙、碑林。酒店和民宿选择丰富。预算：200-600元/晚。</p>
<h3>大雁塔/曲江新区</h3><p>环境优美，靠近大雁塔、大唐不夜城。中高档酒店为主。预算：300-800元/晚。</p>
<h3>火车站附近</h3><p>交通方便，适合早起去兵马俑。经济型酒店众多。预算：150-400元/晚。</p>`,
    bestTime: `<p>西安最佳旅游时间为<strong>3-5月和9-11月</strong>。春季气候温和，适合户外活动；秋季天高气爽，是游览古迹的最佳时节。</p>
<p>夏季（6-8月）炎热干燥，气温可达38℃以上。冬季（12-2月）寒冷，但游客少，可避开人流高峰。清明节前后和国庆期间为旅游旺季。</p>`,
    notes: `<ul><li>兵马俑建议请导游讲解，否则难以理解其历史价值</li><li>回民街游客较多，价格偏高，可深入巷子寻找本地人常去的店铺</li><li>西安城墙建议傍晚时分骑行，可以欣赏日落和夜景</li><li>陕西历史博物馆需提前在官网预约，旺季门票紧张</li><li>华清宫的《长恨歌》演出需提前购票，旺季一票难求</li><li>西安夏季炎热，注意防暑降温</li></ul>`
  }
};

// ============ HANGZHOU ============
const hangzhou = {
  attractions: [
    { name: '西湖', intro: '世界文化遗产，杭州的灵魂所在。苏堤春晓、断桥残雪、三潭印月等十景闻名天下。湖光山色，四季皆美，是中国最美的城市湖泊之一。', ticket: '免费', time: '一天' },
    { name: '灵隐寺', intro: '杭州最古老的佛教寺院，始建于东晋咸和元年。寺内古木参天，佛像庄严，飞来峰石刻造像更是艺术瑰宝。', ticket: '飞来峰30元+灵隐寺30元', time: '半天' },
    { name: '千岛湖', intro: '拥有1078个岛屿的人工湖，湖水清澈见底，能见度达12米。乘船游湖，岛屿星罗棋布，山水相映，被誉为"天下第一秀水"。', ticket: '130元（含船票）', time: '一天' },
    { name: '宋城', intro: '以宋代文化为主题的大型主题公园，《宋城千古情》演出被誉为世界三大名秀之一。园区内再现了宋代都市的繁华景象。', ticket: '门票+演出290元', time: '半天至一天' },
    { name: '龙井村', intro: '西湖龙井茶的产地，漫山遍野的茶园郁郁葱葱。春天可以体验采茶、炒茶，品尝正宗的明前龙井，感受茶文化的魅力。', ticket: '免费', time: '2-3小时' },
    { name: '九溪烟树', intro: '位于西湖西侧的山谷中，溪流潺潺，树木葱茏，是杭州最清幽的徒步路线之一。秋季红叶层林尽染，美不胜收。', ticket: '免费', time: '2-3小时' },
    { name: '西溪湿地', intro: '中国首个国家湿地公园，河渚芦花、秋雪庵等景点如诗如画。乘摇橹船穿行于芦苇荡中，感受城市中难得的宁静。', ticket: '60元', time: '半天' }
  ],
  food: [
    { name: '西湖醋鱼', feature: '选用西湖草鱼，浇上糖醋芡汁，鱼肉鲜嫩，酸甜可口，是杭帮菜的代表。', reason: '楼外楼的经典名菜，来杭州必吃。选用西湖里的草鱼，味道最为正宗。' },
    { name: '东坡肉', feature: '以苏东坡命名的传统名菜，五花肉炖至酥烂，色泽红亮，肥而不腻。', reason: '杭州楼外楼、知味观均有供应，配上一碗米饭，是最幸福的味道。' },
    { name: '龙井虾仁', feature: '将龙井茶与河虾仁同炒，茶香与虾鲜完美融合，清新雅致。', reason: '杭帮菜的创意代表，体现了杭州精致的饮食文化。' },
    { name: '知味观小笼包', feature: '皮薄馅大，汤汁丰富，是杭州最有名的点心之一。', reason: '知味观是杭州百年老字号，小笼包是必点招牌，建议去总店品尝。' },
    { name: '片儿川', feature: '杭州特色面食，雪菜、笋片、瘦肉搭配面条，汤鲜味美。', reason: '杭州人的日常早餐，奎元馆的片儿川最为正宗，是老杭州的味道。' },
    { name: '葱包桧', feature: '将油条和小葱裹在春饼里烤制，外脆内软，蘸上甜面酱，风味独特。', reason: '杭州街头小吃，源自南宋时期，据说与秦桧有关，是杭州历史的一部分。' },
    { name: '定胜糕', feature: '粉色糯米糕点，内有豆沙馅，软糯香甜，是杭州传统糕点。', reason: '河坊街上随处可买，寓意吉祥，适合作为伴手礼。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>杭州萧山国际机场距市区约27公里，机场大巴、地铁1号线均可到达市区，车程约40分钟。</p>
<h3>高铁/火车</h3><p>杭州东站是主要高铁站，可直达上海（1小时）、北京（4.5小时）、南京（1.5小时）等城市。城站火车站位于西湖附近。</p>
<h3>市内交通</h3><p>杭州地铁覆盖主城区和主要景点。公交线路密集，票价2元。西湖景区内可骑行或乘坐游船。公共自行车遍布全市，非常便利。</p>`,
    accommodation: `<h3>西湖周边（最佳地段）</h3><p>步行可达西湖、断桥、苏堤。酒店和民宿众多，但价格较高。预算：400-1500元/晚。</p>
<h3>河坊街/南宋御街附近</h3><p>靠近美食街区，交通便利，经济型和中档酒店为主。预算：200-500元/晚。</p>
<h3>武林广场/延安路</h3><p>商业中心，购物方便，酒店选择丰富。预算：250-600元/晚。</p>`,
    bestTime: `<p>杭州最佳旅游时间为<strong>3-5月和9-11月</strong>。春季（3-5月）桃红柳绿，是西湖最美的季节；秋季（9-11月）桂花飘香，气候宜人。</p>
<p>夏季（7-8月）炎热多雨，但荷花开满西湖，别有韵味。冬季（12-2月）断桥残雪是难得的美景，但整体较冷。清明、国庆期间游客较多。</p>`,
    notes: `<ul><li>西湖景区免费开放，但部分景点（如三潭印月）需乘船前往</li><li>建议租一辆自行车环湖骑行，全程约15公里，是最惬意的游览方式</li><li>灵隐寺需先购买飞来峰景区门票，再购买灵隐寺门票</li><li>杭州春季多雨，建议携带雨具</li><li>河坊街和南宋御街是品尝杭州小吃的好去处</li><li>千岛湖距杭州市区约150公里，建议安排一整天</li></ul>`
  }
};

// ============ DALI ============
const dali = {
  attractions: [
    { name: '大理古城', intro: '始建于明洪武十五年，东临洱海，西枕苍山。城内青瓦白墙的白族民居错落有致，洋人街和人民路是文艺青年的聚集地。', ticket: '免费', time: '半天至一天' },
    { name: '洱海', intro: '大理的母亲湖，湖水清澈，环湖公路风景如画。可以骑行环洱海，也可以乘船游湖，在双廊看日落是绝佳体验。', ticket: '免费（游船另收费）', time: '一天' },
    { name: '苍山', intro: '大理的天然屏障，十九峰十八溪，景色壮丽。可乘坐索道上山，俯瞰洱海全景。清碧溪、七龙女池等景点各具特色。', ticket: '索道单程80-150元', time: '半天至一天' },
    { name: '双廊古镇', intro: '洱海边最美的小镇，面朝洱海，背靠苍山。杨丽萍的太阳宫和月亮宫就在这里，是摄影爱好者的天堂。', ticket: '免费', time: '半天' },
    { name: '喜洲古镇', intro: '白族建筑保存最完好的古镇，严家大院等百年老宅雕梁画栋。喜洲粑粑是当地特色美食，不可错过。', ticket: '免费（严家大院30元）', time: '半天' },
    { name: '崇圣寺三塔', intro: '大理的标志性建筑，始建于南诏国时期，距今已有一千多年历史。三塔倒影是大理最经典的画面。', ticket: '75元', time: '2-3小时' }
  ],
  food: [
    { name: '白族土八碗', feature: '白族传统宴席，八道热菜一道汤，荤素搭配，色香味俱全。', reason: '体验白族饮食文化的最佳方式，喜洲古镇的农家乐最为正宗。' },
    { name: '喜洲粑粑', feature: '白族特色面食，分甜咸两种口味，外酥里软，层次分明。', reason: '大理必吃小吃，喜洲古镇上的现烤粑粑最香，排队也值得等。' },
    { name: '乳扇', feature: '白族特色乳制品，用鲜牛奶制成薄片，可烤可炸可凉拌。', reason: '大理独有美食，烤乳扇蘸玫瑰酱是经典吃法，口感独特。' },
    { name: '饵丝/饵块', feature: '云南特色米制品，饵丝细如面条，饵块切成片炒制，口感软糯。', reason: '大理人的日常主食，搭配各种浇头，是感受云南味道的基础。' },
    { name: '凉鸡米线', feature: '米线搭配凉拌鸡肉丝、酸菜、花生碎等，酸辣爽口。', reason: '大理最受欢迎的小吃之一，再回首和色了木是口碑老店。' },
    { name: '烤乳猪', feature: '大理特色烧烤，整只乳猪烤至金黄酥脆，肉质鲜嫩多汁。', reason: '大理古城夜市的招牌美食，配上当地的梅子酒，是绝佳的夜宵搭配。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>大理机场距市区约13公里，有直飞昆明、成都、重庆、广州等城市的航班。机场大巴和出租车可到达古城。</p>
<h3>高铁/火车</h3><p>大理站位于市区南部，昆明到大理高铁约2小时。大理站到古城可乘坐8路公交。</p>
<h3>市内交通</h3><p>古城内步行为主。环洱海建议租电动车或自行车，全程约130公里，可分两天完成。古城到各景点有公交和旅游专线。</p>`,
    accommodation: `<h3>大理古城内</h3><p>民宿和客栈众多，白族风格建筑很有特色。靠近人民路和洋人街，夜生活丰富。预算：100-400元/晚。</p>
<h3>双廊古镇</h3><p>海景房是最大卖点，推开窗就能看到洱海。适合度假放松。预算：200-800元/晚。</p>
<h3>喜洲古镇</h3><p>更安静、更原生态，适合深度体验白族文化。预算：100-300元/晚。</p>`,
    bestTime: `<p>大理最佳旅游时间为<strong>3-5月和9-11月</strong>。春季（3-5月）天气晴朗，鲜花盛开；秋季（9-11月）天高云淡，是骑行环洱海的最佳时节。</p>
<p>6-8月为雨季，但雨后常有彩虹。冬季（12-2月）阳光充足但早晚较冷，是避寒的好去处。大理全年温差不大，四季如春。</p>`,
    notes: `<ul><li>大理紫外线强烈，防晒霜、墨镜、遮阳帽是必备品</li><li>环洱海骑行建议分两天，沿途补给充足</li><li>古城内部分路段禁止车辆通行，注意交通规则</li><li>苍山索道有三条线路，感通索道适合普通游客，洗马潭索道可到达最高点</li><li>大理昼夜温差大，建议携带外套</li><li>尊重白族文化习俗，进入寺庙不要大声喧哗</li></ul>`
  }
};

// ============ LIJIANG ============
const lijiang = {
  attractions: [
    { name: '丽江古城', intro: '世界文化遗产，始建于宋末元初，已有八百多年历史。古城内小桥流水，纳西族民居保存完好，夜景灯火辉煌，充满浪漫气息。', ticket: '古城维护费50元（部分景点需查验）', time: '一天' },
    { name: '玉龙雪山', intro: '北半球最南端的雪山，最高海拔5596米。冰川公园可近距离观赏万年冰川，蓝月谷湖水湛蓝如宝石，是丽江最震撼的自然景观。', ticket: '100元+大索道120元', time: '一天' },
    { name: '泸沽湖', intro: '高原淡水湖，湖水清澈见底，被誉为"高原明珠"。摩梭人的走婚文化独特神秘，猪槽船、里格半岛是必打卡景点。', ticket: '70元', time: '1-2天' },
    { name: '束河古镇', intro: '比丽江古城更安静的古镇，曾是茶马古道上的重要驿站。这里保留了更原始的纳西族生活方式，适合悠闲漫步。', ticket: '免费', time: '半天' },
    { name: '拉市海', intro: '丽江城郊的高原湖泊，冬季有大量候鸟栖息。可以骑马走茶马古道、划船观鸟，是体验纳西族田园生活的好去处。', ticket: '30元', time: '半天' },
    { name: '蓝月谷', intro: '位于玉龙雪山脚下，湖水因含铜离子而呈现梦幻般的蓝色。白水河、蓝月谷相连，是拍摄雪山倒影的绝佳地点。', ticket: '含在玉龙雪山景区内', time: '1-2小时' },
    { name: '木府', intro: '纳西族土司的宫殿，有"北有故宫，南有木府"之称。建筑宏伟壮观，是了解纳西族历史文化的最佳场所。', ticket: '40元', time: '1-2小时' }
  ],
  food: [
    { name: '腊排骨火锅', feature: '用腌制风干的腊排骨炖煮，汤底浓郁，配上各种蔬菜，鲜香醇厚。', reason: '丽江最具代表性的美食，钰洁腊排骨和滇厨餐厅口碑极佳。' },
    { name: '鸡豆凉粉', feature: '用鸡豆磨粉制成，凉拌或油炸均可，口感滑嫩，酸辣开胃。', reason: '纳西族传统小吃，丽江古城内随处可买，是解暑佳品。' },
    { name: '丽江粑粑', feature: '纳西族传统面食，分甜咸两种，层层酥脆，油香四溢。', reason: '丽江古城的特色小吃，搭配酥油茶是纳西族的传统早餐。' },
    { name: '三文鱼（虹鳟鱼）', feature: '丽江雪山融水养殖的虹鳟鱼，肉质鲜嫩，可做刺身、火锅或烧烤。', reason: '丽江特色美食，沱江鱼府的三文鱼火锅是游客必打卡的餐厅。' },
    { name: '纳西烤肉', feature: '用五花肉腌制后炭火烤制，外焦里嫩，配上薄荷叶和辣椒面，风味独特。', reason: '丽江古城夜市的热门美食，配上当地的青梅酒，是绝佳的夜晚搭配。' },
    { name: '酥油茶', feature: '藏族和纳西族的传统饮品，用砖茶、酥油和盐打制而成，咸香浓郁。', reason: '高原必备饮品，既能御寒又能补充体力，初尝可能不习惯但值得体验。' },
    { name: '米灌肠', feature: '将猪血和糯米灌入猪肠中蒸熟，切片煎至金黄，外脆内糯。', reason: '纳西族传统美食，古城内的小吃摊可以买到，是独特的民族风味。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>丽江三义国际机场距市区约28公里，有直飞昆明、成都、重庆、北京、上海等城市的航班。机场大巴和出租车可到达古城。</p>
<h3>高铁/火车</h3><p>丽江站位于市区南部，昆明到丽江火车约3-4小时（动车约2小时）。火车站到古城可乘坐公交或出租车。</p>
<h3>市内交通</h3><p>古城内步行为主。去玉龙雪山、拉市海等景点可包车或参加一日游。去泸沽湖建议包车或乘坐班车，车程约4-5小时。</p>`,
    accommodation: `<h3>丽江古城内（首选）</h3><p>纳西风格客栈众多，环境优美，夜生活丰富。推荐住在四方街附近。预算：150-500元/晚。</p>
<h3>束河古镇</h3><p>比古城更安静，适合喜欢清净的游客。客栈性价比高。预算：100-300元/晚。</p>
<h3>泸沽湖畔</h3><p>里格半岛和大落水村是主要住宿区，湖景房是首选。预算：200-600元/晚。</p>`,
    bestTime: `<p>丽江最佳旅游时间为<strong>4-5月和9-10月</strong>。春季（4-5月）百花盛开，天气晴朗；秋季（9-10月）天高气爽，是观赏雪山的最佳时节。</p>
<p>6-8月为雨季，但雨后空气清新。冬季（12-2月）阳光充足但气温较低，是淡季，酒店价格便宜。泸沽湖最美的季节是6-9月。</p>`,
    notes: `<ul><li>丽江海拔约2400米，刚到时注意休息，避免剧烈运动</li><li>玉龙雪山海拔4680米，建议提前购买氧气瓶，有高反风险</li><li>古城内酒吧较多，深夜可能较吵，选择住宿时注意位置</li><li>泸沽湖海拔约2700米，紫外线强烈，做好防晒</li><li>丽江古城维护费在部分景点需要查验，建议保留票据</li><li>拉市海骑马注意选择正规马场，避免被宰</li></ul>`
  }
};

// ============ XIAMEN ============
const xiamen = {
  attractions: [
    { name: '鼓浪屿', intro: '世界文化遗产，素有"海上花园"之称。岛上万国建筑风格各异，日光岩是最高点可俯瞰全岛。钢琴博物馆和风琴博物馆展示了浓厚的音乐文化底蕴。', ticket: '免费（上岛船票35-60元）', time: '一天' },
    { name: '南普陀寺', intro: '闽南佛教胜地，始建于唐代，依山而建，气势恢宏。寺后的五老峰是俯瞰厦门大学和厦门港的绝佳位置。', ticket: '免费', time: '2小时' },
    { name: '厦门大学', intro: '被誉为"中国最美大学"之一，嘉庚风格建筑与南洋风情完美融合。芙蓉湖、芙蓉隧道涂鸦墙是网红打卡地。', ticket: '免费（需预约）', time: '2小时' },
    { name: '曾厝垵', intro: '厦门最文艺的渔村，如今已变成美食和文创街区。各种海鲜小吃、手工艺品店、文艺咖啡馆遍布其中。', ticket: '免费', time: '2-3小时' },
    { name: '环岛路', intro: '沿海而建的城市道路，全长约31公里，被誉为"世界最美马拉松赛道"。骑行或漫步在海边，欣赏无敌海景。', ticket: '免费', time: '2-3小时' },
    { name: '中山路步行街', intro: '厦门最繁华的商业街，骑楼建筑风格独特。这里汇集了各种厦门特色小吃和老字号店铺，是购物和品尝美食的好去处。', ticket: '免费', time: '2-3小时' },
    { name: '胡里山炮台', intro: '清光绪年间修建的海防炮台，保存有世界最大的海岸炮——克虏伯大炮。炮台依山临海，是了解厦门海防历史的重要场所。', ticket: '25元', time: '1-2小时' }
  ],
  food: [
    { name: '沙茶面', feature: '厦门最具代表性的面食，沙茶酱汤底浓郁鲜香，配上豆腐、鱿鱼、大肠等配料。', reason: '来厦门必吃的第一道美食，乌糖沙茶面和月华沙茶面是公认的顶级老店。' },
    { name: '海蛎煎', feature: '用新鲜海蛎搭配地瓜粉和鸡蛋煎制，外酥里嫩，蘸上甜辣酱更美味。', reason: '闽南经典小吃，中山路和曾厝垵随处可买，现做现吃最香。' },
    { name: '姜母鸭', feature: '用老姜和麻油炖煮的鸭肉，汤汁浓郁，姜香四溢，有温补功效。', reason: '厦门冬季必吃美食，灌口姜母鸭和阿杰姜母鸭是本地人推荐的老店。' },
    { name: '土笋冻', feature: '用海蚯蚓（沙虫）熬制的胶冻，晶莹剔透，配上酱油、醋和蒜泥，口感Q弹。', reason: '厦门最有特色的小吃之一，虽然食材特殊但味道鲜美，是胆量和味蕾的双重挑战。' },
    { name: '花生汤', feature: '用花生仁慢火炖煮至酥烂，加入白糖调味，汤汁浓稠，花生入口即化。', reason: '厦门经典甜品，黄则和花生汤是百年老店，是老厦门人的早餐标配。' },
    { name: '烧肉粽', feature: '用糯米包裹五花肉、香菇、虾仁等馅料，蒸煮后蘸甜辣酱食用，口感丰富。', reason: '厦门传统节日食品，1980烧肉粽是网红店铺，排队也要尝一尝。' },
    { name: '厦门薄饼（春卷）', feature: '薄如蝉翼的面皮包裹各种蔬菜丝和肉丝，清爽可口，是闽南传统美食。', reason: '厦门人清明节必吃的食物，阿卿薄饼是百年老店，皮薄馅足味道好。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>厦门高崎国际机场距市区约10公里，是国内最方便的机场之一。机场大巴、BRT快速公交和出租车均可到达市区，车程约20分钟。</p>
<h3>高铁/火车</h3><p>厦门站位于市中心，厦门北站位于集美区。从福州到厦门高铁约1.5小时，从深圳约3.5小时。</p>
<h3>市内交通</h3><p>BRT快速公交系统覆盖主要区域。公交线路密集，票价1-2元。去鼓浪屿需到东渡邮轮中心或轮渡码头乘船。环岛路可骑行共享单车。</p>`,
    accommodation: `<h3>中山路/轮渡码头附近</h3><p>靠近鼓浪屿码头和中山路步行街，出行方便。酒店和民宿选择丰富。预算：200-600元/晚。</p>
<h3>曾厝垵</h3><p>文艺民宿集中区域，靠近海边和厦门大学。适合年轻人和文艺爱好者。预算：150-400元/晚。</p>
<h3>鼓浪屿岛上</h3><p>岛上酒店和民宿环境优美，但价格较高。建议住一晚感受夜晚的鼓浪屿。预算：300-1000元/晚。</p>`,
    bestTime: `<p>厦门最佳旅游时间为<strong>3-5月和10-12月</strong>。春季（3-5月）气候温和，凤凰花开；秋季（10-12月）天高气爽，是户外活动的好时节。</p>
<p>夏季（7-9月）较热且有台风风险，但海滨风光最美。冬季（12-2月）温暖如春，是北方游客避寒的好去处。鼓浪屿全年适合游览。</p>`,
    notes: `<ul><li>鼓浪屿船票需提前在网上购买，旺季当天可能买不到票</li><li>厦门大学需提前在"U厦大"小程序预约，每天限流</li><li>中山路小吃价格较高，建议深入巷子寻找性价比更高的店铺</li><li>厦门夏季多台风，出行前关注天气预报</li><li>环岛路骑行建议傍晚时分，可以欣赏日落</li><li>土笋冻等特色小吃可能不适合所有人，量力而行</li></ul>`
  }
};

// ============ QINGDAO ============
const qingdao = {
  attractions: [
    { name: '栈桥', intro: '青岛的标志性建筑，始建于1892年，全长440米，尽头的回澜阁是观赏海景的绝佳位置。栈桥两侧是第六海水浴场，是青岛最具历史底蕴的景点。', ticket: '免费', time: '1-2小时' },
    { name: '八大关', intro: '中国最美的城区之一，汇集了20多个国家的建筑风格，被称为"万国建筑博览会"。春有碧桃，夏有紫薇，秋有红枫，四季皆美。', ticket: '免费', time: '2-3小时' },
    { name: '崂山', intro: '中国海岸线第一高峰，海拔1132.7米。山海相连，景色壮丽。太清宫是崂山最著名的道观，仰口景区可观赏海上日出。', ticket: '南线90元，北线60元', time: '一天' },
    { name: '青岛啤酒博物馆', intro: '利用百年德国老厂房改建，展示了青岛啤酒的百年历史。参观结束后可品尝新鲜的原浆啤酒和啤酒豆。', ticket: '60元', time: '2小时' },
    { name: '信号山公园', intro: '位于老城区中心，山顶的三个红色蘑菇楼是青岛的标志之一。旋转观景台可360度俯瞰红瓦绿树、碧海蓝天的青岛全景。', ticket: '15元', time: '1-2小时' },
    { name: '金沙滩', intro: '青岛最美的沙滩，沙质细腻金黄，海水清澈。每年夏季举办的金沙滩啤酒节是青岛最热闹的活动之一。', ticket: '免费', time: '半天' },
    { name: '天主教堂', intro: '青岛最大的哥特式建筑，始建于1932年，双塔高56米。教堂内部彩绘玻璃窗精美绝伦，是青岛最具异域风情的建筑。', ticket: '10元', time: '1小时' }
  ],
  food: [
    { name: '青岛啤酒+海鲜', feature: '用塑料袋打散啤是青岛人的日常，配上辣炒蛤蜊、烤鱿鱼等海鲜，是最地道的青岛味道。', reason: '来青岛不喝散啤、不吃海鲜等于白来。营口路啤酒街是最热闹的地方。' },
    { name: '辣炒蛤蜊', feature: '新鲜蛤蜊爆炒，配上辣椒和蒜末，鲜香麻辣，是青岛人最爱的下酒菜。', reason: '青岛餐桌上的必点菜，配上一杯散啤，是夏夜最惬意的享受。' },
    { name: '排骨米饭', feature: '大块排骨炖至酥烂，配上白米饭和青菜，汤汁浓郁，是青岛人的家常便饭。', reason: '青岛特色快餐，万和春排骨米饭是连锁品牌，性价比极高。' },
    { name: '海菜凉粉', feature: '用石花菜熬制的凉粉，配上蒜泥、醋和辣椒油，清凉爽口。', reason: '青岛夏季消暑美食，海边小摊和餐馆均有供应，是青岛独有的味道。' },
    { name: '烤鱿鱼', feature: '新鲜鱿鱼现烤，刷上特制酱料，外焦里嫩，香气扑鼻。', reason: '青岛街头最常见的小吃，中山路和台东夜市的烤鱿鱼最为正宗。' },
    { name: '流亭猪蹄', feature: '卤制的猪蹄，肉质软烂入味，胶原蛋白丰富，是青岛传统名吃。', reason: '周钦公流亭猪蹄是百年老字号，是青岛人逢年过节必备的美食。' },
    { name: '锅贴', feature: '底部煎至金黄酥脆，内馅鲜嫩多汁，是青岛版的煎饺。', reason: '青岛的锅贴个头大、馅料足，小倩倩锅贴和船歌鱼水饺都是热门选择。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>青岛胶东国际机场距市区约39公里，机场大巴和地铁8号线可到达市区，车程约1小时。</p>
<h3>高铁/火车</h3><p>青岛站位于栈桥附近，是最方便的火车站。青岛北站位于李沧区。从北京到青岛高铁约3小时，从上海约4小时。</p>
<h3>市内交通</h3><p>青岛地铁已开通多条线路，覆盖主要景点。公交线路密集，票价1-2元。老城区道路起伏较大，建议步行或乘坐公交。去崂山可乘坐旅游专线。</p>`,
    accommodation: `<h3>栈桥/中山路附近（老城区）</h3><p>靠近栈桥、天主教堂、劈柴院等景点，老城区风情浓厚。预算：200-500元/晚。</p>
<h3>八大关/太平角</h3><p>环境优美，靠近海边，别墅式酒店和民宿众多。预算：300-800元/晚。</p>
<h3>五四广场/奥帆中心</h3><p>新城区中心，靠近海边和商业区，高档酒店集中。预算：400-1000元/晚。</p>`,
    bestTime: `<p>青岛最佳旅游时间为<strong>5-10月</strong>。夏季（7-8月）是海滨旅游的黄金期，可以游泳、喝啤酒、参加啤酒节。</p>
<p>秋季（9-10月）天高气爽，海鲜最为肥美。春季（4-5月）花开满城，气候温和。冬季（12-2月）较冷，但可以欣赏海鸥和冬季海景。7-8月为旅游旺季，建议提前预订住宿。</p>`,
    notes: `<ul><li>青岛夏季多雾，海边风大，建议携带外套</li><li>栈桥附近海鲜排档价格较高，建议去营口路啤酒街或闽江路美食街</li><li>崂山分南线和北线，南线（太清-仰口）风景更好，建议安排一整天</li><li>八大关适合步行或骑行，不建议开车进入</li><li>青岛啤酒节通常在8月举行，是青岛最热闹的活动</li><li>金沙滩位于黄岛区，需要过海底隧道或跨海大桥</li></ul>`
  }
};

// ============ GUILIN ============
const guilin = {
  attractions: [
    { name: '漓江', intro: '桂林山水的灵魂，从桂林到阳朔的83公里漓江风光是世界上规模最大、风景最美的岩溶山水游览区。九马画山、黄布倒影等景点如诗如画。', ticket: '漓江游船210-320元', time: '4-5小时' },
    { name: '阳朔西街', intro: '阳朔最繁华的商业街，已有1400多年历史。中西文化在这里交融，酒吧、餐厅、手工艺品店林立，夜晚灯火辉煌，充满异国情调。', ticket: '免费', time: '半天至一天' },
    { name: '龙脊梯田', intro: '始建于元代，距今已有700年历史。层层叠叠的梯田从山脚盘绕到山顶，壮丽恢弘。金坑大寨和平安寨是最主要的观景点。', ticket: '80元', time: '一天' },
    { name: '象鼻山', intro: '桂林的城徽，因山形酷似一头伸鼻饮水的大象而得名。水月洞是象鼻与象身之间的圆洞，江水穿洞而过，构成"象山水月"的奇景。', ticket: '免费', time: '1小时' },
    { name: '遇龙河', intro: '漓江在阳朔境内最长的支流，被称为"小漓江"。乘坐竹筏漂流，两岸田园风光如画，比漓江更加宁静清幽。', ticket: '竹筏漂流约200元/筏', time: '半天' },
    { name: '银子岩', intro: '桂林最大的岩溶洞穴，洞内钟乳石晶莹剔似银子般闪烁。音乐石屏、瑶池仙境等景点让人叹为观止。', ticket: '65元', time: '2小时' },
    { name: '两江四湖', intro: '桂林市区的环城水系，乘船夜游可欣赏到日月双塔、玻璃桥等景点的灯光秀。是感受桂林城市夜景的最佳方式。', ticket: '夜游190元', time: '2小时' }
  ],
  food: [
    { name: '桂林米粉', feature: '用大米磨浆制成的细粉，配上卤水和各种配料，是桂林人每天的早餐首选。', reason: '来桂林必吃的第一道美食，崇善米粉和日头火米粉是本地人推荐的老店。' },
    { name: '啤酒鱼', feature: '阳朔特色菜，用漓江鲜鱼搭配啤酒炖煮，鱼肉鲜嫩，汤汁浓郁。', reason: '阳朔第一名菜，大师傅啤酒鱼和谢大姐啤酒鱼是最受欢迎的餐厅。' },
    { name: '荔浦芋扣肉', feature: '用荔浦芋头和五花肉层层叠放蒸制，芋头软糯，肉质酥烂，是桂林传统名菜。', reason: '桂林宴席上的必备菜，荔浦芋头品质最佳，口感粉糯香甜。' },
    { name: '田螺酿', feature: '将猪肉馅塞入田螺壳中烹制，是桂林十八酿之一，味道鲜美。', reason: '桂林酿菜文化的代表，还有豆腐酿、辣椒酿等多种选择，是独特的桂林风味。' },
    { name: '油茶', feature: '用茶叶、花生、米花等原料打制的饮品，咸香浓郁，是桂北地区的传统饮品。', reason: '桂林人的日常饮品，恭城油茶最为正宗，配上炒米和花生更美味。' },
    { name: '马蹄糕', feature: '用荸荠粉制成的糕点，晶莹剔透，口感Q弹，甜而不腻。', reason: '桂林传统甜品，街头小摊和早餐店均有供应，是桂林人童年的味道。' },
    { name: '全州醋血鸭', feature: '用鸭血和醋炖煮的鸭肉，酸辣鲜香，是桂林全州县的特色菜。', reason: '桂林地方名菜，口味独特，喜欢尝鲜的游客不要错过。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>桂林两江国际机场距市区约28公里，有直飞北京、上海、广州、成都等城市的航班。机场大巴和出租车可到达市区，车程约40分钟。</p>
<h3>高铁/火车</h3><p>桂林站和桂林北站均有高铁，从广州到桂林高铁约2.5小时，从长沙约3小时。桂林到阳朔可乘高铁或汽车。</p>
<h3>市内交通</h3><p>桂林市区不大，公交线路覆盖主要景点。去阳朔可乘坐汽车（约1.5小时）或高铁。去龙脊梯田建议包车或参加一日游，车程约2小时。</p>`,
    accommodation: `<h3>桂林市中心（象山区/秀峰区）</h3><p>靠近象鼻山、两江四湖等景点，酒店选择丰富。预算：200-500元/晚。</p>
<h3>阳朔西街附近</h3><p>夜生活丰富，靠近遇龙河和各景点。民宿和客栈众多。预算：150-400元/晚。</p>
<h3>龙脊梯田（金坑/平安寨）</h3><p>住在梯田中的吊脚楼民宿，清晨看日出云海，是独特的体验。预算：100-300元/晚。</p>`,
    bestTime: `<p>桂林最佳旅游时间为<strong>4-10月</strong>。春季（4-5月）烟雨漓江，如水墨画般美丽；秋季（9-10月）天高气爽，龙脊梯田金黄一片。</p>
<p>夏季（6-8月）是漓江水量最充沛的时节，但天气炎热且偶有暴雨。冬季（12-2月）游客少，但漓江水位较低，部分竹筏可能停运。国庆期间为旅游旺季。</p>`,
    notes: `<ul><li>漓江游船建议提前在官网预订，选择竹江码头出发的正规游船</li><li>阳朔租电动车游玩更方便，但注意交通安全</li><li>龙脊梯田建议穿防滑鞋，山路较陡</li><li>桂林米粉建议先吃粉再喝汤，这是当地人的吃法</li><li>遇龙河漂流选择金龙桥到旧县段，风景最美</li><li>雨季出行需关注天气，漓江水位过高时游船可能停航</li></ul>`
  }
};

// ============ LHASA ============
const lhasa = {
  attractions: [
    { name: '布达拉宫', intro: '世界上海拔最高的宫殿，始建于公元7世纪，是藏传佛教的圣地。宫殿依山而建，气势恢宏，内部收藏了大量珍贵文物和佛像。', ticket: '200元（旺季需提前预约）', time: '3-4小时' },
    { name: '大昭寺', intro: '藏传佛教最神圣的寺庙，始建于唐代，寺内供奉着文成公主带入西藏的释迦牟尼12岁等身像。八廓街环绕大昭寺，是拉萨最古老的转经道。', ticket: '85元', time: '2-3小时' },
    { name: '八廓街', intro: '拉萨最古老的街道，围绕大昭寺形成的转经道。街道两旁商铺林立，售卖唐卡、藏香、绿松石等藏族特色商品，是感受藏族文化的最佳场所。', ticket: '免费', time: '2-3小时' },
    { name: '色拉寺', intro: '拉萨三大寺之一，以辩经活动闻名。每天下午3点的辩经场面震撼，僧人们击掌辩论，场面壮观，是了解藏传佛教文化的重要窗口。', ticket: '50元', time: '2-3小时' },
    { name: '纳木错', intro: '世界上海拔最高的大型湖泊，湖水碧蓝如宝石，与远处的念青唐古拉山相映成辉。扎西半岛是最佳观景点，日出日落美不胜收。', ticket: '120元', time: '一天' },
    { name: '哲蚌寺', intro: '拉萨三大寺之一，曾是全世界最大的寺庙，鼎盛时期有僧侣上万人。每年雪顿节的晒佛仪式在这里举行，场面壮观。', ticket: '50元', time: '2-3小时' },
    { name: '罗布林卡', intro: '达赖喇嘛的夏宫，是西藏规模最大、风景最佳的人造园林。园内古树参天，宫殿建筑精美，是了解藏族园林艺术的好去处。', ticket: '60元', time: '2小时' }
  ],
  food: [
    { name: '酥油茶', feature: '藏族传统饮品，用砖茶、酥油和盐打制而成，咸香浓郁，是高原必备的御寒饮品。', reason: '来西藏必喝的第一口饮品，既能御寒又能缓解高原反应，光明港琼甜茶馆最有氛围。' },
    { name: '甜茶', feature: '用红茶、牛奶和糖熬制，口感类似奶茶，是拉萨人最爱的日常饮品。', reason: '拉萨甜茶馆是社交场所，一壶甜茶、一盘藏面，就是拉萨人的午后时光。' },
    { name: '藏面', feature: '用青稞面或小麦面制成，配上牦牛肉汤，面条劲道，汤底鲜美。', reason: '拉萨人的主食之一，搭配甜茶是经典的拉萨早餐组合。' },
    { name: '糌粑', feature: '藏族传统主食，将青稞粉与酥油茶混合捏制而成，口感独特。', reason: '来西藏一定要体验的民族食物，虽然味道需要适应，但这是藏族文化的重要组成部分。' },
    { name: '牦牛肉', feature: '高原牦牛肉质紧实，脂肪含量低，可做风干肉、卤肉或火锅。', reason: '西藏特色食材，风干牦牛肉是最佳伴手礼，牦牛肉火锅是冬季暖身的好选择。' },
    { name: '藏式酸奶', feature: '用牦牛奶发酵制成，浓稠酸爽，配上白糖或蜂蜜食用。', reason: '拉萨街头随处可买，布达拉宫脚下的酸奶坊最受游客欢迎。' },
    { name: '青稞酒', feature: '用青稞酿制的传统酒类，酒精度低，口感酸甜，是藏族节庆必备饮品。', reason: '来西藏一定要品尝的民族饮品，虽然度数不高但也要适量，高原上更容易醉。' }
  ],
  guide: {
    transport: `<h3>飞机</h3><p>拉萨贡嘎国际机场距市区约60公里，有直飞北京、上海、成都、重庆等城市的航班。机场大巴可到达市区，车程约1小时。</p>
<h3>火车</h3><p>青藏铁路连接西宁与拉萨，全程约21小时。从北京、上海、广州等城市可乘坐直达列车。火车是适应高原反应的最佳方式。</p>
<h3>市内交通</h3><p>拉萨市区不大，出租车起步价10元。公交线路覆盖主要景点。去纳木错建议包车或参加一日游，车程约4-5小时。</p>`,
    accommodation: `<h3>八廓街/大昭寺附近（最佳地段）</h3><p>步行可达大昭寺、八廓街、布达拉宫。民宿和酒店众多，感受浓厚的藏族氛围。预算：200-600元/晚。</p>
<h3>布达拉宫附近</h3><p>靠近布达拉宫和罗布林卡，出行方便。中高档酒店为主。预算：300-800元/晚。</p>
<h3>仙足岛/太阳岛</h3><p>拉萨河畔，环境安静，适合休息调整。预算：150-400元/晚。</p>`,
    bestTime: `<p>拉萨最佳旅游时间为<strong>6-10月</strong>。夏季（6-8月）气候温和，氧气充足，是最适合游览的季节。秋季（9-10月）天高气爽，景色壮美。</p>
<p>冬季（11月-次年2月）气温较低但阳光充足，游客少，酒店价格便宜。春季（3-5月）风沙较大。雪顿节（通常在8月）是拉萨最盛大的节日，值得体验。</p>`,
    notes: `<ul><li>拉萨海拔3650米，初到高原注意休息，避免剧烈运动，建议提前服用红景天</li><li>布达拉宫每日限流，旺季需提前7天在官网预约</li><li>尊重藏族文化习俗，寺庙内不要拍照，转经要顺时针方向</li><li>高原紫外线极强，防晒霜SPF50+是必备品</li><li>纳木错海拔4718米，容易高反，建议在拉萨适应1-2天后再前往</li><li>进入寺庙不要戴帽子和太阳镜，不要触摸佛像</li><li>携带身份证，布达拉宫和部分景点需要实名验证</li></ul>`
  }
};

// ============ Generate HTML ============

function genAttractionsHTML(cityId, cityName, cityDesc, items) {
  const cards = items.map((a, i) => `
    <div style="background:#f9fafb;border-radius:12px;padding:24px;border:1px solid #e5e7eb;">
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:8px;color:#111827;">${i+1}. ${a.name}</h2>
      <p style="color:#374151;line-height:1.8;margin-bottom:12px;">${a.intro}</p>
      <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:.875rem;color:#6b7280;">
        <span>🎫 门票：<strong style="color:#059669;">${a.ticket}</strong></span>
        <span>⏰ 建议游玩：<strong>${a.time}</strong></span>
      </div>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cityName}景点推荐 - ${cityName}旅游攻略</title>
<meta name="description" content="${cityName}最值得去的景点推荐：精选${cityName}必玩景点，附详细攻略、门票、交通信息。${cityDesc}">
<meta name="keywords" content="${cityName}景点,${cityName}旅游,${cityName}攻略">
<meta name="author" content="全国旅游攻略">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="https://www.all-lv.com/city/${cityId}/attractions">
<meta property="og:title" content="${cityName}景点推荐 - ${cityName}旅游攻略">
<meta property="og:description" content="${cityName}最值得去的景点推荐">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.all-lv.com/city/${cityId}/attractions">
<meta property="og:site_name" content="全国旅游攻略">
<link rel="stylesheet" href="../../style.css">
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner"><a href="/" class="nav-logo">全国旅游攻略</a><ul class="nav-links" id="navLinks"><li><a href="/">首页</a></li><li><a href="/city/${cityId}">${cityName}</a></li><li><a href="/city/${cityId}/attractions">景点</a></li><li><a href="/city/${cityId}/food">美食</a></li><li><a href="/city/${cityId}/guide">攻略</a></li></ul><button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button></div></nav>
<main class="container" style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <nav class="breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:24px;"><a href="/">首页</a> / <a href="/city/${cityId}">${cityName}</a> / <span>景点推荐</span></nav>
  <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">${cityName}景点推荐</h1>
  <p style="color:#6b7280;margin-bottom:32px;">${cityDesc}</p>
  <div style="display:grid;gap:24px;">${cards}
  </div>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 全国旅游攻略 · <a href="/sitemap.xml">网站地图</a></p></div></footer>
<script>window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});</script>
</body>
</html>`;
}

function genFoodHTML(cityId, cityName, cityDesc, items) {
  const cards = items.map((f, i) => `
    <div style="background:#fefce8;border-radius:12px;padding:24px;border:1px solid #fde68a;">
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:8px;color:#111827;">${i+1}. ${f.name}</h2>
      <p style="color:#374151;line-height:1.8;margin-bottom:8px;"><strong>特色：</strong>${f.feature}</p>
      <p style="color:#059669;line-height:1.8;font-size:.9rem;">💡 ${f.reason}</p>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cityName}美食攻略 - ${cityName}旅游</title>
<meta name="description" content="${cityName}必吃美食推荐：特色小吃、网红餐厅、本地人私藏好店。">
<meta name="keywords" content="${cityName}美食,${cityName}小吃,${cityName}餐厅,${cityName}特色菜">
<link rel="canonical" href="https://www.all-lv.com/city/${cityId}/food">
<link rel="stylesheet" href="../../style.css">
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner"><a href="/" class="nav-logo">全国旅游攻略</a><ul class="nav-links" id="navLinks"><li><a href="/">首页</a></li><li><a href="/city/${cityId}">${cityName}</a></li><li><a href="/city/${cityId}/attractions">景点</a></li><li><a href="/city/${cityId}/food">美食</a></li><li><a href="/city/${cityId}/guide">攻略</a></li></ul><button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button></div></nav>
<main class="container" style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <nav class="breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:24px;"><a href="/">首页</a> / <a href="/city/${cityId}">${cityName}</a> / <span>美食攻略</span></nav>
  <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">${cityName}美食攻略</h1>
  <p style="color:#6b7280;margin-bottom:32px;">${cityName}必吃美食推荐，特色小吃、网红餐厅一网打尽。</p>
  <div style="display:grid;gap:24px;">${cards}
  </div>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 全国旅游攻略</p></div></footer>
<script>window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});</script>
</body>
</html>`;
}

function genGuideHTML(cityId, cityName, cityDesc, cityInfo) {
  const g = cityInfo.data.guide;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cityName}旅游攻略 - 交通/住宿/最佳时间</title>
<meta name="description" content="${cityName}旅游全攻略：交通指南、住宿推荐、最佳旅游时间、行程规划。">
<link rel="canonical" href="https://www.all-lv.com/city/${cityId}/guide">
<link rel="stylesheet" href="../../style.css">
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner"><a href="/" class="nav-logo">全国旅游攻略</a><ul class="nav-links" id="navLinks"><li><a href="/">首页</a></li><li><a href="/city/${cityId}">${cityName}</a></li><li><a href="/city/${cityId}/attractions">景点</a></li><li><a href="/city/${cityId}/food">美食</a></li><li><a href="/city/${cityId}/guide">攻略</a></li></ul><button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button></div></nav>
<main class="container" style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <nav class="breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:24px;"><a href="/">首页</a> / <a href="/city/${cityId}">${cityName}</a> / <span>旅游攻略</span></nav>
  <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">${cityName}旅游攻略</h1>
  <p style="color:#6b7280;margin-bottom:32px;">${cityDesc}</p>
  
  <section style="margin-bottom:32px;">
    <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">📍 最佳旅游时间</h2>
    ${g.bestTime}
  </section>
  
  <section style="margin-bottom:32px;">
    <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">📅 建议游玩天数</h2>
    <p>${cityInfo.suggestedDays || '3-4天'}</p>
  </section>
  
  <section style="margin-bottom:32px;">
    <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">🚄 交通指南</h2>
    ${g.transport}
  </section>
  
  <section style="margin-bottom:32px;">
    <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">🏨 住宿推荐</h2>
    ${g.accommodation}
  </section>
  
  <section style="margin-bottom:32px;">
    <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">⚠️ 注意事项</h2>
    ${g.notes}
  </section>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 全国旅游攻略</p></div></footer>
<script>window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});</script>
</body>
</html>`;
}

// ============ Main ============
const allCities = [
  { id: 'sanya', name: '三亚', data: sanya, desc: '三亚是中国最南端的热带滨海旅游城市，拥有亚龙湾、天涯海角、南山寺等著名景点，是国内外知名的度假胜地。', suggestedDays: '4-5天' },
  { id: 'chengdu', name: '成都', data: chengdu, desc: '成都是四川省会，以大熊猫、火锅、茶馆文化闻名。武侯祠、锦里、宽窄巷子、都江堰等景点吸引着无数游客。', suggestedDays: '3-4天' },
  { id: 'xian', name: '西安', data: xian, desc: '西安是十三朝古都，兵马俑、大雁塔、城墙、回民街等景点承载着厚重的历史文化。', suggestedDays: '3-4天' },
  { id: 'hangzhou', name: '杭州', data: hangzhou, desc: '杭州以西湖闻名天下，灵隐寺、千岛湖、宋城等景点让这座城市充满诗意与历史韵味。', suggestedDays: '3-4天' },
  { id: 'dali', name: '大理', data: dali, desc: '大理以苍山洱海、古城、白族文化著称，是文艺青年和背包客的理想目的地。', suggestedDays: '3-4天' },
  { id: 'lijiang', name: '丽江', data: lijiang, desc: '丽江古城是世界文化遗产，玉龙雪山、泸沽湖、束河古镇等景点让丽江成为最受欢迎的旅游目的地之一。', suggestedDays: '3-5天' },
  { id: 'xiamen', name: '厦门', data: xiamen, desc: '厦门是著名的海滨城市，鼓浪屿、南普陀寺、曾厝垵、环岛路等景点充满文艺气息。', suggestedDays: '3-4天' },
  { id: 'qingdao', name: '青岛', data: qingdao, desc: '青岛是著名的海滨城市，栈桥、八大关、崂山、啤酒节等让青岛充满独特的魅力。', suggestedDays: '3-4天' },
  { id: 'guilin', name: '桂林', data: guilin, desc: '桂林以漓江山水闻名，阳朔、龙脊梯田、象鼻山等景点构成了如诗如画的桂林风光。', suggestedDays: '3-5天' },
  { id: 'lhasa', name: '拉萨', data: lhasa, desc: '拉萨是藏传佛教圣地，布达拉宫、大昭寺、八廓街等景点让人感受到浓厚的宗教氛围和高原文化。', suggestedDays: '4-5天' }
];

for (const city of allCities) {
  const cityDir = path.join(citiesDir, city.id);
  
  // Write attractions
  const attractionsHTML = genAttractionsHTML(city.id, city.name, city.desc, city.data.attractions);
  fs.writeFileSync(path.join(cityDir, 'attractions.html'), attractionsHTML, 'utf8');
  
  // Write food
  const foodHTML = genFoodHTML(city.id, city.name, city.desc, city.data.food);
  fs.writeFileSync(path.join(cityDir, 'food.html'), foodHTML, 'utf8');
  
  // Write guide
  const guideHTML = genGuideHTML(city.id, city.name, city.desc, city);
  fs.writeFileSync(path.join(cityDir, 'guide.html'), guideHTML, 'utf8');
  
  console.log(`✅ ${city.name} (${city.id}) - 3 files written`);
}

console.log('\n🎉 All 10 cities done! (30 files total)');
