/*
 * testTMXdiff.js - test the TMX diff method.
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

export const testTMXdiff = {
    testTMXDiffEmpty: function(test) {
        test.expect(4);

        const tmx1 = new TMX();
        test.ok(tmx1);
        const tmx2 = new TMX();
        test.ok(tmx2);

        const d = tmx1.diff(tmx2);

        test.ok(d);
        test.equal(d.size(), 0);

        test.done();
    },

    testTMXDiffNoDiff: function(test) {
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

        // they have the same strings in them, so there should be no diff
        const d = tmx1.diff(tmx2);

        test.ok(d);
        test.equal(d.size(), 0);

        test.done();
    },

    testTMXDiffAdditionalStringInTarget: function(test) {
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

        const d = tmx1.diff(tmx2);
        test.ok(d);
        test.equal(d.size(), 1);

        test.done();
    },

    testTMXDiffAdditionalStringRightContentsInTarget: function(test) {
        test.expect(14);

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

        const d = tmx1.diff(tmx2);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);
        test.equal(units[0].sourceLocale, "en-US");
        test.equal(units[0].source, "foobar foo");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.ok(Array.isArray(variants));
        test.equal(variants.length, 2);
        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "foobar foo");
        test.equal(variants[1].locale, "de-DE");
        test.equal(variants[1].string, "das foobar");

        test.done();
    },

    testTMXDiffAdditionalVariantInTarget: function(test) {
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

        const d = tmx1.diff(tmx2);
        test.ok(d);
        test.equal(d.size(), 1);

        test.done();
    },

    testTMXDiffAdditionalVariantRightContentsInTarget: function(test) {
        test.expect(14);

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

        const d = tmx1.diff(tmx2);

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
        test.equal(variants.length, 2);

        test.equal(variants[0].locale, "en-US");
        test.equal(variants[0].string, "Asdf asdf");

        test.equal(variants[1].locale, "fr-FR");
        test.equal(variants[1].string, "un deux trois");

        test.done();
    },

    testTMXDiffAdditionalStringInSource: function(test) {
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

        // we don't care about deletions from the current to the new tmx,
        // only additions and changes
        const d = tmx1.diff(tmx2);
        test.ok(d);
        test.equal(d.size(), 0);

        test.done();
    },

    testTMXDiffAdditionalStringRightContentsInSource: function(test) {
        test.expect(5);

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

        const d = tmx1.diff(tmx2);

        // we don't care about deletions from the current to the new tmx,
        // only additions and changes
        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 0);

        test.done();
    },

    testTMXDiffAdditionalVariantInSource: function(test) {
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

        // we don't care about deletions from the current to the new tmx,
        // only additions and changes
        const d = tmx1.diff(tmx2);
        test.ok(d);
        test.equal(d.size(), 0);

        test.done();
    },

    testTMXDiffAdditionalVariantRightContentsInSource: function(test) {
        test.expect(5);

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

        const d = tmx1.diff(tmx2);

        const units = d.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 0);

        test.done();
    },
};
