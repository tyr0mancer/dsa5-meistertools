/* todo move this to foundry settings, so the user can have an own name ruleset */
export default {
    "albernisch": {
        tables: {
            "vornamem": "albernia_vorname_m",
            "vornamew": "albernia_vorname_w",
            "nachname": "gareth_nachname"
        }
    },
    "garethisch": {
        tables: {
            "vornamem": "gareth_vorname_m",
            "vornamew": "gareth_vorname_w",
            "nachname": "gareth_nachname"
        }
    },
    "bornlaendisch": {
        tables: {
            "vornamem": "bornlaendisch_vorname_m",
            "vornamew": "bornlaendisch_vorname_w",
            "nachname": "bornlaendisch_nachname"
        }
    },
    "horasisch": {
        tables: {
            "vornamem": "horasisch_vorname_m",
            "vornamew": "horasisch_vorname_w",
            "nachname": "horasisch_nachname"
        }
    },
    "weidensche": {
        tables: {
            "vornamem": "weidensche_vorname_m",
            "vornamew": "weidensche_vorname_w",
            "nachnamevorsilbe": "weidensche_nachname_prefix",
            "nachnamenachsilbe": "weidensche_nachname_suffix"
        },
        rules: {
            "m": "_vornamem _nachnamevorsilbe_nachnamenachsilbe",
            "w": "_vornamew _nachnamevorsilbe_nachnamenachsilbe",
        }
    },
    "darpatisch": {
        tables: {
            "vornamem": "darpatisch_vorname_m",
            "vornamew": "darpatisch_vorname_w",
            "nachnamevorsilbe": "darpatisch_nachname_prefix",
            "nachnamenachsilbe": "darpatisch_nachname_suffix"
        },
        rules: {
            "m": "_vornamem _nachnamevorsilbe_nachnamenachsilbe",
            "w": "_vornamew _nachnamevorsilbe_nachnamenachsilbe"
        }
    },
    "thorwaler": {
        tables: {
            "vornamem": "thorwaler_vorname_m",
            "vornamew": "thorwaler_vorname_w",
            "son": ['son'],
            "dottir": ['dotter', 'dottir'],
        },
        rules: {
            "m": "_vornamem _vornamem_son",
            "w": "_vornamew _vornamew_dottir"
        }
    },
    "moha": {
        tables: {
            "vornamem": "moha_name_m",
            "vornamew": "moha_name_w"
        },
        rules: {
            "m": "_vornamem",
            "w": "_vornamew"
        }
    },
    "zwerge": {
        tables: {
            "vornamem": "zwerge_vorname_m",
            "vornamew": "zwerge_vorname_w"
        },
        rules: {
            "m": "_vornamem, Sohn des _vornamem",
            "w": "_vornamew, Tochter der _vornamew"
        }
    },
    "huegelzwerge": {
        tables: {
            "vornamem": "zwerge_vorname_m",
            "vornamew": "zwerge_vorname_w"
        },
        rules: {
            "m": "_vornamem, Sohn des _vornamem",
            "w": "_vornamew, Tochter der _vornamew"
        }
    },
    "waldelfen": {
        tables: {
            "vornamem": "elfen_vorname_m",
            "vornamew": "elfen_vorname_w",
            "nachname": "elfen_nachname"
        }
    },
    "halbelfen": {
        tables: {
            "vornamem": "elfen_vorname_m",
            "vornamew": "elfen_vorname_w",
            "nachname": "elfen_nachname"
        }
    },
    "auelfen": {
        tables: {
            "vornamem": "elfen_vorname_m",
            "vornamew": "elfen_vorname_w",
            "nachname": "elfen_nachname"
        }
    },
    "amazonen": {
        tables: {
            "vornamew": "amazonen_vorname"
        },
        rules: {
            "w": "_vornamew"
        }
    },

    "nivesen": {
        tables: {
            "vornamem": "nivesen_vorname_m",
            "vornamew": "nivesen_vorname_w"
        },
        rules: {
            "m": "_vornamem",
            "w": "_vornamew"
        }
    },
    "novadis": {
        tables: {
            "vornamem": "tulamiden_vorname_m",
            "vornamew": "tulamiden_vorname_w",
            "nachnamem": ["ibn","ben"],
            "nachnamew": ["saba","suni","sunya"]

        },
        rules: {
            "m": "_vornamem _nachnamem _vornamem",
            "w": "_vornamew _nachnamew _vornamew"
        }
    },
    "tulamiden": {
        tables: {
            "vornamem": "tulamiden_vorname_m",
            "vornamew": "tulamiden_vorname_w",
            "nachnamem": ["ibn","ben"],
            "nachnamew": ["saba","suni","sunya"]

        },
        rules: {
            "m": "_vornamem _nachnamem _vornamem",
            "w": "_vornamew _nachnamew _vornamew"
        }
    },
    "norbarden": {
        tables: {
            "vornamem": "norbarden_vorname_m",
            "vornamew": "norbarden_vorname_w",
            "nachname": "norbarden_nachname"
        }
    },

}
