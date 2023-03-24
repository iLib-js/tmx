# ilib-tmx

A parser and generator for tmx files (Translation Memory eXchange)

## API Documentation

Full API documentation can be found [here](./docs/ilibTmx.md).

## License

Copyright © 2023, JEDLSoft

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.

## Release Notes

### v1.1.0

- added new method diff() to return a new TMX instance that contains
  the differences between the other TMX and the current one
- bug fix: was not parsing the header or the translation unit properties
  properly during deserialization

### v1.0.0

- initial version copied from loctool 2.18.0
- converted to ESM
