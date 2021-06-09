const moduleName = ""
const colorPalette = ['#536DFE', '#FF9800', '#795548', '#455A64', '#03A9F4', '#D32F2F']
const umlaute = {
    '\u00dc': 'UE', '\u00c4': 'AE', '\u00d6': 'OE', '\u00fc': 'ue', '\u00e4': 'ae', '\u00f6': 'oe', '\u00df': 'ss'
}

function replaceUmlaute(str) {
    return str
        .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
            const big = umlaute[a.slice(0, 1)];
            return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
        })
        .replace(new RegExp('[' + Object.keys(umlaute).join('|') + ']', "g"),
            (a) => umlaute[a]
        );
}



export {moduleName, colorPalette, replaceUmlaute}
