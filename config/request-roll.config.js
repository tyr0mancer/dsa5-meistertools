export const RULE_CATEGORIES = [
    {key: "city", name: "In der Stadt"},
    {key: "nature", name: "Natur und Heilung"},
    {key: "misc", name: "Sonstige"}
]

export const RULES = [
    {
        key: "build-camp", category: "nature", name: "Feuer machen", icon: "fas fa-fire",
        rollRequests: [
            {
                target: "Player", talent: "Wildnissleben", modifier: 1, comment: "Holz sammeln",
                description: "zunächst muss ausreichend Holz gesammelt werden.<p>Zusätzliche Modifikatoren:</p><ul><li>Biome +1/-1</li></ul>"
            },
            {target: "Player", talent: "Wildnissleben", modifier: 3, comment: "Feuer machen"},
        ]
    },
    {
        key: "nachtwache", category: "nature", name: "Nachtwache", icon: "fas fa-cloud-moon",
        input: [
            {type: "Player", _id: "wache1", name: "1. Wache"},
            {type: "Player", _id: "wache2", name: "2. Wache"},
            {type: "Player", _id: "wache3", name: "3. Wache"}
        ],
        rolls: [
            {actor: "wache1", talent: "Wildnissleben", modifier: 1},
            {actor: "wache2", talent: "Wildnissleben", modifier: 3},
            {actor: "wache3", talent: "Wildnissleben", modifier: 5},
        ]
    },

    {
        key: "zechen", category: "city", name: "Zechen",
        url: "https://www.ulisses-regelwiki.de/Alkohol_Regeln.html"
    },
    {
        key: "kneipenspiele", category: "city", name: "Kneipenspiele",
        url: "https://www.ulisses-regelwiki.de/Fokus_Kneipenspiele.html"
    },
    {
        key: "recherche", category: "city", name: "Recherche",
        url: "https://www.ulisses-regelwiki.de/Recherche.html"
    },

    {
        key: "flucht", category: "misc", name: "Flucht",
        url: "https://www.ulisses-regelwiki.de/Fokus_Flucht.html"
    },
    {
        key: "buecher", category: "misc", name: "Inhaltsqualität von Büchern",
        url: "https://www.ulisses-regelwiki.de/Fokus_Inhaltsqualitaet_von_Buechern.html"
    },
    {
        key: "alltagsarzneien", category: "misc", name: "Alltagsarzneien",
        url: "https://www.ulisses-regelwiki.de/fokus_Alltagsarzneien.html"
    },
    {
        key: "verbergen", category: "misc", name: "Gegenstände verbergen",
        url: "https://www.ulisses-regelwiki.de/Gegenst%C3%A4nde_und_Waffen_verbergen.html"
    },

    {
        key: "hunt", category: "nature", name: "Jagd", icon: "fas fa-paw",
        url: "https://www.ulisses-regelwiki.de/Fokus_Jagd.html"
    },
    {
        key: "krautersuche", category: "nature", name: "Kräutersuche", icon: "fab fa-pagelines",
        url: "https://www.ulisses-regelwiki.de/fokus_Krautersuche.html"
    },
    {
        key: "nahrungssuche", category: "nature", name: "Nahrungssuche", icon: "fas fa-carrot",
        url: "https://www.ulisses-regelwiki.de/Nahrungssuche.html"
    },

]
