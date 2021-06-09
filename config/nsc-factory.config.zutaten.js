export default {

    /**
     * default settings
     */
    settings: {
        baseActorCollection: "dsa5-meistertools-zutaten.actor-professions",
        rolltablesCollection: "dsa5-meistertools.rolltable-names",
        folderName: "NSC Fabrik",
        closeAfterGeneration: true,
    },




    lastSelection: {
        "amount": 1,
        "gender": "random",
        "position": "top-left",
        "archetype": "mittelreich",
        "variation": "garetien",
        "profession": "JlZm9ZGJ0etOu6nX",
        "patternName": "",
        "players": {
            "position": "center",
        },
        "existing-nsc": {
            "position": "top-left",
        }
    },


    collections: [{}],

    /**
     * default / fallback values
     * will be overwritten by .data properties
     */
    fallbackData: {
        images: "modules/dsa5-meistertools-zutaten/images/archetypes/mittellande",
        actor: {
            collection: "dsa5-meistertools-zutaten.actor-archetypes",
            _id: "",
        },
        rollTables: {
            "vorname-m": "Gareth Vorname männlich",
            "vorname-w": "Gareth Vorname weiblich",
            "nachname": "Gareth Nachname",
            "origin": "Gareth Orte",
            "characterTrait": "Charakter",
            "catchphrase": "Catchphrase",
            "haircolor": "Mittelländer Haarfarbe",
            "eyecolor": "Mittelländer Augenfarbe",
            "jobs": "Bürger Berufe"
        },
        pattern: {
            genderRatio: [["w", 50], ["m", 50]],
            name: "${vorname-gender} ${nachname}",
            origin: "${origin}",
            height: "160 + 2W20",
            weightSubtrahend: "93 + 4W6",
            age: "5 + 7W6",
            haircolor: "${haircolor}",
            eyecolor: "${eyecolor}",
            characterTrait: "${characterTrait}",
            catchphrase: "${catchphrase}",
            career: "${jobs}"
        },
    },


    /**
     * Archetypes (read-only in settings)
     */
    archetypes: [

        /* *******************
            Human
         ****************** */
        {
            species: "human",
            key: "mittelreich", name: "Mittelreich", img: "modules/dsa5-core/icons/culture/Mittelreich.webp",
            variations: [
                {
                    key: "garetien",
                    name: "Garetien",
                    data: {
                        rarity: {general: 2, regions: [["garetien", 5], ["mittelreich", 4]]},
                        rollTables: {
                            "origin": "Gareth Orte",
                        }
                    }
                },
                {
                    key: "albernia",
                    name: "Albernia",
                    data: {
                        rarity: {general: 1, regions: [['albernia', 5], ["mittelreich", 2]]},
                        rollTables: {
                            "vorname-m": "Albernia Vorname männlich",
                            "vorname-w": "Albernia Vorname weiblich",
                            "origin": "Albernia Orte",
                        }
                    }
                },
                {
                    key: "weiden",
                    name: "Weiden",
                    data: {
                        rarity: {general: 1, regions: [['weiden', 5], ["mittelreich", 2]]},
                        rollTables: {
                            "vorname-m": "Weiden Vorname männlich",
                            "vorname-w": "Weiden Vorname weiblich",
                            "nachname-prefix": "Weiden Nachname Prefix",
                            "nachname-suffix": "Weiden Nachname Suffix",
                            "origin": "Weiden Orte"
                        },
                        pattern: {
                            name: "${vorname-gender} ${nachname-prefix}${nachname-suffix}",
                        }
                    }
                },
                {
                    key: "darpatien",
                    name: "Darpatien",
                    data: {
                        rarity: {general: 1, regions: [['darpatien', 5], ["mittelreich", 2]]},
                        rollTables: {
                            "vorname-m": "Darpatien Vorname männlich",
                            "vorname-w": "Darpatien Vorname weiblich",
                            "nachname-prefix": "Darpatien Nachname Prefix",
                            "nachname-suffix": "Darpatien Nachname Suffix",
                            "origin": "Darpatien Ort"
                        },
                        pattern: {
                            name: "${vorname-gender} ${nachname-prefix}${nachname-suffix}",
                        }
                    }
                }
            ]
        },
        {
            species: "human",
            key: "horasreich", name: "Horasreich", img: "modules/dsa5-core/icons/culture/Horasreich.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/horasreich",
                actor: {collection: '', _id: ''},
                rollTables: {
                    "vorname-m": "Horasreich Vorname männlich",
                    "vorname-w": "Horasreich Vorname weiblich",
                    "nachname": "Horasreich Nachname",
                    "origin": "Horasreich Orte"
                },
                rarity: {general: 2, regions: [["horasreich", 5], ['mittelreich', 3]]},
            }
        },
        {
            species: "human",
            key: "bornland", name: "Bornland", img: "modules/dsa5-core/icons/culture/Bornland.webp",
            data: {
                rarity: {general: 1, regions: [["bornland", 5]]},
                rollTables: {
                    "vorname-m": "Bornland Vorname männlich",
                    "vorname-w": "Bornland Vorname weiblich",
                    "nachname": "Bornland Nachname",
                    "origin": "Bornland Orte"
                }
            }
        },
        {
            species: "human",
            key: 'thorwal', name: 'Thorwal', img: "modules/dsa5-core/icons/culture/Thorwal.webp",
            data: {
                rarity: {general: 1, regions: [["thorwal", 5], ["nostria", 2]]},
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/thorwaler",
                rollTables: {
                    "vorname-m": "Thorwaler Vorname männlich",
                    "vorname-w": "Thorwaler Vorname weiblich",
                    "origin": "Thorwaler Orte",
                    "haircolor": "Thorwaler Haarfarbe",
                    "eyecolor": "Thorwaler Augenfarbe",
                    "zusatz-m": ['son'],
                    "zusatz-w": ['dotter', 'dottir'],
                },
                pattern: {
                    name: "${vorname-gender} ${vorname-gender}${zusatz-gender}",
                }
            }
        },
        {
            species: "human",
            key: 'norbarden', name: 'Norbarden', img: "modules/dsa5-core/icons/culture/Norbarden.webp",
            data: {
                rarity: {general: 1, regions: [["norbarden", 5]]},
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/norbarden",
                rollTables: {
                    "vorname-m": "Norbarde Vorname männlich",
                    "vorname-w": "Norbarde Vorname weiblich",
                    "nachname": "Norbarde Nachname",
                    "origin": "Norbarde Sippe",
                    "haircolor": "Norbarde Haarfarbe",
                    "eyecolor": "Norbarde Augenfarbe",
                }
            }
        },
        {
            species: "human",
            key: 'novadis', name: 'Novadis', img: "modules/dsa5-core/icons/culture/Novadis.webp",
            data: {
                rarity: {general: 1, regions: [["kalifat", 5]]},
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/novadis",
                rollTables: {
                    "vorname-m": "Tulamide Vorname männlich",
                    "vorname-w": "Tulamide Vorname weiblich",
                    "zusatz-m": ["ibn", "ben"],
                    "zusatz-w": ["saba", "suni", "sunya"],
                    "origin": "Novadis Orte",
                    "haircolor": "Tulamide Haarfarbe",
                    "eyecolor": "Tulamide Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender} ${zusatz-gender} ${vorname-gender}",
                }
            },
        },
        {
            species: "human",
            key: 'nivesen', name: 'Nivesen', img: "modules/dsa5-core/icons/culture/Nivesen.webp",
            data: {
                rarity: {general: 1, regions: [["nivesen", 5]]},
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/nivesen",
                rollTables: {
                    "vorname-m": "Nivese Vorname männlich",
                    "vorname-w": "Nivese Vorname weiblich",
                    "origin": "Nivese Orte",
                    "haircolor": "Nivese Haarfarbe",
                    "eyecolor": "Nivese Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}",
                }
            }
        },
        /*
                {
                    species: "human",
                    key: 'mohas', name: 'Mohas', img: "modules/dsa5-core/icons/culture/Mohas.webp",
                    data: {
                        images: "modules/dsa5-meistertools-zutaten/images/archetypes/moha",
                        rollTables: {
                            "vorname-m": "Moha Vorname männlich",
                            "vorname-w": "Moha Vorname weiblich",
                            "origin": "",
                            "haircolor": "Waldmensch Haarfarbe",
                            "eyecolor": "Waldmensch Augenfarbe",
                        },
                        pattern: {
                            name: "${vorname-gender}"
                        },
                        rarity: {
                            current: 0, general: 0
                        }
                    },
                },
        */
        /*
                {
                    species: "human",
                    key: 'amazonen', name: 'Amazonen', img: "modules/dsa5-core/icons/culture/Amazonen.webp",
                    data: {
                        images: "modules/dsa5-meistertools-zutaten/images/archetypes/amazonen",
                        rollTables: {
                            "vorname": "Amazone Vorname",
                            "origin": "amazonen_orte"
                        },
                        pattern: {
                            name: "${vorname}",
                            gender-ratio: [["w", 1]]
                        }
                    }
                },
        */


        /* *******************
            Dwarf
         ****************** */
        {
            species: "dwarf",
            key: 'ambosszwerge', name: 'Amboss-Zwerge', img: "modules/dsa5-core/icons/culture/Ambosszwerge.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/zwerge",
                rollTables: {
                    "vorname-m": "Zwerg Vorname männlich",
                    "vorname-w": "Zwerg Vorname weiblich",
                    "zusatz-w": [", Tochter der"],
                    "zusatz-m": [", Sohn des"],
                    "origin": "Ambosszwerge Orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}${zusatz-gender} ${vorname-gender}",
                    genderRatio: [["w", 25], ["m", 75]],
                    height: "128 + 2W6",
                    age: "20 + 20W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },
        {
            species: "dwarf",
            key: 'brillantzwerge', name: 'Brillant-Zwerge', img: "modules/dsa5-core/icons/culture/Brillantzwerge.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/zwerge",
                rollTables: {
                    "vorname-m": "Zwerg Vorname männlich",
                    "vorname-w": "Zwerg Vorname weiblich",
                    "zusatz-w": [", Tochter der"],
                    "zusatz-m": [", Sohn des"],
                    "origin": "Brillantzwerge Orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}${zusatz-gender} ${vorname-gender}",
                    genderRatio: [["w", 25], ["m", 75]],
                    age: "20 + 20W6",
                    height: "128 + 2W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },
        {
            species: "dwarf",
            key: 'erzzwerge', name: 'Erz-Zwerge', img: "modules/dsa5-core/icons/culture/Erzzwerge.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/zwerge",
                rollTables: {
                    "vorname-m": "Zwerg Vorname männlich",
                    "vorname-w": "Zwerg Vorname weiblich",
                    "zusatz-w": [", Tochter der"],
                    "zusatz-m": [", Sohn des"],
                    "origin": "erzzwerge_orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}${zusatz-gender} ${vorname-gender}",
                    genderRatio: [["w", 25], ["m", 75]],
                    age: "20 + 20W6",
                    height: "128 + 2W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },
        {
            species: "dwarf",
            key: 'huegelzwerge', name: 'Hügel-Zwerge', img: "modules/dsa5-core/icons/culture/Huegelzwerge.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/huegelzwerge",
                rollTables: {
                    "vorname-m": "Zwerg Vorname männlich",
                    "vorname-w": "Zwerg Vorname weiblich",
                    "nachname": "Hügelzwerg Sippenname",
                    "origin": "Hügelzwerg Orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    genderRatio: [["w", 25], ["m", 75]],
                    age: "20 + 20W6",
                    height: "128 + 2W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },

        /* *******************
            Elven
         ****************** */
        {
            species: "elven",
            key: 'auelfen', name: 'Auelfen', img: "modules/dsa5-core/icons/culture/Auelfen.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/elfen",
                rollTables: {
                    "vorname-m": "Elf Vorname männlich",
                    "vorname-w": "Elf Vorname weiblich",
                    "nachname": "Elf Nachname",
                    "origin": "Auelf Orte",
                    "haircolor": "Auelf Haarfarbe",
                    "eyecolor": "Auelf Augenfarbe",
                },
                pattern: {
                    height: "168 + 2W20",
                    weightSubtrahend: "110 + 2W6",
                }
            }
        },
        {
            species: "elven",
            key: 'firnelfen', name: 'Firnelfen', img: "modules/dsa5-core/icons/culture/Firnelfen.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/elfen",
                rollTables: {
                    "vorname-m": "Elf Vorname männlich",
                    "vorname-w": "Elf Vorname weiblich",
                    "nachname": "Elf Nachname",
                    "origin": "Firnelf Orte",
                    "haircolor": "Firnelf Haarfarbe",
                    "eyecolor": "Firnelf Augenfarbe",
                },
                pattern: {
                    height: "168 + 2W20",
                    weightSubtrahend: "110 + 2W6",
                }
            }
        },      // icons/svg/hanging-sign.svg
        {
            species: "elven",
            key: 'waldelfen', name: 'Waldelfen', img: "modules/dsa5-core/icons/culture/Waldelfen.webp",
            data: {
                images: "modules/dsa5-meistertools-zutaten/images/archetypes/waldelfen",
                rollTables: {
                    "vorname-m": "Elf Vorname männlich",
                    "vorname-w": "Elf Vorname weiblich",
                    "nachname": "Elf Nachname",
                    "origin": "Waldelf Sippe",
                    "haircolor": "Waldelf Haarfarbe",
                    "eyecolor": "Waldelf Augenfarbe",
                },
                pattern: {
                    height: "168 + 2W20",
                    weightSubtrahend: "110 + 2W6",
                }
            }
        },
    ],


    /**
     * Species
     */
    species: [
        {key: "human", name: "Mensch", img: "systems/dsa5/icons/species/Mensch.webp"},
        {key: "elven", name: "Elf", img: "systems/dsa5/icons/species/Elf.webp"},
        {key: "dwarf", name: "Zwerg", img: "systems/dsa5/icons/species/Zwerg.webp"},
        //{key: "orcs", name: "Orks", img: "systems/dsa5/icons/species/Ork.webp"}, // age: 10 + 4W6
    ],


    /**
     * Gender
     */
    gender: [
        {key: "random", name: "zufall", icon: "fas fa-dice"},
        {key: "w", name: "weiblich", icon: "fas fa-venus"},
        {key: "m", name: "männlich", icon: "fas fa-mars"}
    ]
}
