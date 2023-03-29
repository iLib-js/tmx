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

import * as path from 'path';
import * as fs from 'fs';
import TMX from '../src/tmx.js';
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

export const testTMXparse = {
    testTMXParse: function(test) {
        test.expect(4);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
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

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
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

    testTMXParseManyVariants: function(test) {
        test.expect(14);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>one two three</seg>
                  </tuv>
                  <tuv xml:lang="de-DE">
                    <seg>eins zwei drei</seg>
                  </tuv>
                  <tuv xml:lang="fr-FR">
                    <seg>un deu trois</seg>
                  </tuv>
                  <tuv xml:lang="es-ES">
                    <seg>uno dos tres</seg>
                  </tuv>
                </tu>
              </body>
            </tmx>`;

        tmx.deserialize(xml);
        const units = tmx.getTranslationUnits();
        test.ok(units);

        test.equal(units[0].source, "one two three");
        test.equal(units[0].sourceLocale, "en-US");

        const variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 4);

        test.equal(variants[0].string, "one two three");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.equal(variants[2].string, "un deu trois");
        test.equal(variants[2].locale, "fr-FR");

        test.equal(variants[3].string, "uno dos tres");
        test.equal(variants[3].locale, "es-ES");

        test.done();
    },

    testTMXParseHeaders: function(test) {
        test.expect(8);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="asdf" creationtool="mytool" creationtoolversion="1.2.3" adminlang="en-US" srclang="de-DE" datatype="golang"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <prop type="datatype">java</prop>
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
        const props = tmx.getProperties();

        test.equal(props.segtype, "asdf");
        test.equal(props.creationtool, "mytool");
        test.equal(props.creationtoolversion, "1.2.3");
        test.equal(props.adminlang, "en-US");
        test.equal(props.srclang, "de-DE");
        test.equal(props.datatype, "golang");

        test.equal(tmx.sourceLocale, "de-DE");

        test.done();
    },

    testTMXParseProperties: function(test) {
        test.expect(3);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <prop type="datatype">java</prop>
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

        test.deepEqual(units[0].getProperties(), {
            "x-project": "webapp",
            "datatype": "java"
        });
        test.done();
    },

    testTMXParseNotes: function(test) {
        test.expect(3);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <note>This is a comment</note>
                  <prop type="x-project">webapp</prop>
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

        test.deepEqual(units[0].comment, "This is a comment");
        test.done();
    },

    testTMXParseDifferentVersion: function(test) {
        test.expect(4);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.5">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
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

    testTMXParseMultipleUnits: function(test) {
        test.expect(18);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>Asdf asdf</seg>
                  </tuv>
                  <tuv xml:lang="de-DE">
                    <seg>eins zwei drei</seg>
                  </tuv>
                </tu>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>seven ate nine</seg>
                  </tuv>
                  <tuv xml:lang="de-DE">
                    <seg>sieben acht neun</seg>
                  </tuv>
                </tu>
              </body>
            </tmx>`;

        tmx.deserialize(xml);
        const units = tmx.getTranslationUnits();
        test.ok(units);

        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[0].sourceLocale, "en-US");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "eins zwei drei");
        test.equal(variants[1].locale, "de-DE");

        test.equal(units[1].source, "seven ate nine");
        test.equal(units[1].sourceLocale, "en-US");

        variants = units[1].getVariants();
        test.ok(variants);
        test.equal(variants.length, 2);

        test.equal(variants[0].string, "seven ate nine");
        test.equal(variants[0].locale, "en-US");

        test.equal(variants[1].string, "sieben acht neun");
        test.equal(variants[1].locale, "de-DE");

        test.done();
    },

    testTMXParseNoTranslations: function(test) {
        test.expect(8);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <tuv xml:lang="en-US">
                    <seg>Asdf asdf</seg>
                  </tuv>
                </tu>
              </body>
            </tmx>`;

        tmx.deserialize(xml);
        const units = tmx.getTranslationUnits();
        test.ok(units);

        test.equal(units[0].source, "Asdf asdf");
        test.equal(units[0].sourceLocale, "en-US");

        let variants = units[0].getVariants();
        test.ok(variants);
        test.equal(variants.length, 1);

        test.equal(variants[0].string, "Asdf asdf");
        test.equal(variants[0].locale, "en-US");

        test.done();
    },

    testTMXParseLangAttrs: function(test) {
        test.expect(10);

        const tmx = new TMX();
        test.ok(tmx);

        const xml = `
            <?xml version="1.0" encoding="utf-8"?>
            <tmx version="1.4">
              <header segtype="paragraph" creationtool="loctool" creationtoolversion="1.0.0" adminlang="en-US" datatype="javascript"/>
              <body>
                <tu srclang="en-US">
                  <prop type="x-project">webapp</prop>
                  <tuv lang="en-US">
                    <seg>Asdf asdf</seg>
                  </tuv>
                  <tuv lang="de-DE">
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


};
