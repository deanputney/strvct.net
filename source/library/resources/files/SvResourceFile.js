"use strict";

/**
 * @module library.resources.files
 */

/**
 * @class SvResourceFile
 * @extends BaseNode
 * @classdesc Represents a resource file with methods for loading and managing file data.
 */
(class SvResourceFile extends BaseNode {

    /**
     * @description Initializes the prototype slots for the SvResourceFile class.
     */
    initPrototypeSlots () {
        /**
         * @member {String} path - Path from _index.json entry
         * @category File Properties
         */
        {
            const slot = this.newSlot("path", ".");
            slot.setSlotType("String");
        }

        /**
         * @member {String} resourceHash - Hash from _index.json entry
         * @category File Properties
         */
        {
            const slot = this.newSlot("resourceHash", null);
            slot.setSlotType("String");
        }

        /**
         * @member {Number} resourceSize - Size from _index.json entry
         * @category File Properties
         */
        {
            const slot = this.newSlot("resourceSize", null);
            slot.setSlotType("Number");
        }

        /**
         * @member {Object} data - Raw data of the resource
         * @category Data Management
         */
        {
            const slot = this.newSlot("data", null);
            slot.setSlotType("Object");
        }

        /**
         * @member {Object} value - The value decoded from the data, e.g., value = JSON.parse(data)
         * @category Data Management
         */
        {
            const slot = this.newSlot("value", null);
            slot.setSlotType("Object");
        }

        /**
         * @member {Error} error - Error object if any error occurs during processing
         * @category Error Handling
         */
        {
            const slot = this.newSlot("error", null);
            slot.setSlotType("Error");
        }

        /**
         * @member {Promise} promiseForLoad - Holds promise used for reading from URL request or indexedDB
         * @category Loading
         */
        {
            const slot = this.newSlot("promiseForLoad", null); 
            slot.setDescription("holds promise used for reading from URL request or indexedDB");
            slot.setSlotType("Promise");
        }

        /**
         * @member {Boolean} isLoading - Indicates if the resource is currently loading
         * @category Loading
         */
        {
            const slot = this.newSlot("isLoading", false);
            slot.setSlotType("Boolean");
        }

        /**
         * @member {Boolean} isLoaded - Indicates if the resource has been loaded
         * @category Loading
         */
        {
             const slot = this.newSlot("isLoaded", false);
             slot.setSlotType("Boolean");
        }

        /**
         * @member {String} loadState - Represents the current load state of the resource
         * @category Loading
         */
        {
            const slot = this.newSlot("loadState", null);
            slot.setSlotType("String");
        }
    }

    /**
     * @description Initializes the prototype properties.
     */
    initPrototype () {
        this.setTitle("File");
        this.setNoteIsSubnodeCount(true);
        this.setIsDebugging(true);
    }

    /**
     * @description Initializes the SvResourceFile instance.
     * @returns {SvResourceFile} The initialized instance.
     * @category Initialization
     */
    init () {
        super.init();
        this.setPromiseForLoad(Promise.clone());
        return this;
    }

    /**
     * @description Gets the name of the resource file.
     * @returns {String} The file name.
     * @category File Properties
     */
    name () {
        return this.path().lastPathComponent();
    }

    nameWithoutExtension () {
        return this.name().before(".");
    }

    /**
     * @description Gets the title of the resource file.
     * @returns {String} The file name as the title.
     * @category File Properties
     */
    title () {
        return this.name();
    }

    /**
     * @description Gets the file extension of the resource file.
     * @returns {String} The file extension.
     * @category File Properties
     */
    pathExtension () {
        return this.path().pathExtension();
    }

    /**
     * @description Sets up subnodes for the resource file.
     * @returns {SvResourceFile} The current instance.
     * @category Initialization
     */
    setupSubnodes () {
        return this;
    }

    /**
     * @description Checks if the resource file has data.
     * @returns {Boolean} True if data is present, false otherwise.
     * @category Data Management
     */
    hasData () {
        return this.data() !== null;
    }

    /**
     * @description Gets the URL resource for the file.
     * @returns {UrlResource} The URL resource object.
     * @category Loading
     */
    urlResource () {
        return UrlResource.with(this.path());
    }

    /**
     * @description Attempts to load the resource synchronously from the CAM.
     * This only works if the resource content is already in the CAM and has been loaded.
     * @returns {boolean} True if successfully loaded synchronously, false otherwise.
     * @category Loading
     */
    attemptSyncLoad () {
        // First check if we already have data loaded
        if (this.hasData()) {
            // Data is already loaded, parse value if needed
            try {
                const value = this.syncValueFromData();
                this.setValue(value);
                return true;
            } catch (error) {
                console.error("Error parsing data synchronously:", error);
                return false;
            }
        }

        // Try to get content from ResourceManager's synchronous CAM cache
        const content = ResourceManager.shared().syncContentForPath(this.path());
        if (content !== null) {
            // Content found in CAM! Set it as data
            this._data = {
                asString: function() { return content; }
            };
            
            try {
                const value = this.syncValueFromData();
                this.setValue(value);
                this.promiseForLoad().callResolveFunc(); // Mark promise as resolved
                return true;
            } catch (error) {
                console.error("Error parsing CAM content synchronously:", error);
                this._data = null;
                return false;
            }
        }

        return false;
    }

    /**
     * @description Synchronously gets the value from the file data.
     * @returns {*} The parsed value from the file data.
     * @category Data Management
     */
    syncValueFromData () {
        const ext = this.pathExtension();
        const data = this.data();
        if (ext === "json") {
            const jsonString = data.asString();
            return JSON.parse(jsonString);
        } else if (["js", "css", "txt"].includes(ext)) {
            const textString = data.asString();
            return textString;
        }
        return this.data();
    }

    /**
     * @description Loads the resource file asynchronously.
     * @returns {Promise<SvResourceFile>} A promise that resolves with the current instance after loading.
     * @category Loading
     */
    async promiseLoad () {
        const url = this.urlResource();
        url.setResourceHash(this.resourceHash());
        const r = await url.promiseLoad();
        this._data = r.data();
        this.promiseForLoad().callResolveFunc();
        this.setValue(await this.asyncValueFromData());
        return this;
    }

    /**
     * @description Gets a promise that resolves with the file data.
     * @returns {Promise<Object>} A promise that resolves with the file data.
     * @category Data Management
     */
    async promiseData () {
        if (!this.hasData()) {
            await this.promiseLoad();
        }
        return this.data();
    }

    /**
     * @description Gets the list of file extensions to precache.
     * @returns {String[]} An array of file extensions to precache.
     * @category Caching
     */
    precacheExtensions () {
        return ["json", "txt", "ttf", "woff", "woff2"];
    }

    /**
     * @description Precaches the resource file if appropriate based on its extension.
     * @returns {Promise<SvResourceFile>} A promise that resolves with the current instance after precaching.
     * @category Caching
     */
    async prechacheWhereAppropriate () {
        if (this.precacheExtensions().includes(this.pathExtension())) {
            // Try synchronous load from CAM first
            if (!this.attemptSyncLoad()) {
                // Fall back to async load if not in CAM (shouldn't happen for these extensions)
                await this.promiseLoad();
            }
        }
        return this;
    }

    /**
     * @description Asynchronously gets the value from the file data.
     * @returns {Promise<*>} A promise that resolves with the parsed value from the file data.
     * @category Data Management
     */
    async asyncValueFromData () {
        try {
            const ext = this.pathExtension();
            const data = this.data();
            if (ext === "json") {
                const jsonString = data.asString();
                return JSON.parse(jsonString);
            } else if (["js", "css", "txt"].includes(ext)) {
                const textString = data.asString();
                return textString;
            }
            return this.data();
        } catch (error) {
            console.error(this.type() + ".asyncValueFromData() error loading value from data for " + this.path() + " : " + error.message);
            debugger;
            throw error;
        }
    }

}.initThisClass());