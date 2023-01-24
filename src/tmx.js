/*
 * tmx.js - model a tmx file
 *
 * Copyright © 2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'node:fs';

import log4js from "@log4js-node/log4js-api";
import xmljs from 'xml-js';
import Locale from 'ilib-locale';
import { TranslationUnit, TranslationVariant, makeDirs, objectMap } from 'ilib-tools-common';
import { Path } from 'ilib-common';
import cldrSegmentation from "cldr-segmentation";

const logger = log4js.getLogger("ilib-tmx.tmx");
const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));

function versionString(num) {
    const parts = ("" + num).split(".");
    const integral = parts[0].toString();
    const fraction = parts[1] || "0";
    return integral + '.' + fraction;
}

function getVersion() {
    const pkg = JSON.parse(fs.readFileSync(Path.join(__dirname, "..", "package.json"), "utf-8"));
    return pkg ? pkg.version : undefined;
}

function makeArray(arrayOrObject) {
    return Array.isArray(arrayOrObject) ? arrayOrObject : [ arrayOrObject ];
}

/**
 * Return a json object that encodes the xml structure of this translation
 * unit variant. This is used to convert to xml below.
 *
 * @param {TranslationVariant} tv the variant to serialize
 * @returns {Object} a json object which encodes this variant.
 * @private
 */
function serializeTranslationVariant(tv) {
    return {
        _attributes: {
            "xml:lang": tv.locale
        },
        seg: {
            "_text": tv.string
        }
    };
};

/**
 * Return a json object that encodes the xml structure of this translation
 * unit. This is used to convert to xml below.
 *
 * @param {TranslationUnit} tu the unit to serialize
 * @returns {Object} a json object which encodes this unit.
 * @private
 */
function serializeTranslationUnit(tu) {
    if (!tu.variants || tu.variants.length < 2) {
        // nothing in this translation unit, so don't serialize it
        return undefined;
    }

    let retval = {
        _attributes: {
            srclang: tu.sourceLocale
        }
    };
    for (let p in tu.properties) {
        if (!retval.prop) retval.prop = [];
        retval.prop.push({
            _attributes: {
                type: p
            },
            _text: tu.properties[p]
        });
    }
    retval.tuv = tu.variants.map(variant => {
        return serializeTranslationVariant(variant);
    });

    return retval;
};

/**
 * @class A class that represents an tmx 1.4b file.
 * See https://www.gala-global.org/tmx-14b for details on the file format.
 */
class TMX {
    /**
     * Construct a new TMX file.
     * The options may be undefined, which represents a new,
     * clean Tmx instance. The options object may also
     * be an object with the following properties:
     *
     * <ul>
     * <li><i>path</i> - the path to the tmx file on disk
     * <li><i>sourceLocale</i> - specify the default source locale if a resource doesn't have a locale itself.
     * Default is "en-US".
     * <li><i>version</i> - The version of tmx that will be produced by this instance. Default is "1.4".
     * <li><i>properties</i> - an object containing general string properties that will appear in the header
     *   of the tmx file. Typical properties are:
     *   <ul>
     *     <li><i>creationtool</i> - the full name of the tool that created this tmx file. Default: "loctool"
     *     <li><i>creationtoolversion</i> - the version of the tool that created this tmx file. Default: the version
     *         of this loctool
     *     <li><i>originalFormat</i> - the format of the data before it was transformed into tmx. That can be any
     *         string.
     *   </ul>
     * <li><i>segmentation</i> - How the strings should be segmented. Choices are "paragraph" and "sentence."
     * Default is "paragraph". The tmx settings of "block" and "phrase" are not yet supported.
     * </ul>
     *
     * @constructor
     * @param {Array.<Object>|undefined} options options to
     * initialize the file, or undefined for a new empty file
     */
    constructor(options) {
        this.version = 1.4;
        this.properties = {};
        this.sourceLocale = "en-US";
        this.segtype = "paragraph";
        this.datatype = "unknown";

        if (options) {
            this.properties = options.properties || this.properties;
            this.sourceLocale = options.sourceLocale || this.sourceLocale;
            if (typeof(options.version) !== 'undefined') {
                this.version = Number.parseFloat(options.version);
            }
            if (options.segmentation && (options.segmentation === "paragraph" || options.segmentation === "sentence")) {
                this.segtype = options.segmentation;
            }
            [ "creationtool", "creationtoolversion", "path" ].forEach(prop => {
                if (options[prop]) {
                    this[prop] = options[prop];
                }
            });
        }

        // place to store the translation units
        this.tu = [];
        this.tuhash = {};
    }

