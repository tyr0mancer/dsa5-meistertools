export default {
    regionCategories: [
        {key: "stadt", name: "Städte und Stätten", style: {}},
        {key: "land", name: "Landschaften", style: {fillColor: '#FF0000', text: ''}},
        {key: "politik", name: "Politische Karte", style: {fillColor: 'random'}}
    ],
    regions: [
        {key: 'albernia', name: 'Fürstentum Albernia', category: 'politik'},
        {key: 'mittelreich', name: 'Mittelreich', category: 'politik'},
    ],
    biomes: [
        //https://www.pexels.com/de-de/foto/strasse-landschaft-natur-himmel-4406222/
        {key: "village", name: "Dörfer und Weiler", img: "modules/dsa5-meistertools/assets/images/biomes/village.webp"},
        //https://www.pexels.com/de-de/foto/grauer-beton-triumphbogen-umgeben-von-blumen-1055068/
        {key: "city", name: "kleine und mittlere Städte", img: "modules/dsa5-meistertools/assets/images/biomes/city.webp"},
        //https://www.pexels.com/de-de/foto/foto-des-hauses-nahe-am-fluss-61381/
        {key: "metropolis", name: "Große Städten und Metropolen", img: "modules/dsa5-meistertools/assets/images/biomes/metropolis.webp"},

        {key: "forest", name: "gemäßigte Wälder", img: "modules/dsa5-meistertools/assets/images/biomes/forest.webp"},
        //https://www.pexels.com/de-de/foto/holz-licht-dammerung-landschaft-4239623/
        {key: "rainforest", name: "Regenwald", img: "modules/dsa5-meistertools/assets/images/biomes/rainforest.webp"},
        //https://www.pexels.com/de-de/foto/grune-busche-in-der-wuste-998653/
        {key: "desert", name: "Wüste", img: "modules/dsa5-meistertools/assets/images/biomes/desert.webp"},
        //https://www.pexels.com/de-de/foto/landschaftsfoto-des-gewassers-1001682/
        {key: "ocean", name: "Auf hoher See", img: "modules/dsa5-meistertools/assets/images/biomes/ocean.webp"},
    ],
    currentLocation: {
        locatorToken: null,
        locatorScene: null,
        currentRegions: [],
        currentBiome: {}
    }
}
