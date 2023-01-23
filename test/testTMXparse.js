/*
 * testTMXparse.js - test the parsing capabilities of the TMX object.
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
import TMX from '../src/tmx.js';
import { Path } from 'ilib-common';

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

export const testTMXparse = {
    testTMXParse: function(test) {
        test.expect(4);

        var tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" datatype="unknown"/>
              <body>
                <tu srclang="en-US">
                  <prop name="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>Asdf asdf</seg>
                  </tuv>
                  <tuv xml:lang="de-DE">
                    <seg>eins zwei drei</seg>
                  </tuv>
                </tu>
              </body>
            </tmx>`;

        tmx.deserialize(xml);
        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 1);

        test.done();
    },

    testTMXParseRightUnits: function(test) {
        test.expect(10);

        var tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" datatype="unknown"/>
              <body>
                <tu srclang="en-US">
                  <prop name="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>Asdf asdf</seg>
                  </tuv>
                  <tuv xml:lang="de-DE">
                    <seg>eins zwei drei</seg>
                  </tuv>
                </tu>
              </body>
            </tmx>`;

        tmx.deserialize(xml);
        const units = tmx.getTranslationUnits();
        test.ok(units);

        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[0].sourceLocale, "en-US");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXParseDifferentVersion: function(test) {
        test.expect(4);

        var tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.5">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="' + loctoolVersion + '" adminlang="en-US" datatype="unknown"/>
              <body>
                <tu srclang="en-US">
                  <prop name="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>Asdf asdf</seg>
                  </tuv>
                  <tuv xml:lang="de-DE">
                    <seg>eins zwei drei</seg>
                  </tuv>
                </tu>
              </body>
            </tmx>`;

        // cannot parse tmx > v1.4 files
        tmx.deserialize(xml);
        const units = tmx.getTranslationUnits();
        test.ok(units);
        test.ok(Array.isArray(units));
        test.equal(units.length, 0);

        test.done();
    },

};