    /**
     * Get the path to this tmx file.
     * @returns {String|undefined} the path to this tmx file
     */
    getPath() {
        return this.path;
    }

    /**
     * Set the path to this tmx file.
     * @param {String} pathName the path to the tmx file
     */
    setPath(pathName) {
        this.path = pathName;
    }

    /**
     * Get the string properties of this tmx file from the
     * header.
     * @returns {Object} the string properties of this tmx file
     */
    getProperties() {
        return this.properties;
    }

    /**
     * Set a string property of this tmx file.
     * @param {String} property the name of the property to set
     * @param {String} value the value of the property to set
     */
    addProperty(property, value) {
        this.properties[property] = value;
    }

    /**
     * Set the string properties of this tmx file.
     * @param {Object} properties the properties to set
     */
    setProperties(properties) {
        this.properties = properties;
    }

    /**
     * Get the translation units in this tmx.
     *
     * @returns {Array.<Object>} the translation units in this tmx
     */
    getTranslationUnits() {
        return this.tu;
    }

    /**
     * Add this translation unit to this tmx.
     *
     * @param {TranslationUnit} unit the translation unit to add to this tmx
     */
    addTranslationUnit(unit) {
        logger.trace("Tmx " + this.path + ": Adding translation unit: " + JSON.stringify(unit, undefined, 4));

        const hashKey = unit.hashKey();

        if (this.tuhash[hashKey]) {
            // existing string, so merge in this unit
            const existing = this.tuhash[hashKey];
            existing.addVariants(unit.getVariants());
        } else {
            // new string
            this.tu.push(unit);
            this.tuhash[hashKey] = unit;
        }
    }


    /**
     * Add translation units to this tmx.
     *
     * @param {Array.<Object>} files the translation units to add to this tmx
     */
    addTranslationUnits(units) {
        units.forEach(unit => {
            this.addTranslationUnit(unit);
        });
    }

    /**
     * Segment a string according to the rules for the locale, and the style
     * set for this tmx object, either "paragraph" or "sentence", and return
     * an array of segments.
     *
     * @param {String} string the string to segment
     * @param {String} locale the locale
     * @returns {Array.<String>} an array containing one or more strings that
     * are the segments of the current string
     */
    segmentString(string, locale) {
        if (!string) return [];
        if (this.segtype === "paragraph") {
            return [string];
        }

        const l = new Locale(locale);
        const suppressions = cldrSegmentation.suppressions[l.getLanguage()];
        return cldrSegmentation.sentenceSplit(string, suppressions).map(str => {
            return str ? str.trim() : str;
        });
    }

