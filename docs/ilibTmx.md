<a name="TMX"></a>

## TMX
A class that represents an tmx 1.4b file.
See https://www.gala-global.org/tmx-14b for details on the file format.

**Kind**: global class  

* [TMX](#TMX)
    * [new TMX(options)](#new_TMX_new)
    * [.getPath()](#TMX+getPath) ⇒ <code>String</code> \| <code>undefined</code>
    * [.setPath(pathName)](#TMX+setPath)
    * [.getProperties()](#TMX+getProperties) ⇒ <code>Object</code>
    * [.addProperty(property, value)](#TMX+addProperty)
    * [.setProperties(properties)](#TMX+setProperties)
    * [.getTranslationUnits()](#TMX+getTranslationUnits) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.addTranslationUnit(unit)](#TMX+addTranslationUnit)
    * [.addTranslationUnits(files)](#TMX+addTranslationUnits)
    * [.segmentString(string, locale)](#TMX+segmentString) ⇒ <code>Array.&lt;String&gt;</code>
    * [.addResource(res)](#TMX+addResource)
    * [.size()](#TMX+size) ⇒ <code>number</code>
    * [.serialize()](#TMX+serialize) ⇒ <code>String</code>
    * [.parse(the)](#TMX+parse)
    * [.deserialize(xml)](#TMX+deserialize)
    * [.getVersion()](#TMX+getVersion) ⇒ <code>String</code>
    * [.write(targetDir)](#TMX+write)


* * *

<a name="new_TMX_new"></a>

### new TMX(options)
Construct a new TMX file.
The options may be undefined, which represents a new,
clean Tmx instance. The options object may also
be an object with the following properties:

<ul>
<li><i>path</i> - the path to the tmx file on disk
<li><i>sourceLocale</i> - specify the default source locale if a resource doesn't have a locale itself.
Default is "en-US".
<li><i>version</i> - The version of tmx that will be produced by this instance. Default is "1.4".
<li><i>properties</i> - an object containing general string properties that will appear in the header
  of the tmx file. Typical properties are:
  <ul>
    <li><i>creationtool</i> - the full name of the tool that created this tmx file. Default: "loctool"
    <li><i>creationtoolversion</i> - the version of the tool that created this tmx file. Default: the version
        of this loctool
    <li><i>originalFormat</i> - the format of the data before it was transformed into tmx. That can be any
        string.
  </ul>
<li><i>segmentation</i> - How the strings should be segmented. Choices are "paragraph" and "sentence."
Default is "paragraph". The tmx settings of "block" and "phrase" are not yet supported.
</ul>


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Array.&lt;Object&gt;</code> \| <code>undefined</code> | options to initialize the file, or undefined for a new empty file |


* * *

<a name="TMX+getPath"></a>

### tmX.getPath() ⇒ <code>String</code> \| <code>undefined</code>
Get the path to this tmx file.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>String</code> \| <code>undefined</code> - the path to this tmx file  

* * *

<a name="TMX+setPath"></a>

### tmX.setPath(pathName)
Set the path to this tmx file.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| pathName | <code>String</code> | the path to the tmx file |


* * *

<a name="TMX+getProperties"></a>

### tmX.getProperties() ⇒ <code>Object</code>
Get the string properties of this tmx file from the
header.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>Object</code> - the string properties of this tmx file  

* * *

<a name="TMX+addProperty"></a>

### tmX.addProperty(property, value)
Set a string property of this tmx file.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| property | <code>String</code> | the name of the property to set |
| value | <code>String</code> | the value of the property to set |


* * *

<a name="TMX+setProperties"></a>

### tmX.setProperties(properties)
Set the string properties of this tmx file.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> | the properties to set |


* * *

<a name="TMX+getTranslationUnits"></a>

### tmX.getTranslationUnits() ⇒ <code>Array.&lt;Object&gt;</code>
Get the translation units in this tmx.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>Array.&lt;Object&gt;</code> - the translation units in this tmx  

* * *

<a name="TMX+addTranslationUnit"></a>

### tmX.addTranslationUnit(unit)
Add this translation unit to this tmx.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| unit | <code>TranslationUnit</code> | the translation unit to add to this tmx |


* * *

<a name="TMX+addTranslationUnits"></a>

### tmX.addTranslationUnits(files)
Add translation units to this tmx.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;Object&gt;</code> | the translation units to add to this tmx |


* * *

<a name="TMX+segmentString"></a>

### tmX.segmentString(string, locale) ⇒ <code>Array.&lt;String&gt;</code>
Segment a string according to the rules for the locale, and the style
set for this tmx object, either "paragraph" or "sentence", and return
an array of segments.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>Array.&lt;String&gt;</code> - an array containing one or more strings that
are the segments of the current string  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>String</code> | the string to segment |
| locale | <code>String</code> | the locale |


* * *

<a name="TMX+addResource"></a>

### tmX.addResource(res)
Add a resource to this tmx file. If a resource
with the same file, locale, context, and key already
exists in this tmx file, what happens to it is
determined by the allowDups option. If this is false,
the existing resource will be replaced, and if it
is true, this new resource will be added as an
instance of the existing resource.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>Resource</code> | a resource to add |


* * *

<a name="TMX+size"></a>

### tmX.size() ⇒ <code>number</code>
Return the number of translation units in this tmx
file.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>number</code> - the number of translation units in this tmx file  

* * *

<a name="TMX+serialize"></a>

### tmX.serialize() ⇒ <code>String</code>
Serialize this tmx instance to a string that contains
the tmx format xml text.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>String</code> - the current instance encoded as an tmx format
xml text  

* * *

<a name="TMX+parse"></a>

### tmX.parse(the)
Parse tmx 1.4 files

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| the | <code>Object</code> | parsed TMX file in json form |


* * *

<a name="TMX+deserialize"></a>

### tmX.deserialize(xml)
Deserialize the given string as an xml file in tmx format
into this tmx instance. If there are any existing translation
units already in this instance, they will be removed first.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| xml | <code>String</code> | the tmx format text to parse |


* * *

<a name="TMX+getVersion"></a>

### tmX.getVersion() ⇒ <code>String</code>
Return the version of this tmx file. If you deserialize a string into this
instance of Tmx, the version will be reset to whatever is found inside of
the tmx file.

**Kind**: instance method of [<code>TMX</code>](#TMX)  
**Returns**: <code>String</code> - the version of this tmx  

* * *

<a name="TMX+write"></a>

### tmX.write(targetDir)
Write out the tmx file to the path.

**Kind**: instance method of [<code>TMX</code>](#TMX)  

| Param | Type | Description |
| --- | --- | --- |
| targetDir | <code>String</code> \| <code>undefined</code> | if the path was given as relative, then this is the directory that it is relative to. If it was given as absolute, you can pass in undefined. |


* * *

