#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在 data/cities.json 中插入秦皇岛(qinhuangdao)完整数据。
字段结构与现有城市(如青岛)完全对齐：顶层 + attractions(9) + food(6) + guide(4) + itinerary(3) + blogs(3)。
若已存在则跳过。image/detail 等抓取字段留空，由 _add_qinhuangdao.py 补充。
"""
import os, json

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")

def main():
    d = json.load(open(DATA, encoding="utf-8"))
    if any(c["id"] == "qinhuangdao" for c in d["cities"]):
        print("秦皇岛已存在，跳过插入")
        return

    qhd = {
        "id": "qinhuangdao",
        "name": "秦皇岛",
        "province": "河北",
        "emoji": "🏖️",
        "color": "#0288d1",
        "tagline": "长城入海，避暑天堂",
        "description": "秦皇岛位于河北东北部，南临渤海、北依燕山，拥有北戴河、山海关、老龙头等著名景区，是京津唐地区最热门的避暑海滨城市。",
        "heroTitle": "发现秦皇岛<br>长城入海",
        "heroSub": "山海关揽胜 · 北戴河听涛 · 老龙头望海<br>2026年最新秦皇岛旅游攻略",
        "keywords": ["秦皇岛旅游", "秦皇岛攻略", "北戴河", "山海关", "老龙头", "鸽子窝"],
        "lat": 39.94,
        "lng": 119.60,
        "bestSeason": "6-9月",
        "suggestedDays": "2-3天",
        "climate": "温带季风气候，夏无酷暑",
        "attractions": [
            {"icon": "🏖️", "name": "北戴河", "desc": "中国著名避暑胜地，海岸线绵长，鸽子窝看日出、老虎石观潮，疗养区林荫如盖。", "ticket": "免费(部分景点收费)", "time": "建议半天"},
            {"icon": "🏯", "name": "山海关", "desc": "明长城东端起点，城楼高悬「天下第一关」匾额，城防体系完整壮观。", "ticket": "约50元", "time": "建议2-3小时"},
            {"icon": "🌊", "name": "老龙头", "desc": "万里长城唯一探入渤海的段落，入海石城如龙首饮水，气势磅礴。", "ticket": "约50元", "time": "建议2小时"},
            {"icon": "🕊️", "name": "鸽子窝公园", "desc": "北戴河观日出最佳处，鹰角亭临海崖，亦是候鸟迁徙重要栖息地。", "ticket": "约25元", "time": "建议1-2小时"},
            {"icon": "🪨", "name": "老虎石海上公园", "desc": "北戴河中心海滨浴场，海中巨石状如群虎，沙滩平缓宜戏水。", "ticket": "约8元", "time": "建议2小时"},
            {"icon": "⛰️", "name": "联峰山公园", "desc": "北戴河背后诸峰，登顶可俯瞰整个海滨全景，松林清凉宜徒步。", "ticket": "约30元", "time": "建议2小时"},
            {"icon": "🏝️", "name": "黄金海岸", "desc": "昌黎南戴河一带的细软沙滩，滑沙、温泉、海滨度假一应俱全。", "ticket": "免费(项目另收费)", "time": "建议半天"},
            {"icon": "🛶", "name": "燕塞湖", "desc": "山海关旁的人工湖，峡谷间碧水蜿蜒，有「北方小桂林」之誉。", "ticket": "约40元", "time": "建议2小时"},
            {"icon": "🏛️", "name": "孟姜女庙", "desc": "依「孟姜女哭长城」传说而建，依山筑庙，香火绵延数百载。", "ticket": "约25元", "time": "建议1小时"},
        ],
        "food": [
            {"icon": "🦐", "name": "海鲜大餐", "desc": "秦皇岛海鲜现捞现做，皮皮虾、梭子蟹、扇贝清蒸最鲜甜。", "tip": "港城大街海鲜市场买鲜找店加工"},
            {"icon": "🍲", "name": "浑锅", "desc": "山海关特色铜锅，荤素一锅炖煮，本地年节与待客的硬菜。", "tip": "山海关老字号浑锅最正宗"},
            {"icon": "🍰", "name": "回记绿豆糕", "desc": "山海关回记百年老号，绿豆糕细腻不腻，经典伴手礼。", "tip": "设区路回记总店"},
            {"icon": "🫓", "name": "长城饽椤饼", "desc": "以饽椤叶包裹的野菜馅饼，山海关非遗小吃，清香独特。", "tip": "景区周边农家乐可尝"},
            {"icon": "🍷", "name": "昌黎葡萄酒", "desc": "昌黎是中国干红葡萄酒之乡，酒体醇厚，可访酒庄品鉴。", "tip": "华夏/朗格斯酒庄参观品鉴"},
            {"icon": "🥟", "name": "赵家馆饺子", "desc": "昌黎赵家馆百年老号，皮薄馅大，三鲜水饺最为出名。", "tip": "昌黎县城赵家馆总店"},
        ],
        "guide": [
            {"icon": "✈️", "title": "交通指南", "content": "<ul><li><b>飞机：</b>秦皇岛北戴河机场，距市区约30公里</li><li><b>高铁：</b>秦皇岛站/北戴河站，京津出发约1-2小时</li><li><b>市内：</b>公交+旅游专线，北戴河区多骑行</li></ul>"},
            {"icon": "🏨", "title": "住宿推荐", "content": "<ul><li><b>北戴河：</b>疗养区海滨，推窗见海（300-800元/晚）</li><li><b>山海关：</b>访古城与老龙头便利（150-400元/晚）</li><li><b>海港区：</b>市区中心，吃喝交通方便（200-500元/晚）</li></ul>"},
            {"icon": "🌤️", "title": "最佳季节", "content": "<ul><li><b>6-9月：</b>避暑旺季，下海游泳最佳</li><li><b>5月/10月：</b>人少景清，适合漫步</li><li><b>冬季：</b>海滨清冷，部分景点停运</li></ul>"},
            {"icon": "🍜", "title": "美食地图", "content": "<ul><li><b>海鲜：</b>港城大街海鲜市场加工</li><li><b>山海关小吃：</b>浑锅、回记绿豆糕、饽椤饼</li><li><b>昌黎：</b>葡萄酒品鉴、赵家馆饺子</li></ul>"},
        ],
        "itinerary": [
            {"day": 1, "title": "抵达 + 山海关", "items": ["抵达秦皇岛", "入住酒店", "山海关古城", "天下第一关", "老龙头看海"]},
            {"day": 2, "title": "北戴河海滨", "items": ["上午鸽子窝看日出", "老虎石海上公园", "中海滩戏水", "碧螺塔夜景"]},
            {"day": 3, "title": "联峰山 + 周边", "items": ["登联峰山俯瞰全景", "黄金海岸滑沙", "返程或昌黎酒庄"]},
        ],
        "blogs": [
            {"slug": "qinhuangdao-beidaihe-sunrise", "title": "北戴河看日出全攻略：鸽子窝最佳机位", "excerpt": "北戴河鸽子窝公园是观海上日出胜地，本文告诉你最佳时间、机位与避坑要点。"},
            {"slug": "qinhuangdao-shanhaiguan", "title": "山海关与老龙头：长城从这里入海", "excerpt": "走一遍天下第一关与老龙头，读懂明长城东端起点的壮阔与厚重。"},
            {"slug": "qinhuangdao-food", "title": "秦皇岛吃什么：从海鲜到山海关小吃", "excerpt": "皮皮虾、浑锅、回记绿豆糕……一份秦皇岛不可错过的地道美食清单。"},
        ],
    }

    d["cities"].append(qhd)
    json.dump(d, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("已插入秦皇岛，当前城市数:", len(d["cities"]))

if __name__ == "__main__":
    main()
