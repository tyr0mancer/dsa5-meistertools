/* todo move this to foundry settings, so the user can have an own name ruleset */
export default [
    {
        name: "Menschen",
        key: "menschen",
        img: 'systems/dsa5/icons/species/Mensch.webp',
        origins: [
            {
                key: 'mittellande', name: 'Mittelländer',
                cultures: [
                    {name: 'Albernisch', key: 'albernisch'},
                    {name: 'Garethisch', key: 'garethisch'},
                    {name: 'Bornländisch', key: 'bornlaendisch'},
                    {name: 'Horasisch', key: 'horasisch'},
                    {name: 'Weidensche', key: 'weidensche'},
                    {name: 'Darpatisch', key: 'darpatisch'}
                ]
            },
            {name: 'Thorwaler', key: 'thorwaler'},
            {name: 'Norbarden', key: 'norbarden'},
            {name: 'Tulamiden', key: 'tulamiden'},
            {name: 'Novadis', key: 'novadis'},
            {name: 'Nivesen', key: 'nivesen'},
            {name: 'Moha', key: 'moha'},
            {name: 'Amazonen', key: 'amazonen'},
        ]
    },
    {
        name: 'Zwerge',
        key: "zwerge",
        img: 'systems/dsa5/icons/species/Zwerg.webp',
        origins: [
            {key: 'zwerge', name: 'Amboss- und Brillantzwerge', gender: {w: 25, m: 75}},
            {key: 'huegelzwerge', name: 'Hügelzwerge (Kosch)', gender: {w: 25, m: 75}}
        ],
    },
    {
        name: "Elfen",
        key: "elfen",
        img: "systems/dsa5/icons/species/Elf.webp",
        origins: [
            {key: 'waldelfen', name: 'Waldelfen'},
            {key: 'halbelfen', name: 'Halbelfen'},
            {key: 'auelfen', name: 'Auelfen / Firnelfen'}
        ]
    }
]
