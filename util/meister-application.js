export class MeisterApplication extends FormApplication {
    constructor() {
        super();
        this.isOpen = false
        this._expandedTargets = {}
    }

    toggle() {
        if (this.isOpen)
            return this.close()
        this.render(true)
    }

    close() {
        super.close()
        this.isOpen = false
    }

    render(force) {
        super.render(force)
        this.isOpen = true
    }

    async getData() {
        const data = await super.getData();
        mergeObject(data, {
            _expandedTargets: this._expandedTargets
        })
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);
        html.find(".toggle").click((event) => {
            const target = $(event.currentTarget).attr("data-target")
            this._expandedTargets[target.replace(".", "")] = $(event.currentTarget).hasClass('show')
            $(event.currentTarget).toggleClass('show')
            $(target).toggle()
        })
        html.find(".remove-entry").click((event) => {
            $(event.currentTarget).parent().parent().remove()
        })
        html.find(".insert-entry").click((event) => {
            const target = $(event.currentTarget).attr("data-path")
            const clone = $(`#${target}`).children().last().clone(true)
            clone.find('input').each((i, e) => {
                e.name = e.name.replace(/\[(\d+)]/, (...match) => {
                    const newIndex = parseInt(match[1]) + 1
                    return `[${newIndex}]`
                });
                e.value = ""
            })
            clone.find('select').each((i, e) => {
                e.name = e.name.replace(/\[(\d+)]/, (...match) => {
                    const newIndex = parseInt(match[1]) + 1
                    return `[${newIndex}]`
                });
                e.value = ""
            })
            clone.appendTo(`#${target}`)
        })
        html.find("a.sort-up").click(event => {
            const e = $(event.currentTarget).parent().parent()
            const i = e.prev()
            i.before(e);
        })
        html.find("select.autocomplete").change((event) => {
            const targets = $(event.currentTarget).attr("data-targets").split(" ")
            console.log(targets)
            const name = $(event.currentTarget.selectedOptions)[0].text.split(" (")[0]
            $(event.currentTarget).parent().siblings(".form-group").children("input").each((i, e) => {
                if (!e.value && targets.includes(e.name.split(".").pop())) e.value = name
            })
        })
    }

}
