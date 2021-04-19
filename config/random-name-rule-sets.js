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
    }
}