    /**
     * Add a resource to this tmx file. If a resource
     * with the same file, locale, context, and key already
     * exists in this tmx file, what happens to it is
     * determined by the allowDups option. If this is false,
     * the existing resource will be replaced, and if it
     * is true, this new resource will be added as an
     * instance of the existing resource.
     *
     * @param {Resource} res a resource to add
     */
    addResource(res) {
        if (!res || res.getSourceLocale() !== this.sourceLocale) return;

        let tu;
        const addTarget = res.getTargetLocale() && res.getTargetLocale() !== this.sourceLocale;

        switch (res.getType()) {
            default:
            case "string":
                const translationSegments = addTarget && this.segmentString(res.getTarget(), res.getTargetLocale());
                const sourceSegments = this.segmentString(res.getSource(), res.getSourceLocale());
                sourceSegments.forEach((segment, i) => {
                    tu = new TranslationUnit({
                        sourceLocale: res.getSourceLocale(),
                        source: segment,
                        datatype: res.getDataType()
                    });
                    tu.addVariant(new TranslationVariant({
                        locale: res.getSourceLocale(),
                        string: segment
                    }));
                    if (addTarget && res.getTarget() && translationSegments[i]) {
                        tu.addVariant(new TranslationVariant({
                            locale: res.getTargetLocale(),
                            string: translationSegments[i]
                        }));
                    }
                    tu.addProperties({
                        "x-context": res.getContext(),
                        "x-flavor": res.getFlavor(),
                        "x-project": res.getProject()
                    });
                    this.addTranslationUnit(tu);
                });
                break;

            case "array":
                const srcArr = res.getSourceArray().map(element => {
                    return this.segmentString(element, res.getSourceLocale());
                });
                const tarArr = addTarget && res.getTarget() && res.getTarget().map(element => {
                    return this.segmentString(element, res.getTargetLocale());
                });
                srcArr.forEach((element, i) => {
                    element.forEach((string, j) => {
                        tu = new TranslationUnit({
                            sourceLocale: res.getSourceLocale(),
                            source: string,
                            datatype: res.getDataType()
                        });
                        tu.addVariant(new TranslationVariant({
                            locale: res.getSourceLocale(),
                            string
                        }));
                        if (addTarget && tarArr[i] && j < tarArr[i].length) {
                            tu.addVariant(new TranslationVariant({
                                locale: res.getTargetLocale(),
                                string: tarArr[i][j]
                            }));
                        }
                        tu.addProperties({
                            "x-context": res.getContext(),
                            "x-flavor": res.getFlavor(),
                            "x-project": res.getProject()
                        });
                        this.addTranslationUnit(tu);
                    });
                });
                break;

            case "plural":
                let srcPlurals = res.getSource();
                let tarPlurals = res.getTarget();
                let other = [];
                srcPlurals = objectMap(srcPlurals, string => {
                    return this.segmentString(string, res.getSourceLocale());
                });
                tarPlurals = tarPlurals && objectMap(tarPlurals, string => {
                    return this.segmentString(string, res.getTargetLocale());
                });

                for (let category in srcPlurals) {
                    srcPlurals[category].forEach((string, i) => {
                        tu = new TranslationUnit({
                            sourceLocale: res.getSourceLocale(),
                            source: string,
                            datatype: res.getDataType()
                        });
                        tu.addVariant(new TranslationVariant({
                            locale: res.getSourceLocale(),
                            string
                        }));
                        // The target plurals may not contain a translation
                        // for every category that exists in the source
                        // plurals because the target language may use less
                        // categories than the source language. So, we have
                        // to check if the target category exists first before
                        // we attempt to add a variant for it.
                        if (addTarget && tarPlurals && tarPlurals[category]) {
                            tu.addVariant(new TranslationVariant({
                                locale: res.getTargetLocale(),
                                string: tarPlurals[category][i]
                            }));
                        }
                        if (category === "other") {
                            other.push(tu);
                        }
                        tu.addProperties({
                            "x-context": res.getContext(),
                            "x-flavor": res.getFlavor(),
                            "x-project": res.getProject()
                        });
                        this.addTranslationUnit(tu);
                    });
                }

                // if the target plurals has more categories than
                // the source language, we have to check for those extra
                // categories and add a variant for each of them to the
                // translation unit for the "other" category
                if (addTarget && tarPlurals) {
                    for (let category in tarPlurals) {
                        if (!srcPlurals[category]) {
                            tarPlurals[category].forEach((string, i) => {
                                other[i].addVariant(new TranslationVariant({
                                    locale: res.getTargetLocale(),
                                    string: string
                                }));
                            });
                        }
                    }
                }
                break;
        }
    }

    /**
     * Return the number of translation units in this tmx
     * file.
     *
     * @return {number} the number of translation units in this tmx file
     */
    size() {
        return this.tu.length;
    }

    /**
     * Serialize this tmx instance to a string that contains
     * the tmx format xml text.
     *
     * @return {String} the current instance encoded as an tmx format
     * xml text
     */
    serialize() {
        const json = {
            tmx: {
                _attributes: {
                    version: versionString(this.version)
                },
                header: {
                    _attributes: {
                        segtype: this.segtype,
                        creationtool: this.creationtool || this.properties.creationtool || "loctool",
                        creationtoolversion: this.creationtoolversion || this.properties.creationtoolversion || getVersion(),
                        adminlang: "en-US",
                        srclang: this.sourceLocale,
                        datatype: this.datatype
                    }
                },
                body: {
                }
            }
        };

        if (this.properties.originalFormat) {
            json.tmx.header._attributes["o-tmf"] = this.properties.originalFormat;
        }

        const props = Object.keys(this.properties).forEach(prop => {
            if (prop !== "creationtool" && prop !== "creationtoolversion") {
                if (!json.tmx.header.prop) {
                    json.tmx.header.prop = [];
                }
                json.tmx.header.prop.push({
                    _attributes: {
                        type: prop
                    },
                    _text: this.properties[prop]
                });
            }
        });

        // now finally add each of the units to the json

        json.tmx.body.tu = this.tu.filter(unit => {
            // TUs have to have at least 2 variants (a source + a target) to make it useful.
            // Otherwise, just don't output the variant at all.
            const variants = unit.getVariants();
            return variants.length > 1;
        }).map(unit => {
            return serializeTranslationUnit(unit);
        });

        // logger.trace("json is " + JSON.stringify(json, undefined, 4));

        const xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xmljs.js2xml(json, {
            compact: true,
            spaces: 2
        });

        return xml;
    }

