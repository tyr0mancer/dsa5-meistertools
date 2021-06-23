import zutatenNsc from "../config/nsc-factory.config.zutaten.js";
import zutatenLocations from "../config/locations.config.zutaten.js";
import scenesHomebrew from "../config/scenes.config.homebrew.js";

export const SECRET_INGREDIENTS = [
    {
        "key": "nsc-zutaten",
        "text": "Zutaten für die NSC Fabrik",
        "module": "dsa5-meistertools-zutaten",
        "category": "nsc-factory",
        "defaultData": zutatenNsc,
    },
    {
        "key": "locations-zutaten",
        "text": "Zutaten für Regionen und Biome",
        "module": "dsa5-meistertools-zutaten",
        "category": "locations",
        "defaultData": zutatenLocations,
    },
    {
        "key": "scenes-homebrew",
        "text": "Szenen aus dem Homebrew Modul",
        "module": "dsa5-homebrew",
        "category": "scenes",
        "defaultData": scenesHomebrew,
    },
    {
        "key": "ab-phoenix",
        "text": "Abenteuer - Banner des Phönix",
        "module": "dsa5-ab-phoenix",
        "category": "scenes",
        "defaultData": scenesHomebrew,
    }
]


export const generalDefaultSettings = {
    showSettings: true,
    installedModules: {}
}
