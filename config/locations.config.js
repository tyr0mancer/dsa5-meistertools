/*
    todo
    albernia
    weiden
    darpatien
    horasreich
*/

export default {
    regionCategories: [{key: "stadt", name: "Städte und Stätten", style: {}},{key: "land", name: "Landschaften", style: {fillColor: '#FF0000', text: ''}},{key: "politik", name: "Politische Karte", style: {fillColor: 'random'}}    ],
    regions: [{"key":"mittelreich","name":"Mittelreich","category":"politik"},{"category":"politik","key":"nostria","name":"Königreich Nostria"},{"category":"politik","key":"andergast","name":"Königreich Andergast"},{"category":"politik","key":"thorwal","name":"Thorwal & Gjalskerland"},{"category":"land","key":"hohe-norden","name":"Der Hohe Norden"},{"category":"land","key":"waelder-nord","name":"Wälder des Nordens"},{"category":"stadt","key":"schattenlande","name":"Schattenlande"},{"category":"politik","key":"horasreich","name":"Horasreich"},{"category":"land","key":"dschungel","name":"Die dampfenden Dschungel"},{"category":"politik","key":"meridiana","name":"Stadtstaaten Meridianas"},{"category":"land","key":"waldinseln","name":"Waldinseln"},{"category":"land","key":"maraskan","name":"Insel Maraskan"},{"category":"politik","key":"kalifat","name":"Wüste Khom & Kalifat"},{"category":"politik","key":"tulamiden","name":"Die Lande der Tulamiden"},{"category":"politik","key":"aranien","name":"Aranien"},{"category":"land","key":"echsensuempfe","name":"Echsensümpfe"},{"category":"politik","key":"orks","name":"Steppen der Orks"},{"category":"politik","key":"svelltland","name":"Svelltsche Städtebund"},{"category":"stadt","key":"alanfa","name":"Al' Anfa"},{"category":"stadt","key":"vinsalt","name":"Vinsalt"},{"category":"stadt","key":"gareth","name":"Gareth"},{"category":"stadt","key":"havena","name":"Havena"}],
    biomes: [
        //https://www.pexels.com/de-de/foto/strasse-landschaft-natur-himmel-4406222/
        {key: "village", name: "Dörfer und Weiler", img: "modules/dsa5-meistertools/assets/images/biomes/village.webp"},
        //https://www.pexels.com/de-de/foto/grauer-beton-triumphbogen-umgeben-von-blumen-1055068/
        {key: "city", name: "kleine und mittlere Städte",img: "modules/dsa5-meistertools/assets/images/biomes/city.webp"},
        //https://www.pexels.com/de-de/foto/foto-des-hauses-nahe-am-fluss-61381/
        {key: "metropolis", name: "Große Städten und Metropolen",img: "modules/dsa5-meistertools/assets/images/biomes/metropolis.webp"},
        //https://www.pexels.com/de-de/foto/panorama-fotografie-des-grunen-feldes-440731/
        {key: "plains", name: "weite Ebenen", herbmod: 0,img: "modules/dsa5-meistertools/assets/images/biomes/plains.webp"},
        //https://www.pexels.com/de-de/foto/grune-kiefern-1563604/
        {key: "forest", name: "gemäßigte Wälder", herbmod: 1,img: "modules/dsa5-meistertools/assets/images/biomes/forest.webp"},
        //https://www.pexels.com/de-de/foto/baume-in-der-nahe-des-sees-unter-blauem-himmel-534040/
        {key: "marsh", name: "Sümpfe, Marschen und Moore", herbmod: -1,img: "modules/dsa5-meistertools/assets/images/biomes/marsh.webp"},
        //https://www.pexels.com/de-de/foto/landschaftsfotografie-des-berges-414122/
        {key: "hills", name: "Hügel", herbmod: 0,img: "modules/dsa5-meistertools/assets/images/biomes/hills.webp"},
        //https://www.pexels.com/de-de/foto/schneebedeckter-berg-1755243/
        {key: "mountains", name: "Gebirge", herbmod: -1,img: "modules/dsa5-meistertools/assets/images/biomes/mountains.webp"},
        //https://www.pexels.com/de-de/foto/foto-der-bergkette-bedeckt-mit-schnee-unter-mond-908644/
        {key: "arctic", name: "Hoher Norden", herbmod: -4,img: "modules/dsa5-meistertools/assets/images/biomes/arctic.webp"},
        //https://www.pexels.com/de-de/foto/holz-licht-dammerung-landschaft-4239623/
        {key: "rainforest", name: "Regenwald", herbmod: 0,img: "modules/dsa5-meistertools/assets/images/biomes/rainforest.webp"},
        //https://www.pexels.com/de-de/foto/grune-busche-in-der-wuste-998653/
        {key: "desert", name: "Wüste", herbmod: -4,img: "modules/dsa5-meistertools/assets/images/biomes/desert.webp"},
        //https://www.pexels.com/de-de/foto/landschaftsfoto-des-gewassers-1001682/
        {key: "ocean", name: "Auf hoher See",img: "modules/dsa5-meistertools/assets/images/biomes/ocean.webp"},
    ],
    currentLocation: {locatorToken: null,locatorScene: null,currentRegions: [],currentBiome: {}}
}
