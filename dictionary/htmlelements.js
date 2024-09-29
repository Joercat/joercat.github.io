       const htmlDictionary = {
    'html': {
        description: 'The root element of an HTML page.',
        example: '<html>\n  <head>\n    <title>Page Title</title>\n  </head>\n  <body>\n    <h1>This is a heading</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>'
    },
    'head': {
        description: 'Contains metadata/information for the document.',
        example: '<head>\n  <title>Page Title</title>\n  <meta charset="UTF-8">\n</head>'
    },
    'title': {
        description: 'Defines a title for the document.',
        example: '<title>My Web Page</title>'
    },
    'body': {
        description: 'Defines the document\'s body.',
        example: '<body>\n  <h1>This is a heading</h1>\n  <p>This is a paragraph.</p>\n</body>'
    },
    'h1': {
        description: 'Defines the most important heading.',
        example: '<h1>Main Heading</h1>'
    },
    'h2': {
        description: 'Defines the second level heading.',
        example: '<h2>Subheading</h2>'
    },
    'h3': {
        description: 'Defines the third level heading.',
        example: '<h3>Sub-subheading</h3>'
    },
    'h4': {
        description: 'Defines the fourth level heading.',
        example: '<h4>Minor heading</h4>'
    },
    'h5': {
        description: 'Defines the fifth level heading.',
        example: '<h5>Minor heading</h5>'
    },
    'h6': {
        description: 'Defines the least important heading.',
        example: '<h6>Minor heading</h6>'
    },
    'p': {
        description: 'Defines a paragraph.',
        example: '<p>This is a paragraph of text.</p>'
    },
    'br': {
        description: 'Inserts a single line break.',
        example: 'Line 1<br>Line 2'
    },
    'hr': {
        description: 'Defines a thematic change in the content.',
        example: '<p>Text above</p>\n<hr>\n<p>Text below</p>'
    },
    'a': {
        description: 'Defines a hyperlink.',
        example: '<a href="https://www.example.com">Visit Example.com</a>'
    },
    'img': {
        description: 'Defines an image.',
        example: '<img src="image.jpg" alt="Description of image">'
    },
    'div': {
        description: 'Defines a section in a document.',
        example: '<div>\n  <p>This is a paragraph inside a div.</p>\n</div>'
    },
    'span': {
        description: 'Defines a section in a document.',
        example: 'This is <span style="color: red;">red</span> text.'
    },
    'table': {
        description: 'Defines a table.',
        example: '<table>\n  <tr>\n    <th>Header 1</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Row 1, Cell 1</td>\n    <td>Row 1, Cell 2</td>\n  </tr>\n</table>'
    },
    'tr': {
        description: 'Defines a row in a table.',
        example: '<tr>\n  <td>Row 1, Cell 1</td>\n  <td>Row 1, Cell 2</td>\n</tr>'
    },
    'th': {
        description: 'Defines a header cell in a table.',
        example: '<th>Header Cell</th>'
    },
    'td': {
        description: 'Defines a cell in a table.',
        example: '<td>Table Cell</td>'
    },
    'ul': {
        description: 'Defines an unordered list.',
        example: '<ul>\n  <li>First item</li>\n  <li>Second item</li>\n</ul>'
    },
    'ol': {
        description: 'Defines an ordered list.',
        example: '<ol>\n  <li>First item</li>\n  <li>Second item</li>\n</ol>'
    },
    'li': {
        description: 'Defines a list item.',
        example: '<li>List item</li>'
    },
    'form': {
        description: 'Defines an HTML form for user input.',
        example: '<form action="/submit" method="post">\n  <input type="text" name="username">\n  <input type="submit" value="Submit">\n</form>'
    },
    'input': {
        description: 'Defines an input control.',
        example: '<input type="text" name="username">'
    },
    'textarea': {
        description: 'Defines a multiline input control.',
        example: '<textarea rows="4" cols="50">Enter text here...</textarea>'
    },
    'button': {
        description: 'Defines a clickable button.',
        example: '<button type="button">Click me!</button>'
    },
    'select': {
        description: 'Defines a drop-down list.',
        example: '<select>\n  <option value="1">Option 1</option>\n  <option value="2">Option 2</option>\n</select>'
    },
    'option': {
        description: 'Defines an option in a drop-down list.',
        example: '<option value="1">Option 1</option>'
    },
    'label': {
        description: 'Defines a label for an <input> element.',
        example: '<label for="username">Username:</label>\n<input type="text" id="username" name="username">'
    },
    'fieldset': {
        description: 'Groups related elements in a form.',
        example: '<fieldset>\n  <legend>Personal Information</legend>\n  <label for="name">Name:</label>\n  <input type="text" id="name" name="name">\n</fieldset>'
    },
    'legend': {
        description: 'Defines a caption for a <fieldset> element.',
        example: '<legend>Personal Information</legend>'
    },
    'iframe': {
        description: 'Defines an inline frame.',
        example: '<iframe src="https://www.example.com" width="500" height="300"></iframe>'
    },
    'audio': {
        description: 'Defines sound content.',
        example: '<audio controls>\n  <source src="audio.mp3" type="audio/mpeg">\n  Your browser does not support the audio element.\n</audio>'
    },
    'video': {
        description: 'Defines a video or movie.',
        example: '<video width="320" height="240" controls>\n  <source src="movie.mp4" type="video/mp4">\n  Your browser does not support the video tag.\n</video>'
    },
    'source': {
        description: 'Defines multiple media resources for media elements.',
        example: '<source src="movie.mp4" type="video/mp4">'
    },
    'canvas': {
        description: 'Used to draw graphics, on the fly, via scripting.',
        example: '<canvas id="myCanvas" width="200" height="100"></canvas>'
    },
    'script': {
        description: 'Defines a client-side script.',
        example: '<script>\n  console.log("Hello, World!");\n</script>'
    },
    'noscript': {
        description: 'Defines an alternate content for users that do not support client-side scripts.',
        example: '<noscript>Your browser does not support JavaScript!</noscript>'
    },
    'style': {
        description: 'Defines style information for a document.',
        example: '<style>\n  body { background-color: lightblue; }\n</style>'
    },
    'link': {
        description: 'Defines the relationship between a document and an external resource.',
        example: '<link rel="stylesheet" href="styles.css">'
    },
    'meta': {
        description: 'Defines metadata about an HTML document.',
        example: '<meta charset="UTF-8">'
    },
    'base': {
        description: 'Specifies the base URL/target for all relative URLs in a document.',
        example: '<base href="https://www.example.com/" target="_blank">'
    },
    'nav': {
        description: 'Defines navigation links.',
        example: '<nav>\n  <a href="/home">Home</a>\n  <a href="/about">About</a>\n</nav>'
    },
    'header': {
        description: 'Defines a header for a document or section.',
        example: '<header>\n  <h1>Welcome to My Website</h1>\n</header>'
    },
    'footer': {
        description: 'Defines a footer for a document or section.',
        example: '<footer>\n  <p>&copy; 2023 My Company</p>\n</footer>'
    },
    'main': {
        description: 'Specifies the main content of a document.',
        example: '<main>\n  <h1>Main Content</h1>\n  <p>This is the main content of the page.</p>\n</main>'
    },
    'section': {
        description: 'Defines a section in a document.',
        example: '<section>\n  <h2>Section Title</h2>\n  <p>This is a section of content.</p>\n</section>'
    },
    'article': {
        description: 'Defines an independent, self-contained content.',
        example: '<article>\n  <h2>Article Title</h2>\n  <p>This is an independent piece of content.</p>\n</article>'
    },
    'aside': {
        description: 'Defines content aside from the page content.',
        example: '<aside>\n  <h3>Related Links</h3>\n  <ul>\n    <li><a href="#">Link 1</a></li>\n    <li><a href="#">Link 2</a></li>\n  </ul>\n</aside>'
    },
    'details': {
        description: 'Defines additional details that the user can view or hide.',
        example: '<details>\n  <summary>Click to view details</summary>\n  <p>Additional information here.</p>\n</details>'
    },
    'summary': {
        description: 'Defines a visible heading for a <details> element.',
        example: '<summary>Click to view details</summary>'
    },
    'figure': {
        description: 'Specifies self-contained content.',
        example: '<figure>\n  <img src="image.jpg" alt="Description">\n  <figcaption>Fig.1 - Image description</figcaption>\n</figure>'
    },
    'figcaption': {
        description: 'Defines a caption for a <figure> element.',
        example: '<figcaption>Fig.1 - Image description</figcaption>'
    },
    'mark': {
        description: 'Defines marked/highlighted text.',
        example: 'This text contains <mark>highlighted</mark> content.'
    },
    'time': {
        description: 'Defines a date/time.',
        example: '<time datetime="2023-05-16">May 16, 2023</time>'
    },
    'progress': {
        description: 'Represents the progress of a task.',
        example: '<progress value="70" max="100">70%</progress>'
    },
    'meter': {
        description: 'Defines a scalar measurement within a known range.',
        example: '<meter value="3" min="0" max="10">3 out of 10</meter>'
    },
    'code': {
        description: 'Defines a piece of computer code.',
        example: '<code>console.log("Hello, World!");</code>'
    },
    'pre': {
        description: 'Defines preformatted text.',
        example: '<pre>\nfunction greet() {\n  console.log("Hello, World!");\n}\n</pre>'
    },
    'blockquote': {
        description: 'Defines a section that is quoted from another source.',
        example: '<blockquote cite="https://www.example.com">\n  <p>This is a quoted paragraph.</p>\n</blockquote>'
    },
    'q': {
        description: 'Defines a short quotation.',
        example: 'He said, <q>The quick brown fox jumps over the lazy dog.</q>'
    },
    'abbr': {
        description: 'Defines an abbreviation or an acronym.',
        example: 'The <abbr title="World Health Organization">WHO</abbr> was founded in 1948.'
    },
    'cite': {
        description: 'Defines the title of a work.',
        example: '<cite>The Scream</cite> by Edvard Munch.'
    },
    'dfn': {
        description: 'Represents the defining instance of a term.',
        example: '<dfn>HTML</dfn> is the standard markup language for creating web pages.'
    },
    'sub': {
        description: 'Defines subscripted text.',
        example: 'H<sub>2</sub>O'
    },
    'sup': {
        description: 'Defines superscripted text.',
        example: 'X<sup>2</sup>'
    },
    'small': {
        description: 'Defines smaller text.',
        example: '<small>Copyright 2023</small>'
    },
    'strong': {
        description: 'Defines important text.',
        example: '<strong>Warning!</strong> This action cannot be undone.'
    },
    'em': {
        description: 'Defines emphasized text.',
        example: 'This is <em>very</em> important.'
    },
    'i': {
        description: 'Defines a part of text in an alternate voice or mood.',
        example: '<i>Lorem ipsum</i> is commonly used placeholder text.'
    },
    'b': {
        description: 'Defines bold text.',
        example: 'This is <b>bold</b> text.'
    },
    'u': {
        description: 'Defines text that should be stylistically different from normal text.',
        example: 'This is <u>underlined</u> text.'
    },
    's': {
        description: 'Defines text that is no longer correct.',
        example: '<s>$999</s> $799'
    },
    'wbr': {
        description: 'Defines a possible line-break.',
        example: 'This is a very<wbr>long<wbr>word.'
    },
    'bdo': {
        description: 'Overrides the current text direction.',
        example: '<bdo dir="rtl">This text will go right-to-left.</bdo>'
    },
    'ruby': {
        description: 'Defines a ruby annotation (for East Asian typography).',
        example: '<ruby>漢 <rt>かん</rt></ruby>'
    },
    'rt': {
        description: 'Defines an explanation/pronunciation of characters (for East Asian typography).',
        example: '<ruby>漢 <rt>かん</rt></ruby>'
    },
    'rp': {
        description: 'Defines what to show in browsers that do not support ruby annotations',
        example: '<ruby>\n  漢 <rp>(</rp><rt>かん</rt><rp>)</rp>\n</ruby>'
    },
    'data': {
        description: 'Links the given content with a machine-readable translation',
        example: '<data value="398">Mini Ketchup</data>'
    },
    'var': {
        description: 'Defines a variable',
        example: '<p>The area of a triangle is: 1/2 x <var>b</var> x <var>h</var></p>'
    },
    'samp': {
        description: 'Defines sample output from a computer program',
        example: '<p>Message from my computer:</p>\n<samp>File not found.<br>Press F1 to continue</samp>'
    },
    'kbd': {
        description: 'Defines keyboard input',
        example: '<p>Save the document by pressing <kbd>Ctrl + S</kbd></p>'
    },
    'del': {
        description: 'Defines text that has been deleted from a document',
        example: '<p>My favorite color is <del>blue</del> <ins>red</ins>!</p>'
    },
    'ins': {
        description: 'Defines a text that has been inserted into a document',
        example: '<p>My favorite color is <del>blue</del> <ins>red</ins>!</p>'
    },
    'picture': {
        description: 'Defines a container for multiple image resources',
        example: '<picture>\n  <source media="(min-width:650px)" srcset="img_pink_flowers.jpg">\n  <source media="(min-width:465px)" srcset="img_white_flower.jpg">\n  <img src="img_orange_flowers.jpg" alt="Flowers">\n</picture>'
    },
    'template': {
        description: 'Defines a template',
        example: '<template>\n  <h2>Flower</h2>\n  <img src="img_white_flower.jpg" width="214" height="204">\n</template>'
    },
    'slot': {
        description: 'Defines a placeholder inside a web component',
        example: '<template id="element-details-template">\n  <slot name="element-name">NEED NAME</slot>\n</template>'
    },
    'map': {
        description: 'Defines a client-side image-map',
        example: '<img src="workplace.jpg" alt="Workplace" usemap="#workmap">\n<map name="workmap">\n  <area shape="rect" coords="34,44,270,350" alt="Computer" href="computer.htm">\n</map>'
    },
    'area': {
        description: 'Defines an area inside an image-map',
        example: '<img src="workplace.jpg" alt="Workplace" usemap="#workmap">\n<map name="workmap">\n  <area shape="rect" coords="34,44,270,350" alt="Computer" href="computer.htm">\n</map>'
    },
    'colgroup': {
        description: 'Specifies a group of one or more columns in a table for formatting',
        example: '<table>\n  <colgroup>\n    <col span="2" style="background-color:red">\n    <col style="background-color:yellow">\n  </colgroup>\n  <tr>\n    <th>ISBN</th>\n    <th>Title</th>\n    <th>Price</th>\n  </tr>\n  <tr>\n    <td>3476896</td>\n    <td>My first HTML</td>\n    <td>$53</td>\n  </tr>\n</table>'
    },
    'col': {
        description: 'Specifies column properties for each column within a <colgroup> element',
        example: '<table>\n  <colgroup>\n    <col span="2" style="background-color:red">\n    <col style="background-color:yellow">\n  </colgroup>\n  <tr>\n    <th>ISBN</th>\n    <th>Title</th>\n    <th>Price</th>\n  </tr>\n</table>'
    },
    'caption': {
        description: 'Defines a table caption',
        example: '<table>\n  <caption>Monthly savings</caption>\n  <tr>\n    <th>Month</th>\n    <th>Savings</th>\n  </tr>\n  <tr>\n    <td>January</td>\n    <td>$100</td>\n  </tr>\n</table>'
    },
    'thead': {
        description: 'Groups the header content in a table',
        example: '<table>\n  <thead>\n    <tr>\n      <th>Month</th>\n      <th>Savings</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>January</td>\n      <td>$100</td>\n    </tr>\n  </tbody>\n</table>'
    },
    'tbody': {
        description: 'Groups the body content in a table',
        example: '<table>\n  <thead>\n    <tr>\n      <th>Month</th>\n      <th>Savings</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>January</td>\n      <td>$100</td>\n    </tr>\n  </tbody>\n</table>'
    },
    'tfoot': {
        description: 'Groups the footer content in a table',
        example: '<table>\n  <thead>\n    <tr>\n      <th>Month</th>\n      <th>Savings</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>January</td>\n      <td>$100</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <td>Sum</td>\n      <td>$180</td>\n    </tr>\n  </tfoot>\n</table>'
    },
    'optgroup': {
        description: 'Defines a group of related options in a drop-down list',
        example: '<select>\n  <optgroup label="Swedish Cars">\n    <option value="volvo">Volvo</option>\n    <option value="saab">Saab</option>\n  </optgroup>\n  <optgroup label="German Cars">\n    <option value="mercedes">Mercedes</option>\n    <option value="audi">Audi</option>\n  </optgroup>\n</select>'
    },
    'output': {
        description: 'Defines the result of a calculation',
        example: '<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">\n  <input type="range" id="a" value="50">\n  +<input type="number" id="b" value="25">\n  =<output name="x" for="a b"></output>\n</form>'
    },
    'dialog': {
        description: 'Defines a dialog box or window',
        example: '<dialog open>\n  <p>This is an open dialog window</p>\n</dialog>'
    },
    'datalist': {
        description: 'Specifies a list of pre-defined options for input controls',
        example: '<input list="browsers">\n<datalist id="browsers">\n  <option value="Internet Explorer">\n  <option value="Firefox">\n  <option value="Chrome">\n  <option value="Opera">\n  <option value="Safari">\n</datalist>'
    },
    'track': {
        description: 'Defines text tracks for media elements (<video> and <audio>)',
        example: '<video width="320" height="240" controls>\n  <source src="forrest_gump.mp4" type="video/mp4">\n  <source src="forrest_gump.ogg" type="video/ogg">\n  <track src="fgsubtitles_en.vtt" kind="subtitles" srclang="en" label="English">\n  <track src="fgsubtitles_no.vtt" kind="subtitles" srclang="no" label="Norwegian">\n</video>'
    },
    'embed': {
        description: 'Defines a container for an external application',
        example: '<embed type="image/jpg" src="pic_trulli.jpg" width="300" height="200">'
    },
    'object': {
        description: 'Defines an embedded object',
        example: '<object data="movie.mp4" width="400" height="300"></object>'
    },
    'param': {
        description: 'Defines a parameter for an object',
        example: '<object data="horse.wav">\n  <param name="autoplay" value="true">\n</object>'
    }
};
