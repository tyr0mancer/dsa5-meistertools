export const QUALITY = [
    {key: 1, name: "Q1", description: "Absteigen und Spelunken"},
    {key: 2, name: "Q2", description: "Tavernen"},
    {key: 3, name: "Q3"},
    {key: 4, name: "Q4"},
    {key: 5, name: "Q5"}
]

export const PRICE = [
    {key: 1, name: "P1", sell: 0.75, buy: 0.10},
    {key: 2, name: "P2", sell: 1, buy: 0.25},
    {key: 3, name: "P3", sell: 1.25, buy: 0.5},
    {key: 4, name: "P4", sell: 1.5, buy: 0.75},
    {key: 5, name: "P5", sell: 2, buy: 1},
]

export const MERCHANT_TYPE = [
    {key: "tavern", name: "Tavernen und Herbergen"},
    {key: "merchant", name: "Händler"},
]

export const LIBRARY_ITEM_TYPES = ["meleeweapon", "armor", "equipment", "poison", "consumable", "rangeweapon"]

export const DEFAULT_CATEGORY_ENTRY = {
    "amount-q1": "1W3",
    "amount-q2": "1W3+1",
    "amount-q3": "2W3",
    "amount-q4": "2W6",
    "amount-q5": "2W6+3"
}

export const RANDOM_TAVERN_NAME = {
    article: ['Zur / Zum', 'In der / Im', 'Die / Der / Das'],
    adjective: ['schwarze', 'weiße', 'bunte', 'rote', 'gelbe', 'blaue', 'silberne', 'goldene', 'graue', 'königliche', 'arme', 'fleißige', 'faule', 'kichernde', 'kreischende', 'herrliche', 'schreckliche', 'geheime', 'löbliche', 'räudige', 'rasende', 'hurtige', 'rauchende', 'qualmende', 'dampfende', 'lärmende', 'stille', 'heulende', 'jaulende', 'wimmernde', 'lachende', 'trübe', 'helle', 'warme', 'kalte', 'dunkle', 'heiße', 'gefrorene', 'dumme', 'schlaue', 'fette', 'dürre', 'tote', 'verwundete', 'betrunkene', 'besoffene', 'letzte', 'erste', 'neue', 'alte', 'rostige', 'hohe', 'tiefe', 'lustige', 'traurige', 'ängstliche', 'mutige', 'muntere', 'freundliche', 'teuflische'],
    subject: ['Eber', 'Hirsch', 'Eulenbär', 'Drachen', 'Fuchs', 'Affe', 'Hahn', 'Adler', 'Vogel', 'Esel', 'Ferdinand', 'Stiefel', 'Schuh', 'Handschuh', 'Rock', 'Riemen', 'Hut', 'Helm', 'Unterrock', 'Hantel', 'Leuchter', 'Strumpf', 'Rauchfang', 'Amboss', 'Kleiderschrank', 'Schemel', 'Sarg', 'Waschzuber', 'Brunnen', 'Haken', 'Strick', 'Krug', 'Kessel', 'Deckel', 'Topf', 'Henkel', 'Pott', 'Nachttopf', 'Spucknapf', 'Becher', 'König', 'Bettler', 'Müller', 'Schuster', 'Jäger', 'Meister', 'Mönch', 'Diener', 'Abt', 'Priester', 'Kesselflicker', 'Mann', 'Bengel', 'Tempel', 'Tümpel', 'See', 'Sumpf', 'Keller', 'Schmerz', 'Triumph', 'Tod', 'Kerl', 'Taugenichts', 'Reiter', 'Schild', 'Speer', 'Morgenstern', 'Dolch', 'Hammer', 'Bogen', 'Langbogen', 'Dreschflegel', 'Dreizack', 'Oger', 'Troll', 'Ork', 'Goblin', 'Hippogreif', 'Bastard', 'Zwerg', 'Halbling', 'Grubentroll', 'Buckel', 'Gruftschrecken', 'Zombie', 'Einhorn', 'Reh', 'Kaninchen', 'Wildschwein', 'Schwein', 'Huhn', 'Schaf', 'Ross', 'Rössl', 'Hemd', 'Amulett', 'Krönchen', 'Strumpfband', 'Regal', 'Geschirr', 'Becken', 'Brauhaus', 'Badehaus', 'Wäldchen', 'Loch', 'Lieschen', 'Männchen', 'Schlachthaus', 'Glück', 'Unglück', 'Vergessen', 'Schwert', 'Schild', 'Messer', 'Beil', 'Herz', 'Köpfchen', 'Nierchen', 'Haus', 'Fass', 'Weib', 'Brathuhn', 'Löckchen', 'Schreckgespenst', 'Gespenst', 'Skelett', 'Äffchen', 'Zimmer', 'Sau', 'Antilope', 'Fledermaus', 'Maus', 'Ratte', 'Kuh', 'Henne', 'Ziege', 'Fliege', 'Mücke', 'Laus', 'Krone', 'Garderobe', 'Socke', 'Locke', 'Leber', 'Niere', 'Todesfee', 'Vettel', 'Amme', 'Eckbank', 'Bank', 'Treppe', 'Leiter', 'Unterkunft', 'Bleibe', 'Brücke', 'Tasse', 'Pfanne', 'Kelle', 'Bratpfanne', 'Bratröhre', 'Lampe', 'Fackel', 'Kugel', 'Königin', 'Bettlerin', 'Müllerin', 'Meisterin', 'Nonne', 'Äbtissin', 'Frau', 'Magd', 'Küche', 'Brauerei', 'Kirche', 'Badestube', 'Müllerstube', 'Backstube', 'Stube', 'Freude', 'Trauer', 'Liebe', 'Verzweiflung', 'Hoffnung', 'Auferstehung', 'Wiedergeburt', 'Armbrust', 'Glefe', 'Mistgabel', 'Heugabel', 'PeitscheZange', 'Hacke', 'Spitzhacke', 'Reitgerte', 'Angel', 'Rute', 'Lanze', 'Axt', 'Streitaxt', 'Machete']
}

export const SOURCE_TYPES = ["library", "rolltable", "items"]
