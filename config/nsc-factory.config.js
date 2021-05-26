export default {

    /**
     * default settings
     */
    settings: {
        baseActorCollection: "dsa5-homebrew.actor-archetypen",
        folderName: "MeisterTools NSC",
        closeAfterGeneration: true
    },

    lastSelection: {
        "amount": 1,
        "gender": "random",
        "position": "top-left",
        "archetype": "mittelreich",
        "variation": "albernisch",
        "profession": "AENj6jLndvawKiHG",
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
        actor: {
            collection: "dsa5-homebrew.actor-archetypen",
            _id: "tRjcwua68W6A0vge",
        },
        rollTables: {
            "vorname-m": "gareth_vorname_m",
            "vorname-w": "gareth_vorname_w",
            "nachname": "gareth_nachname",
            "origin": ["Gareth", "Havena", "Gashok", "Lowangen"],
            "physicalTrait": "physical_trait",
            "catchphrase": "catchphrases",
            "haircolor": "Mittelländer Haarfarbe",
            "eyecolor": "Mittelländer Augenfarbe",
            "jobs": "buerger_berufe"
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
            physicalTrait: "${physicalTrait}",
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
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/mittellande"
            },
            variations: [
                {
                    key: "garethisch",
                    name: "Gareth und Umgebung"
                },
                {
                    key: "albernisch",
                    name: "Albernia",
                    data: {
                        rarity: {
                            current: 5, general: 1, regions: [['albernia', 5], ["mittelreich", 2]]
                        },
                        rollTables: {
                            "vorname-m": "albernia_vorname_m",
                            "vorname-w": "albernia_vorname_w",
                            "origin": "albernia_orte",
                        }
                    }
                },
                {
                    key: "weiden",
                    name: "Weiden",
                    data: {
                        rollTables: {
                            "vorname-m": "weidensche_vorname_m",
                            "vorname-w": "weidensche_vorname_w",
                            "nachname-prefix": "weidensche_nachname_prefix",
                            "nachname-suffix": "weidensche_nachname_suffix",
                            "origin": "weiden_orte"
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
                        rollTables: {
                            "vorname-m": "darpatisch_vorname_m",
                            "vorname-w": "darpatisch_vorname_w",
                            "nachname-prefix": "darpatisch_nachname_prefix",
                            "nachname-suffix": "darpatisch_nachname_suffix",
                            "origin": "darpatien_orte"
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
                actor: {collection: '', _id: ''},
                images: "modules/dsa5-homebrew/images/actors/random-npc/mittellande",
                rollTables: {
                    "vorname-m": "horasisch_vorname_m",
                    "vorname-w": "horasisch_vorname_w",
                    "nachname": "horasisch_nachname",
                    "origin": "horasreich_orte"
                },
                rarity: {
                    current: 2, general: 1, regions: [["horasreich", 5], ['mittelreich', 3]]
                },
            }
        },
        {
            species: "human",
            key: "bornland", name: "Bornland", img: "modules/dsa5-core/icons/culture/Bornland.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/mittellande",
                rollTables: {
                    "vorname-m": "bornlaendisch_vorname_m",
                    "vorname-w": "bornlaendisch_vorname_w",
                    "nachname": "bornlaendisch_nachname",
                    "origin": "bornland_orte"
                }
            }
        },
        {
            species: "human",
            key: 'thorwal', name: 'Thorwal', img: "modules/dsa5-core/icons/culture/Thorwal.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/thorwaler",
                rollTables: {
                    "vorname-m": "thorwaler_vorname_m",
                    "vorname-w": "thorwaler_vorname_w",
                    "zusatz-m": ['son'],
                    "zusatz-w": ['dotter', 'dottir'],
                    "origin": "thorwal_orte",
                    "haircolor": "Thorwaler Haarfarbe",
                    "eyecolor": "Thorwaler Augenfarbe",
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
                images: "modules/dsa5-homebrew/images/actors/random-npc/norbarden",
                rollTables: {
                    "vorname-m": "norbarden_vorname_m",
                    "vorname-w": "norbarden_vorname_w",
                    "nachname": "norbarden_nachname",
                    "origin": "norbarden_orte",
                    "haircolor": "Norbarde Haarfarbe",
                    "eyecolor": "Norbarde Augenfarbe",
                }
            }
        },
        {
            species: "human",
            key: 'novadis', name: 'Novadis', img: "modules/dsa5-core/icons/culture/Novadis.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/tulamiden",
                rollTables: {
                    "vorname-m": "tulamiden_vorname_m",
                    "vorname-w": "tulamiden_vorname_w",
                    "zusatz-m": ["ibn", "ben"],
                    "zusatz-w": ["saba", "suni", "sunya"],
                    "origin": "novadis_orte",
                    "haircolor": "Tulamide Haarfarbe",
                    "eyecolor": "Tulamide Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender} ${zusatz-gender} ${vorname-gender}",
                }
            },
            rarity: {
                current: 1, general: 1, regions: [['khom', 5], ["tulamiden", 3]]
            },
        },
        {
            species: "human",
            key: 'nivesen', name: 'Nivesen', img: "modules/dsa5-core/icons/culture/Nivesen.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/nivesen",
                rollTables: {
                    "vorname-m": "nivesen_vorname_m",
                    "vorname-w": "nivesen_vorname_w",
                    "origin": "nivesen_orte",
                    "haircolor": "Nivese Haarfarbe",
                    "eyecolor": "Nivese Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}",
                }
            }
        },
        {
            species: "human",
            key: 'mohas', name: 'Mohas', img: "modules/dsa5-core/icons/culture/Mohas.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/moha",
                rollTables: {
                    "vorname-m": "moha_name_m",
                    "vorname-w": "moha_name_w",
                    "origin": "mohas_orte",
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
        /*
                {
                    species: "human",
                    key: 'amazonen', name: 'Amazonen', img: "modules/dsa5-core/icons/culture/Amazonen.webp",
                    data: {
                        images: "/human/amazonen",
                        rollTables: {
                            "vorname": "amazonen_vorname",
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
            key: 'ambosszwerge', name: 'Ambosszwerge', img: "modules/dsa5-core/icons/culture/Ambosszwerge.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/zwerge",
                rollTables: {
                    "vorname-m": "zwerge_vorname_m",
                    "vorname-w": "zwerge_vorname_w",
                    "zusatz-w": [", Tochter der"],
                    "zusatz-m": [", Sohn des"],
                    "origin": "ambosszwerge_orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}${zusatz-gender} ${vorname-gender}",
                    genderRatio: [["w", 25], ["m", 75]],
                    height: "128 + 2W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },
        {
            species: "dwarf",
            key: 'brillantzwerge', name: 'Brillantzwerge', img: "modules/dsa5-core/icons/culture/Brillantzwerge.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/zwerge",
                rollTables: {
                    "vorname-m": "zwerge_vorname_m",
                    "vorname-w": "zwerge_vorname_w",
                    "zusatz-w": [", Tochter der"],
                    "zusatz-m": [", Sohn des"],
                    "origin": "brillantzwerge_orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}${zusatz-gender} ${vorname-gender}",
                    genderRatio: [["w", 25], ["m", 75]],
                    height: "128 + 2W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },
        {
            species: "dwarf",
            key: 'erzzwerge', name: 'Erzzwerge', img: "modules/dsa5-core/icons/culture/Erzzwerge.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/zwerge",
                rollTables: {
                    "vorname-m": "zwerge_vorname_m",
                    "vorname-w": "zwerge_vorname_w",
                    "zusatz-w": [", Tochter der"],
                    "zusatz-m": [", Sohn des"],
                    "origin": "erzzwerge_orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    name: "${vorname-gender}${zusatz-gender} ${vorname-gender}",
                    genderRatio: [["w", 25], ["m", 75]],
                    height: "128 + 2W6",
                    weightSubtrahend: "80 + 1W6"
                }
            }
        },
        {
            species: "dwarf",
            key: 'huegelzwerge', name: 'Huegelzwerge', img: "modules/dsa5-core/icons/culture/Huegelzwerge.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/huegelzwerge",
                rollTables: {
                    "vorname-m": "huegelzwerge_vorname_m",
                    "vorname-w": "huegelzwerge_vorname_w",
                    "nachname": "huegelzwerge_nachname",
                    "origin": "huegelzwerge_orte",
                    "haircolor": "Zwerg Haarfarbe",
                    "eyecolor": "Zwerg Augenfarbe",
                },
                pattern: {
                    genderRatio: [["w", 25], ["m", 75]],
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
                images: "modules/dsa5-homebrew/images/actors/random-npc/auelfen",
                rollTables: {
                    "vorname-m": "elfen_vorname_m",
                    "vorname-w": "elfen_vorname_w",
                    "nachname": "elfen_nachname",
                    "origin": "auelfen_orte",
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
                images: "modules/dsa5-homebrew/images/actors/random-npc/auelfen",
                rollTables: {
                    "vorname-m": "elfen_vorname_m",
                    "vorname-w": "elfen_vorname_w",
                    "nachname": "elfen_nachname",
                    "origin": "firnelfen_orte",
                    "haircolor": "Firnelf Haarfarbe",
                    "eyecolor": "Firnelf Augenfarbe",
                },
                pattern: {
                    height: "168 + 2W20",
                    weightSubtrahend: "110 + 2W6",
                }
            }
        },
        {
            species: "elven",
            key: 'waldelfen', name: 'Waldelfen', img: "modules/dsa5-core/icons/culture/Waldelfen.webp",
            data: {
                images: "modules/dsa5-homebrew/images/actors/random-npc/waldelfen",
                rollTables: {
                    "vorname-m": "elfen_vorname_m",
                    "vorname-w": "elfen_vorname_w",
                    "nachname": "elfen_nachname",
                    "origin": "waldelfen_orte",
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
        {key: "human", name: "Menschen", img: "systems/dsa5/icons/species/Mensch.webp"},
        {key: "elven", name: "Elfen", img: "systems/dsa5/icons/species/Elf.webp"},
        {key: "dwarf", name: "Zwerge", img: "systems/dsa5/icons/species/Zwerg.webp"},
        //{key: "orcs", name: "Orks", img: "systems/dsa5/icons/species/Ork.webp"},
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
