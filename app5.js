"use strict";

const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

// データ保持用変数
let dataStore = {
    foods: [
        { id: 1, name: "清涼飲料水" },
        { id: 2, name: "菓子" }
    ],
    foodAdditives: [
        { id: 101, foodId: 1, name: "アスパルテーム", detail: "人工甘味料" }
    ],
    planets: [
        { id: 1, name: "地球" },
        { id: 2, name: "火星" }
    ],
    substances: [
        { id: 201, planetId: 1, name: "窒素", detail: "大気成分" }
    ],
    countries: [
        { id: 1, name: "日本" },
        { id: 2, name: "アメリカ" }
    ],
    species: [
        { id: 301, countryId: 1, name: "トキ", detail: "絶滅危惧IA類" }
    ]
};

// --- ルート定義 ---

// ポータル画面
app.get("/", (req, res) => {
    res.render("index");
});

// 1. 加工食品システム (エラーが出ていないはずですが念のため確認)
app.get("/foods", (req, res) => {
    res.render("food", { categories: dataStore.foods });
});

// 2. 惑星システム (Cannot GET /planets を解決)
app.get("/planets", (req, res) => {
    res.render("planet", { categories: dataStore.planets });
});

// 3. 絶滅危惧種システム (Cannot GET /countries を解決)
app.get("/countries", (req, res) => {
    res.render("species", { categories: dataStore.countries });
});

// 各詳細画面 (ID指定)
app.get("/foods/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const category = dataStore.foods.find(f => f.id === id);
    const items = dataStore.foodAdditives.filter(a => a.foodId === id);
    res.render("food_detail", { category, items });
});

app.get("/planets/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const category = dataStore.planets.find(p => p.id === id);
    const items = dataStore.substances.filter(s => s.planetId === id);
    res.render("planet_detail", { category, items });
});

app.get("/countries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const category = dataStore.countries.find(c => c.id === id);
    const items = dataStore.species.filter(s => s.countryId === id);
    res.render("species_detail", { category, items });
});

// --- 共通操作: 新規追加 (POST /add/:type/:parentId) ---
app.post("/add/:type/:parentId", (req, res) => {
    const type = req.params.type;
    const parentId = parseInt(req.params.parentId);
    
    // 新しいデータを作成（IDは重複しないよう現在時刻をベースにする）
    const newItem = {
        id: Date.now(), 
        name: req.body.name,
        detail: req.body.detail
    };

    // システムの種類（type）によって保存先と戻り先を分ける
    if (type === 'planet') {
        newItem.planetId = parentId;
        dataStore.substances.push(newItem); // 惑星の物質データに追加
        res.redirect("/planets/" + parentId);
    } else if (type === 'food') {
        newItem.foodId = parentId;
        dataStore.foodAdditives.push(newItem); // 食品の添加物データに追加
        res.redirect("/foods/" + parentId);
    } else if (type === 'species') {
        newItem.countryId = parentId;
        dataStore.species.push(newItem); // 絶滅危惧種データに追加
        res.redirect("/countries/" + parentId);
    }
});
app.post("/delete/:type/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const type = req.params.type; // substances, foodAdditives, species
    dataStore[type] = dataStore[type].filter(item => item.id !== id);
    res.redirect("back");
});

app.listen(8080, () => {
    console.log("Server running on http://localhost:8080");
});
