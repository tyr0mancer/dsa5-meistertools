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
                name: "Holz sammeln",
                target: "Player", rolls: [{talent: "Wildnisleben", modifier: 3, comment: "Holz sammeln"}],
                description: "Holz sammeln um ein Feuer eine Nacht lang brennen zu lassen.", duration: "1 Stunde",
                modifiers: ["Landschafts-Typ", "Wetter"],
            },
            {
                name: "Feuer machen",
                target: "Player", rolls: [{talent: "Wildnisleben", modifier: 1, comment: "Feuer machen"}],
                modifiers: ["Wetter"],
            },
        ]
    },

    {
        key: "nachtwache", category: "nature", name: "Nachtwache", icon: "fas fa-cloud-moon",
        rollRequests: [
            {
                name: "erste Wache",
                target: "Player", rolls: [
                    {talent: "Körperbeherrschung", modifier: 5, comment: "Wach bleiben"},
                    {talent: "Sinnesschärfe", modifier: 0, comment: "Aufmerksam bleiben"},
                ],
                description: "Die erste Wache ist die einfachste", duration: "2-3 Stunden",
                modifiers: ["Status"],
            },
            {
                name: "mittlere Wache",
                target: "Player", rolls: [
                    {talent: "Körperbeherrschung", modifier: 1, comment: "Wach bleiben"},
                    {talent: "Sinnesschärfe", modifier: 0, comment: "Aufmerksam bleiben"},
                ],
                description: "Mittlere Wachen sind die anstrengendsten", duration: "2-3 Stunden",
                modifiers: ["Status"],
            },
            {
                name: "letzte Wache",
                target: "Player", rolls: [
                    {talent: "Körperbeherrschung", modifier: 3, comment: "Wach bleiben"},
                    {talent: "Sinnesschärfe", modifier: 0, comment: "Aufmerksam bleiben"},
                ],
                description: "Die letzte Wache = Kurze Nacht", duration: "2-3 Stunden",
                modifiers: ["Status"],
            }
        ]
    },

    {
        key: "zechen", category: "city", name: "Zechen", icon: "fas fa-beer",
        url: "https://www.ulisses-regelwiki.de/Alkohol_Regeln.html"
    },
    {
        key: "kneipenspiele", category: "city", name: "Kneipenspiele", icon: "fas fa-dice",
        url: "https://www.ulisses-regelwiki.de/Fokus_Kneipenspiele.html"
    },
    {
        key: "recherche", category: "city", name: "Recherche", icon: "fas fa-search",
        url: "https://www.ulisses-regelwiki.de/Recherche.html"
    },

    {
        key: "flucht", category: "misc", name: "Flucht", icon: "fas fa-running",
        url: "https://www.ulisses-regelwiki.de/Fokus_Flucht.html"
    },
    {
        key: "buecher", category: "misc", name: "Inhaltsqualität von Büchern", icon: "fas fa-book-reader",
        url: "https://www.ulisses-regelwiki.de/Fokus_Inhaltsqualitaet_von_Buechern.html"
    },
    {
        key: "alltagsarzneien", category: "misc", name: "Alltagsarzneien", icon: "fas fa-pills",
        url: "https://www.ulisses-regelwiki.de/fokus_Alltagsarzneien.html"
    },
    {
        key: "verbergen", category: "misc", name: "Gegenstände verbergen", icon: "fas fa-user-secret",
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
