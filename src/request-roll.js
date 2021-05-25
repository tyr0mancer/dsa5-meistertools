import {moduleName} from "../meistertools.js";


const RULE_CATEGORIES = [
    {key: "stadt", name: "In der Stadt"},
    {key: "natur", name: "Natur und Heilung"},
    {key: "sonst", name: "Sonstige"}
]

const RULES = [
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
        key: "nachtwache", category: "natur", name: "Nachtwache"
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


export class RequestRoll extends Application {
    constructor() {
        super();
        this.rules = RULES
        this.ruleCategories = RULE_CATEGORIES
        this.content = ""
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['meistertools'],
            top: 50,
            left: 100,
            width: 800,
            height: 650,
            resizable: true,
            template: `modules/${moduleName}/templates/request-roll.hbs`,
            id: 'meistertools.request-roll',
            title: 'Fokus Regeln',
        });
    }

    async getData() {
        return {
            options: {
                rules: this.rules,
                ruleCategories: this.ruleCategories,
            },
            rule: this.rule,
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("a.set-rule").click(event => {
            const ruleKey = $(event.currentTarget).attr("data-rule-key")
            this.rule = RULES.find(r => r.key === ruleKey)
            this.render()
        })
    }

}
