/*
 * testTMXmerge.js - test the TMX merge method.
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

import path from 'node:path';
import fs from 'node:fs';
import {
    ResourceString,
    ResourceArray,
    ResourcePlural
} from 'ilib-tools-common';
import { Path } from 'ilib-common';

import TMX from '../src/tmx.js';

const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));

function diff(a, b) {
    var min = Math.min(a.length, b.length);

    for (var i = 0; i < min; i++) {
        if (a[i] !== b[i]) {
            console.log("Found difference at character " + i);
            console.log("a: " + a.substring(i));
            console.log("b: " + b.substring(i));
            break;
        }
    }
}

const loctoolVersion = JSON.parse(fs.readFileSync(Path.join(__dirname, "..", "package.json"), "utf-8")).version;

export const testTMXmerge = {
    testTMXMergeEmpty: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        const d = tmx1.merge([tmx2]);

        test.ok(d);
        test.equal(d.size(), 0);

        test.done();
    },

    testTMXMergeNothing: function(test) {
        test.expect(3);

        const tmx1 = new TMX();
        test.ok(tmx1);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);

        const d = tmx1.merge();

        test.ok(d);
        test.equal(d.size(), 1);

        test.done();
    },

    testTMXMergeNoDiff: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        // they have the same strings in them, so there should be only one unit in the output
        const d = tmx1.merge([tmx2]);

        test.ok(d);
        test.equal(d.size(), 1);

        test.done();
    },

    testTMXMergeAdditionalStringInTarget: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx2.addResource(res);

        const d = tmx1.merge([tmx2]);
        test.ok(d);
        test.equal(d.size(), 2);

        test.done();
    },

    testTMXMergeAdditionalStringRightContentsInTarget: function(test) {
        test.expect(23);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx2.addResource(res);

        const d = tmx1.merge([tmx2]);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 2);
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[1].sourceLocale, "en-US");
        test.equal(units[1].source, "foobar foo");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "eins zwei drei");

        variants = units[1].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "foobar foo");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "das foobar");

        test.done();
    },

    testTMXMergeAdditionalVariantInTarget: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "fr-FR",
            target: "un deux trois"
        });
        tmx2.addResource(res);

        const d = tmx1.merge([tmx2]);
        test.ok(d);
        test.equal(d.size(), 1);

        test.done();
    },

    testTMXMergeAdditionalVariantRightContentsInTarget: function(test) {
        test.expect(16);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "fr-FR",
            target: "un deux trois"
        });
        tmx2.addResource(res);

        const d = tmx1.merge([tmx2]);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);

        // source is the same, but the variants differ
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "Asdf asdf");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 3);

        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");

        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "eins zwei drei");

        test.equal(variants[2].locale, "fr-FR");
        test.equal(variants[2].string, "un deux trois");

        test.done();
    },

    testTMXMergeAdditionalStringInSource: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx1.addResource(res);

        const d = tmx1.merge([tmx2]);
        test.ok(d);
        test.equal(d.size(), 2);

        test.done();
    },

    testTMXMergeAdditionalStringRightContentsInSource: function(test) {
        test.expect(23);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx1.addResource(res);

        const d = tmx1.merge([tmx2]);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 2);
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[1].sourceLocale, "en-US");
        test.equal(units[1].source, "foobar foo");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "eins zwei drei");

        variants = units[1].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "foobar foo");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "das foobar");

        test.done();
    },

    testTMXMergeAdditionalVariantInSource: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "fr-FR",
            target: "un deux trois"
        });
        tmx1.addResource(res);

        const d = tmx1.merge([tmx2]);
        test.ok(d);
        test.equal(d.size(), 1);

        test.done();
    },

    testTMXMergeAdditionalVariantRightContentsInSource: function(test) {
        test.expect(16);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "fr-FR",
            target: "un deux trois"
        });
        tmx1.addResource(res);

        const d = tmx1.merge([tmx2]);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);

        // source is the same, but the variants differ
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "Asdf asdf");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 3);

        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");

        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "eins zwei drei");

        test.equal(variants[2].locale, "fr-FR");
        test.equal(variants[2].string, "un deux trois");

        test.done();
    },

    testTMXMergeAdditionalStringInMultipleTargets: function(test) {
        test.expect(5);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);
        const tmx3 = new TMX();
        test.ok(tmx3);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx2.addResource(res);

        res = new ResourceString({
            source: "seven eight nine",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "sieben acht neun"
        });
        tmx3.addResource(res);

        const d = tmx1.merge([tmx2, tmx3]);
        test.ok(d);
        test.equal(d.size(), 3);

        test.done();
    },

    testTMXMergeAdditionalStringRightContentsInMultipleTargets: function(test) {
        test.expect(32);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);
        const tmx3 = new TMX();
        test.ok(tmx3);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx2.addResource(res);

        res = new ResourceString({
            source: "seven eight nine",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "sieben acht neun"
        });
        tmx3.addResource(res);

        const d = tmx1.merge([tmx2, tmx3]);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 3);
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[1].sourceLocale, "en-US");
        test.equal(units[1].source, "foobar foo");
        test.equal(units[2].sourceLocale, "en-US");
        test.equal(units[2].source, "seven eight nine");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "eins zwei drei");

        variants = units[1].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "foobar foo");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "das foobar");

        variants = units[2].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "seven eight nine");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "sieben acht neun");

        test.done();
    },

    testTMXMergeAdditionalStringInMultipleTargetsMergeVariants: function(test) {
        test.expect(5);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);
        const tmx3 = new TMX();
        test.ok(tmx3);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "andere Zeichenfolge"
        });
        tmx3.addResource(res);

        const d = tmx1.merge([tmx2, tmx3]);
        test.ok(d);
        test.equal(d.size(), 2);

        test.done();
    },

    testTMXMergeAdditionalStringRightContentsInMultipleTargets: function(test) {
        test.expect(28);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);
        const tmx3 = new TMX();
        test.ok(tmx3);

        let res = new ResourceString({
            source: "Asdf asdf",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "eins zwei drei"
        });

        tmx1.addResource(res);
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "das foobar"
        });
        tmx2.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "de-DE",
            target: "andere Zeichenfolge"
        });
        tmx3.addResource(res);

        res = new ResourceString({
            source: "foobar foo",
            sourceLocale: "en-US",
            key: "foobar",
            pathName: "foo/bar/asdf.java",
            project: "webapp",
            targetLocale: "fr-FR",
            target: "un foobar"
        });
        tmx3.addResource(res);

        const d = tmx1.merge([tmx2, tmx3]);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 2);
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[1].sourceLocale, "en-US");
        test.equal(units[1].source, "foobar foo");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "eins zwei drei");

        variants = units[1].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 4);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "foobar foo");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "das foobar");
        test.equal(variants[2].locale, "de-DE");
        test.equal(variants[2].string, "andere Zeichenfolge");
        test.equal(variants[3].locale, "fr-FR");
        test.equal(variants[3].string, "un foobar");

        test.done();
    },
};
