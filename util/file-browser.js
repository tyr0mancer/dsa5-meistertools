/**
 * Find images in the deepest possible path
 * FilePicker Variation with no UI
 */
export class FileBrowser extends FilePicker {
    constructor(options) {
        super(options);
    }

    /**
     * @override
     * @param target
     * @param options
     * @return {Promise<undefined>}
     */
    async browse(target, options = {}) {
        if (game.world && !game.user.can("FILES_BROWSE")) return;
        target = typeof target === "string" ? target : this.target;
        const source = this.activeSource;
        options = mergeObject({
            extensions: this.extensions,
            wildcard: false
        }, options);
        if (source === "s3") {
            if (this.constructor.S3_BUCKETS === null) {
                const buckets = await this.constructor.browse("s3", "");
                this.constructor.S3_BUCKETS = buckets.dirs;
            }
            this.sources.s3.buckets = this.constructor.S3_BUCKETS;
            if (!this.source.bucket) this.source.bucket = this.constructor.S3_BUCKETS[0];
            options.bucket = this.source.bucket;
        }
        if (target.startsWith("/")) target = target.slice(1);
        if (target === CONST.DEFAULT_TOKEN) target = this.constructor.LAST_BROWSED_DIRECTORY;
        let result
        while (!result) {
            result = await this.constructor.browse(source, target, options).catch(() => {
            });
            let target_arr = target.split('/')
            target_arr.pop()
            target = target_arr.join('/')
        }
        return result;
    }

}