    /**
     * Parse tmx 1.4 files
     * @param {Object} the parsed TMX file in json form
     * @private
     */
    parse(tmx) {
        if (tmx.header && tmx.header._attributes) {
            const attrs = tmx.header._attributes;

            [ "creationtool", "creationtoolversion", "datatype", "segtype" ].forEach(prop => {
                if (attrs[prop]) {
                    this[prop] = attrs[prop];
                }
            });
            if (attrs.srclang) {
                this.sourceLocale = attrs.srclang;
            }
        }
        if (tmx.body) {
            if (tmx.body.tu) {
                const units = makeArray(tmx.body.tu);
                for (let i = 0; i < units.length; i++) {
                    const unit = units[i];
                    const tu = new TranslationUnit();
                    if (unit._attributes & unit._attributes.srclang) {
                        tu.sourceLocale = unit._attributes.srclang;
                    }
                    if (unit.prop) {
                        const props = makeArray(unit.prop);
                        const properties = {};
                        props.forEach(prop => {
                            if (prop._attributes) {
                                properties[prop._attributes.name] = prop._text;
                            } else {
                                logger.warn("Found a prop tag without a name attribute");
                            }
                        });
                        tu.addProperties(properties);
                    }
                    if (unit.note) {
                        tu.comment = unit.note._text;
                    }
                    if (unit.tuv) {
                        const variants = makeArray(unit.tuv);
                        variants.forEach(variant => {
                            let locale, string;
                            if (variant._attributes) {
                                if (variant._attributes.lang) {
                                    locale = variant._attributes.lang;
                                } else if (variant._attributes["xml:lang"]) {
                                    locale = variant._attributes["xml:lang"];
                                }
                            } else {
                                logger.warn("Translation variant found without a lang or xml:lang attribute");
                            }
                            if (variant.seg) {
                                string = variant.seg._text;
                            }
                            if (locale && string) {
                                const variant = new TranslationVariant({
                                    locale,
                                    string
                                });
                                tu.addVariant(variant);
                                if (variant.locale === this.sourceLocale) {
                                    tu.source = variant.string;
                                    tu.sourceLocale = variant.locale;
                                }
                            }
                        });
                    }
                    this.tu.push(tu);
                }
            }
        }
    }

    /**
     * Deserialize the given string as an xml file in tmx format
     * into this tmx instance. If there are any existing translation
     * units already in this instance, they will be removed first.
     *
     * @param {String} xml the tmx format text to parse
     */
    deserialize(xml) {
        const json = xmljs.xml2js(xml, {
            trim: false,
            nativeTypeAttribute: true,
            compact: true
        });

        if (json.tmx) {
            if (!json.tmx._attributes ||
                    !json.tmx._attributes.version ||
                    json.tmx._attributes.version !== "1.4") {
                logger.error("Unknown tmx version " + json.tmx._attributes.version + ". Cannot continue parsing. Can only parse v1.4b files.");
                return;
            }
            this.tu = []; // clear any old units first
            this.parse(json.tmx);
        }

        return this.tu;
    }

    /**
     * Return the version of this tmx file. If you deserialize a string into this
     * instance of Tmx, the version will be reset to whatever is found inside of
     * the tmx file.
     *
     * @returns {String} the version of this tmx
     */
    getVersion() {
        return this.version || "1.4";
    }

    /**
     * Write out the tmx file to the path.
     * @param {String|undefined} targetDir if the path was given as relative, then
     * this is the directory that it is relative to. If it was given as absolute,
     * you can pass in undefined.
     */
    write(targetDir) {
        if (!this.path) return; // can't write without a path
        const fullpath = targetDir ? Path.join(targetDir, this.path) : this.path;
        const dir = Path.dirname(fullpath);
        makeDirs(dir);
        fs.writeFileSync(fullpath, this.serialize(), "utf-8");
    }
}

export default TMX;
