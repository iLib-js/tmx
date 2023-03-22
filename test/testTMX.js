/*
 * testTMX.js - test the TMX object.
 *
 * Copyright © 2023 Box, Inc.
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

import path from 'path';
import fs from 'fs';
import TMX from '../src/tmx.js';
import {
    ResourceString,
    ResourceArray,
    ResourcePlural
} from 'ilib-tools-common';
import { Path } from 'ilib-common';

const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));

function diff(a, b) {
    const min = Math.min(a.length, b.length);

    for (let i = 0; i < min; i++) {
        if (a[i] !== b[i]) {
            console.log("Found difference at character " + i);
            console.log("a: " + a.substring(i));
            console.log("b: " + b.substring(i));
            break;
        }
    }
}

const loctoolVersion = JSON.parse(fs.readFileSync(Path.join(__dirname, "..", "package.json"), "utf-8")).version;

export const testTMX = {
    testTMXConstructor: function(test) {
        test.expect(1);

        const tmx = new TMX();
        test.ok(tmx);

        test.done();
    },

    testTMXConstructorIsEmpty: function(test) {
        test.expect(2);

        const tmx = new TMX();
        test.ok(tmx);

        test.equal(tmx.size(), 0);

        test.done();
    },

    testTMXConstructorFull: function(test) {
        test.expect(4);

        const tmx = new TMX({
            properties: {
                creationtool: "loctool",
                "tool-name": "Localization Tool",
                creationtoolversion: "1.2.34",
            },
        });
        test.ok(tmx);
        const props = tmx.getProperties();

        test.equal(props["creationtool"], "loctool");
        test.equal(props["creationtoolversion"], "1.2.34");
        test.equal(props["tool-name"], "Localization Tool");

        test.done();
    },

    testTMXGetPath: function(test) {
        test.expect(2);

        const tmx = new TMX();
        test.ok(tmx);

        tmx.setPath("test/testfiles/x.tmx");
        test.equal(tmx.getPath(), "test/testfiles/x.tmx");

        test.done();
    },

    testTMXSetPath: function(test) {
        test.expect(3);

        const tmx = new TMX();
        test.ok(tmx);

        tmx.setPath("test/testfiles/x.tmx");
        test.equal(tmx.getPath(), "test/testfiles/x.tmx");

        tmx.setPath("asdf/asdf/y.tmx");

        test.equal(tmx.getPath(), "asdf/asdf/y.tmx");

        test.done();
    },

    testTMXSetPathInitiallyEmpty: function(test) {
        test.expect(3);

        const tmx = new TMX();
        test.ok(tmx);

        test.ok(!tmx.getPath());

        tmx.setPath("asdf/asdf/y.tmx");

        test.equal(tmx.getPath(), "asdf/asdf/y.tmx");

        test.done();
    },

    testTMXAddResourceString: function(test) {
        test.expect(11);

        const tmx = new TMX();
        test.ok(tmx);

        const res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceStringWithTranslation: function(test) {
        test.expect(12);

        const tmx = new TMX();
        test.ok(tmx);

        const res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddMultipleResourceString: function(test) {
        test.expect(19);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "baby baby",
            sourceLocale: "en-US",
            key: "huzzah",
            pathName: "foo/bar/j.java",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.ok(!units[0].comment);
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.ok(!props["x-context"]);

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.ok(!units[1].comment);
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.ok(!props["x-context"]);

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "baby baby");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddMultipleResourceStringWithTranslations: function(test) {
        test.expect(23);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "baby baby",
            sourceLocale: "en-US",
            key: "huzzah",
            pathName: "foo/bar/j.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "vier fumpf sechs"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.ok(!units[0].comment);
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.ok(!props["x-context"]);

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.ok(!units[1].comment);
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.ok(!props["x-context"]);

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "baby baby");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "vier fumpf sechs");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddMultipleResourceStringSameSource: function(test) {
        test.expect(15);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "fr-FR",
            target: "un deu trois"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        test.ok(!units[0].comment);
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.ok(!props["x-context"]);

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        // should add a variant to the previous translation
        // unit instead of creating a new one
        test.equal(variants[2].string, "un deu trois");
        test.equal(variants[2].locale, "fr-FR");

        test.done();
    },

    testTMXAddMultipleResourceStringSameSourceDifferentTranslation: function(test) {
        test.expect(14);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei",
            context: "a"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "a/b/cfoo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "sieben acht neun",
            context: "b"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "a");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        // should become a new variant of the source, even
        // though we already have a german translation
        test.equal(variants[2].string, "sieben acht neun");
        test.equal(variants[2].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceStringNotSourceLocale: function(test) {
        test.expect(3);

        const tmx = new TMX({
            locale: "en-US"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "de-DE",
            key: "foobar",
            pathName: "foo/bar/j.java",
            project: "webapp",
            targetLocale: "en-US",
            target: "vier fumpf sechs"
        });

        tmx.addResource(res);

        // should reject it. Only units with the source
        // locale of en-US go in this tmx
        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 0);

        test.done();
    },

    testTMXAddMultipleResourceStringHandleDups: function(test) {
        test.expect(14);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        // should not duplicate the unit or the variants

        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.ok(!props["x-context"]);

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceArray: function(test) {
        test.expect(25);

        const tmx = new TMX();
        test.ok(tmx);

        const res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 3);

        test.equal(units[0].source, "a");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "a");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "b");
        test.equal(units[1].sourceLocale, "en-US");
        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "b");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[2].source, "c");
        test.equal(units[2].sourceLocale, "en-US");
        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "c");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceArrayWithTranslations: function(test) {
        test.expect(31);

        const tmx = new TMX();
        test.ok(tmx);

        const res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "x",
                "y",
                "z"
            ]
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 3);

        test.equal(units[0].source, "a");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "a");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "x");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "b");
        test.equal(units[1].sourceLocale, "en-US");
        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "b");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "y");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[2].source, "c");
        test.equal(units[2].sourceLocale, "en-US");
        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "c");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "z");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceArrayMultiple: function(test) {
        test.expect(31);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        res = new ResourceArray({
            sourceArray: [
                "m",
                "n",
                "o"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 6);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "a");
        test.equal(variants[0].locale, "en-US");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "b");
        test.equal(variants[0].locale, "en-US");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "c");
        test.equal(variants[0].locale, "en-US");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "m");
        test.equal(variants[0].locale, "en-US");

        variants = units[4].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "n");
        test.equal(variants[0].locale, "en-US");

        variants = units[5].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "o");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceArrayMultipleWithTranslations: function(test) {
        test.expect(43);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "x",
                "y",
                "z"
            ]
        });

        tmx.addResource(res);

        res = new ResourceArray({
            sourceArray: [
                "m",
                "n",
                "o"
            ],
            sourceLocale: "en-US",
            key: "asdf",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "p",
                "q",
                "r"
            ]
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 6);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "a");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "x");
        test.equal(variants[1].locale, "de-DE");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "b");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "y");
        test.equal(variants[1].locale, "de-DE");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "c");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "z");
        test.equal(variants[1].locale, "de-DE");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "m");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "p");
        test.equal(variants[1].locale, "de-DE");

        variants = units[4].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "n");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "q");
        test.equal(variants[1].locale, "de-DE");

        variants = units[5].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "o");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "r");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceArrayMultipleWithTranslationsAndOverlappingSources: function(test) {
        test.expect(43);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "x",
                "y",
                "z"
            ]
        });

        tmx.addResource(res);

        res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "o"
            ],
            sourceLocale: "en-US",
            key: "asdf",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "p",
                "q",
                "r"
            ]
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        test.equal(units[0].source, "a");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "a");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "x");
        test.equal(variants[1].locale, "de-DE");

        test.equal(variants[2].string, "p");
        test.equal(variants[2].locale, "de-DE");

        test.equal(units[1].source, "b");
        test.equal(units[1].sourceLocale, "en-US");
        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "b");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "y");
        test.equal(variants[1].locale, "de-DE");

        test.equal(variants[2].string, "q");
        test.equal(variants[2].locale, "de-DE");

        test.equal(units[2].source, "c");
        test.equal(units[2].sourceLocale, "en-US");
        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "c");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "z");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[3].source, "o");
        test.equal(units[3].sourceLocale, "en-US");
        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "o");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "r");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourcePlural: function(test) {
        test.expect(19);

        const tmx = new TMX();
        test.ok(tmx);

        const res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other string"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "one string");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "one string");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].sourceLocale, "en-US");
        test.equal(units[1].source, "other string");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "other string");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourcePluralWithTranslations: function(test) {
        test.expect(23);

        const tmx = new TMX();
        test.ok(tmx);

        const res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other string"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "ein Zeichenfolge",
                other: "mehrere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "one string");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "one string");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "ein Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "other string");
        test.equal(units[1].sourceLocale, "en-US");
        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "other string");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "mehrere Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourcePluralMultiple: function(test) {
        test.expect(31);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        res = new ResourcePlural({
            sourceStrings: {
                one: "a string",
                other: "some strings"
            },
            sourceLocale: "en-US",
            key: "asdf",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        test.equal(units[0].source, "one string");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "one string");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "other strings");
        test.equal(units[1].sourceLocale, "en-US");
        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "other strings");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[2].source, "a string");
        test.equal(units[2].sourceLocale, "en-US");
        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "a string");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[3].source, "some strings");
        test.equal(units[3].sourceLocale, "en-US");
        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "some strings");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourcePluralMultipleWithMoreTranslations: function(test) {
        test.expect(33);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "ein Zeichenfolge",
                other: "mehrere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        res = new ResourcePlural({
            sourceStrings: {
                one: "a string",
                other: "many strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "ru-RU",
            targetStrings: {
                one: "одна струна",
                few: "несколько струны",
                other: "много струн"
            }
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "one string");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "ein Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "other strings");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "mehrere Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "a string");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "одна струна");
        test.equal(variants[1].locale, "ru-RU");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "many strings");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "много струн");
        test.equal(variants[1].locale, "ru-RU");

        test.equal(variants[2].string, "несколько струны");
        test.equal(variants[2].locale, "ru-RU");

        test.done();
    },

    testTMXAddResourcePluralMultipleWithLessTranslations: function(test) {
        test.expect(21);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "ein Zeichenfolge",
                other: "mehrere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "ja-JP",
            targetStrings: {
                other: "1つの弦"
            }
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "one string");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "ein Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "other strings");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "mehrere Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        test.equal(variants[2].string, "1つの弦");
        test.equal(variants[2].locale, "ja-JP");

        test.done();
    },

    testTMXAddResourcePluralMultipleWithTranslationsAndOverlappingSources: function(test) {
        test.expect(27);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "eine Zeichenfolge",
                other: "mehrere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "some other strings"
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "1 Zeichenfolge",
                other: "mehrere andere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 3);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        // the "one" string shares some translations and the "other" string doesn't
        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "one string");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eine Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        test.equal(variants[2].string, "1 Zeichenfolge");
        test.equal(variants[2].locale, "de-DE");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "other strings");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "mehrere Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "some other strings");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "mehrere andere Zeichenfolge");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXDeserializeSimple: function(test) {
        test.expect(1);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 1);

        test.done();
    },

    testTMXDeserializeSimpleRightTransUnits: function(test) {
        test.expect(6);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="javascript"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 1);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);

        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[0].sourceLocale, "en-US");

        test.done();
    },

    testTMXDeserializeSimpleRightVariants: function(test) {
        test.expect(11);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="javascript"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 1);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);

        const variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXDeserializeSimpleHeaderProperties: function(test) {
        test.expect(8);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="javascript"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 1);
        test.equal(tmx.getSegmentationType(), "paragraph");

        const tmxprops = tmx.getProperties();
        test.ok(tmxprops);
        test.equal(tmxprops["creationtool"], "loctool");
        test.equal(tmxprops["creationtoolversion"], "2.20.2");
        test.equal(tmxprops["adminlang"], "en-US");
        test.equal(tmxprops["srclang"], "en-US");
        test.equal(tmxprops["datatype"], "javascript");

        test.done();
    },

    testTMXDeserializeSimpleTransUnitProperties: function(test) {
        test.expect(6);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="javascript"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 1);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);

        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");

        test.done();
    },

    testTMXDeserializeStringMultipleWithTranslations: function(test) {
        test.expect(1);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>one string</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eine Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>other strings</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>mehrere Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>a</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>x</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>b</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>y</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>c</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>z</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 6);

        test.done();
    },

    testTMXDeserializeStringMultipleWithTranslationsRightContents: function(test) {
        test.expect(6);

        const tmx = new TMX();

        const contents = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="2.20.2" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>one string</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eine Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>other strings</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>mehrere Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>a</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>x</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>b</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>y</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>c</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>z</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        tmx.deserialize(contents);

        test.ok(tmx.size(), 6);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 6);

        let actual = units.map(tu => [tu.source, tu.sourceLocale]);
        let expected = [
            ["Asdf asdf", "en-US"],
            ["one string", "en-US"],
            ["other strings", "en-US"],
            ["a", "en-US"],
            ["b", "en-US"],
            ["c", "en-US"]
        ];
        test.equalIgnoringOrder(actual, expected);

        actual = units.map(tu => {
            const variants = tu.getVariants();
            return variants.map(variant => [variant.string, variant.locale]);
        });
        expected = [
            [["Asdf asdf", "en-US"], ["eins zwei drei", "de-DE"]],
            [["one string", "en-US"], ["eine Zeichenfolge", "de-DE"]],
            [["other strings", "en-US"], ["mehrere Zeichenfolge", "de-DE"]],
            [["a", "en-US"], ["x", "de-DE"]],
            [["b", "en-US"], ["y", "de-DE"]],
            [["c", "en-US"], ["z", "de-DE"]]
        ];
        test.equalIgnoringOrder(actual, expected);

        test.done();
    },

    testTMXSerializeStringMultipleWithTranslations: function(test) {
        test.expect(2);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            target: "foobar auf deutsch",
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            target: "foobar en francais",
            targetLocale: "fr-FR"
        });

        tmx.addResource(res);

        const actual = tmx.serialize();
        const expected = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>foobar auf deutsch</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="fr-FR">\n' +
            '        <seg>foobar en francais</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        diff(actual, expected);
        test.equal(actual, expected);
        test.done();
    },

    testTMXSerializeString: function(test) {
        test.expect(2);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "baby baby",
            sourceLocale: "en-US",
            key: "huzzah",
            pathName: "foo/bar/j.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "vier fumpf sechs"
        });

        tmx.addResource(res);

        const actual = tmx.serialize();
        const expected = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>baby baby</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>vier fumpf sechs</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        diff(actual, expected);
        test.equal(actual, expected);

        test.done();
    },

    testTMXSerializeComplex: function(test) {
        test.expect(2);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "blah blah",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "eine Zeichenfolge",
                other: "mehrere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        res = new ResourceArray({
            sourceArray: [
                "a",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "x",
                "y",
                "z"
            ]
        });

        tmx.addResource(res);

        const actual = tmx.serialize();
        const expected = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>one string</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eine Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>other strings</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>mehrere Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>a</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>x</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>b</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>y</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>c</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>z</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        diff(actual, expected);
        test.equal(actual, expected);

        test.done();
    },

    testTMXAddResourceSegmentSentenceSource: function(test) {
        test.expect(23);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "This is a test. This is only a test.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceSegmentSentenceSourceTricky: function(test) {
        test.expect(23);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "I would like to see Dr. Smith in the U.S. not someone else. Please arrange that.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "I would like to see Dr. Smith in the U.S. not someone else.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "I would like to see Dr. Smith in the U.S. not someone else.");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "Please arrange that.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "Please arrange that.");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceSegmentSentenceSourceOnlyOneSentence: function(test) {
        test.expect(13);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "This is a test.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTarget: function(test) {
        test.expect(27);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "This is a test. This is only a test.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            target: "Dies ist eine Untersuchung. Dies ist nur eine Untersuchung.",
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist nur eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetJapanese: function(test) {
        test.expect(27);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "This is a test. This is only a test.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            target: "これはテストです。これは単なるテストです。",
            targetLocale: "ja-JP"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "これはテストです。");
        test.equal(variants[1].locale, "ja-JP");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "これは単なるテストです。");
        test.equal(variants[1].locale, "ja-JP");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetOnlyOneSentence: function(test) {
        test.expect(15);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "This is a test.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            target: "Dies ist eine Untersuchung.",
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 1);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        const props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceSegmentSentenceArray: function(test) {
        test.expect(23);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceArray({
            sourceArray: [
                "This is a test. This is only a test."
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetArray: function(test) {
        test.expect(27);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceArray({
            sourceArray: [
                "This is a test. This is only a test."
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetArray: [
                "Dies ist eine Untersuchung. Dies ist nur eine Untersuchung."
            ],
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist nur eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetArrayMultiple: function(test) {
        test.expect(51);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceArray({
            sourceArray: [
                "This is a test. This is only a test.",
                "Yet another test. Another test."
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetArray: [
                "Dies ist eine Untersuchung. Dies ist nur eine Untersuchung.",
                "Jemals noch eine Untersuchung. Noch eine Untersuchung."
            ],
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist nur eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[2].source, "Yet another test.");
        test.equal(units[2].sourceLocale, "en-US");
        props = units[2].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Yet another test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Jemals noch eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[3].source, "Another test.");
        test.equal(units[3].sourceLocale, "en-US");
        props = units[3].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Another test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Noch eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceSegmentSentencePlural: function(test) {
        test.expect(23);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourcePlural({
            sourcePlurals: {
                other: "This is a test. This is only a test."
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetPlural: function(test) {
        test.expect(27);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourcePlural({
            sourcePlurals: {
                "other": "This is a test. This is only a test."
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetPlurals: {
                "other": "Dies ist eine Untersuchung. Dies ist nur eine Untersuchung."
            },
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist nur eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetPluralMultiple: function(test) {
        test.expect(51);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourcePlural({
            sourcePlurals: {
                one: "This is a test. This is only a test.",
                other: "Yet another test. Another test."
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetPlurals: {
                one: "Dies ist eine Untersuchung. Dies ist nur eine Untersuchung.",
                other: "Jemals noch eine Untersuchung. Noch eine Untersuchung."
            },
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Dies ist nur eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[2].source, "Yet another test.");
        test.equal(units[2].sourceLocale, "en-US");
        props = units[2].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Yet another test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Jemals noch eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[3].source, "Another test.");
        test.equal(units[3].sourceLocale, "en-US");
        props = units[3].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Another test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Noch eine Untersuchung.");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetPluralLessCategories: function(test) {
        test.expect(47);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourcePlural({
            sourcePlurals: {
                one: "This is a test. This is only a test.",
                other: "Yet another test. Another test."
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetPlurals: {
                other: "さらに別のテスト。別のテスト。"
            },
            targetLocale: "ja-JP"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(units[2].source, "Yet another test.");
        test.equal(units[2].sourceLocale, "en-US");
        props = units[2].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Yet another test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "さらに別のテスト。");
        test.equal(variants[1].locale, "ja-JP");

        test.equal(units[3].source, "Another test.");
        test.equal(units[3].sourceLocale, "en-US");
        props = units[3].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Another test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "別のテスト。");
        test.equal(variants[1].locale, "ja-JP");

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetPluralMoreCategories: function(test) {
        test.expect(55);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourcePlural({
            sourcePlurals: {
                one: "This is a test. This is only a test.",
                other: "These are some tests. These are only some tests."
            },
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetPlurals: {
                one: "Это тест. Это всего лишь тест.",
                few: "Это некоторые теста. Это только некоторые теста.",
                other: "Это некоторые тестов. Это только некоторые тестов."
            },
            targetLocale: "ru-RU"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 4);

        test.equal(units[0].source, "This is a test.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Это тест.");
        test.equal(variants[1].locale, "ru-RU");

        test.equal(units[1].source, "This is only a test.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "This is only a test.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Это всего лишь тест.");
        test.equal(variants[1].locale, "ru-RU");

        test.equal(units[2].source, "These are some tests.");
        test.equal(units[2].sourceLocale, "en-US");
        props = units[2].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[2].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "These are some tests.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Это некоторые тестов.");
        test.equal(variants[1].locale, "ru-RU");

        test.equal(variants[2].string, "Это некоторые теста.");
        test.equal(variants[2].locale, "ru-RU");

        test.equal(units[3].source, "These are only some tests.");
        test.equal(units[3].sourceLocale, "en-US");
        props = units[3].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[3].getVariants();
        test.ok(variants);
        test.equal(variants.length, 3);

        test.equal(variants[0].string, "These are only some tests.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Это только некоторые тестов.");
        test.equal(variants[1].locale, "ru-RU");

        test.equal(variants[2].string, "Это только некоторые теста.");
        test.equal(variants[2].locale, "ru-RU");

        test.done();
    },

    testTMXWrite: function(test) {
        test.expect(4);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf. Foobar foo.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "Eins zwei drei. Vier fumpf sechs."
        });

        tmx.addResource(res);

        res = new ResourcePlural({
            sourceStrings: {
                one: "one string",
                other: "other strings"
            },
            sourceLocale: "en-US",
            key: "blah blah",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetStrings: {
                one: "eine Zeichenfolge",
                other: "mehrere Zeichenfolge"
            }
        });

        tmx.addResource(res);

        res = new ResourceArray({
            sourceArray: [
                "A b cee. E f g.",
                "b",
                "c"
            ],
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            targetLocale: "de-DE",
            targetArray: [
                "X y zee. M n o.",
                "y",
                "z"
            ]
        });

        tmx.addResource(res);

        const base = __dirname;

        if (fs.existsSync(path.join(base, "testfiles/test/output.tmx"))) {
            fs.unlinkSync(path.join(base, "testfiles/test/output.tmx"));
        }

        test.ok(!fs.existsSync(path.join(base, "testfiles/test/output.tmx")));

        tmx.setPath("./test/output.tmx");
        tmx.write(path.join(base, "testfiles"));

        test.ok(fs.existsSync(path.join(base, "testfiles/test/output.tmx")));

        const actual = fs.readFileSync(path.join(base, "testfiles/test/output.tmx"), "utf-8");
        const expected =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="sentence" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf.</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>Eins zwei drei.</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Foobar foo.</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>Vier fumpf sechs.</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>one string</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eine Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>other strings</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>mehrere Zeichenfolge</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>A b cee.</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>X y zee.</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>E f g.</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>M n o.</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>b</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>y</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-context">asdf</prop>\n' +
            '      <prop type="x-flavor">chocolate</prop>\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>c</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>z</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        diff(actual, expected);
        test.equal(actual, expected);

        test.done();
    },

    testTMXAddResourceSegmentSentenceTargetSpecial: function(test) {
        test.expect(27);

        const tmx = new TMX({
            segmentation: "sentence"
        });
        test.ok(tmx);

        const res = new ResourceString({
            source: "The SignRequest subdomain cannot be changed. If you need a different domain you can create a new team.",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            autoKey: false,
            state: "new",
            context: "asdf",
            flavor: "chocolate",
            comment: "this is a comment",
            project: "webapp",
            target: "SignRequest domänen kan inte ändras. Om du behöver en annan domän kan du skapa en nya arbetsgrupp.",
            targetLocale: "sv"
        });

        tmx.addResource(res);

        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.equal(units.length, 2);

        test.equal(units[0].source, "The SignRequest subdomain cannot be changed.");
        test.equal(units[0].sourceLocale, "en-US");
        let props = units[0].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "The SignRequest subdomain cannot be changed.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "SignRequest domänen kan inte ändras.");
        test.equal(variants[1].locale, "sv");

        test.equal(units[1].source, "If you need a different domain you can create a new team.");
        test.equal(units[1].sourceLocale, "en-US");
        props = units[1].getProperties();
        test.ok(props);
        test.equal(props["x-project"], "webapp");
        test.equal(props["x-context"], "asdf");
        test.equal(props["x-flavor"], "chocolate");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "If you need a different domain you can create a new team.");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "Om du behöver en annan domän kan du skapa en nya arbetsgrupp.");
        test.equal(variants[1].locale, "sv");

        test.done();
    },

    testTMXSerializeStringDontSerializeUnitsWithNoTranslations: function(test) {
        test.expect(2);

        const tmx = new TMX();
        test.ok(tmx);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx.addResource(res);

        res = new ResourceString({
            source: "baby baby",
            sourceLocale: "en-US",
            key: "huzzah",
            pathName: "foo/bar/j.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "vier fumpf sechs"
        });

        tmx.addResource(res);

        // source-only resource should not appear in the serialized output
        res = new ResourceString({
            source: "oh yeah!",
            sourceLocale: "en-US",
            key: "huzzah",
            pathName: "foo/bar/j.java",
            project: "webapp",
            targetLocale: "de-DE"
        });

        tmx.addResource(res);

        const actual = tmx.serialize();
        const expected = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<tmx version="1.4">\n' +
            '  <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" srclang="en-US" datatype="unknown"/>\n' +
            '  <body>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>Asdf asdf</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>eins zwei drei</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '    <tu srclang="en-US">\n' +
            '      <prop type="x-project">webapp</prop>\n' +
            '      <tuv xml:lang="en-US">\n' +
            '        <seg>baby baby</seg>\n' +
            '      </tuv>\n' +
            '      <tuv xml:lang="de-DE">\n' +
            '        <seg>vier fumpf sechs</seg>\n' +
            '      </tuv>\n' +
            '    </tu>\n' +
            '  </body>\n' +
            '</tmx>';

        diff(actual, expected);
        test.equal(actual, expected);

        test.done();
    }
};
