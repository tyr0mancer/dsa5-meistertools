export const RULE_CATEGORIES = [
    {key: "stadt", name: "In der Stadt"},
    {key: "natur", name: "Natur und Heilung"},
    {key: "sonst", name: "Sonstige"}
]

export const RULES = [
    {
        key: "nachtwache", category: "natur", name: "Nachtwache",
        input: [
            {type: "Player", _id: "wache1", name: "1. Wache"},
            {type: "Player", _id: "wache2", name: "2. Wache"},
            {type: "Player", _id: "wache3", name: "3. Wache"}
        ]
    },
    {
        key: "zechen", category: "stadt", name: "Zechen",
        url: "https://www.ulisses-regelwiki.de/Alkohol_Regeln.html"
    },
    {
        key: "kneipenspiele", category: "stadt", name: "Kneipenspiele",
        url: "https://www.ulisses-regelwiki.de/Fokus_Kneipenspiele.html"
    },
    {
        key: "recherche", category: "stadt", name: "Recherche",
        url: "https://www.ulisses-regelwiki.de/Recherche.html"
    },

    {
        key: "flucht", category: "sonst", name: "Flucht",
        url: "https://www.ulisses-regelwiki.de/Fokus_Flucht.html"
    },
    {
        key: "buecher", category: "sonst", name: "Inhaltsqualität von Büchern",
        url: "https://www.ulisses-regelwiki.de/Fokus_Inhaltsqualitaet_von_Buechern.html"
    },
    {
        key: "verbergen", category: "sonst", name: "Gegenstände verbergen",
        url: "https://www.ulisses-regelwiki.de/Gegenst%C3%A4nde_und_Waffen_verbergen.html"
    },
    {
        key: "hunt", category: "natur", name: "Jagd",
        url: "https://www.ulisses-regelwiki.de/Fokus_Jagd.html"
    },
    {
        key: "krautersuche", category: "natur", name: "Krautersuche",
        url: "https://www.ulisses-regelwiki.de/fokus_Krautersuche.html"
    },
    {
        key: "nahrungssuche", category: "natur", name: "Nahrungssuche",
        url: "https://www.ulisses-regelwiki.de/Nahrungssuche.html"
    },
    {
        key: "alltagsarzneien", category: "natur", name: "Alltagsarzneien",
        url: "https://www.ulisses-regelwiki.de/fokus_Alltagsarzneien.html"
    }

]
