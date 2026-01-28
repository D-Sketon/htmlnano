// this file has trailing whitespaces that should be kept

import { init } from '../htmlnano.ts';

describe('removeOptionalTags', () => {
    const options = {
        removeOptionalTags: true
    };

    it('shouldn\'t omit optional tag if has attributes', () => {
        const input = `
        <html lang="en">
            <p>Welcome to this example.</p>
        </html>`;

        return init(input, input, options);
    });

    it('document example', () => {
        const input = '<html><head><title>Title</title></head><body><p>Hi</p></body></html>';
        const expected = '<title>Title</title><p>Hi</p>';

        return init(input, expected, options);
    });

    context('omit optional <html>', () => {
        it('default', () => {
            const input = `
            <html>
                <p>Welcome to this example.</p>
            </html>
            `;

            const expected = `
            
                <p>Welcome to this example.</p>
            
            `;

            return init(input, expected, options);
        });

        it('first thing inside <html> is a comment', () => {
            const input = `
            <html>
                <!-- where is this comment in the DOM? -->
            </html>`;
            const expected = `
            
                <!-- where is this comment in the DOM? -->
            `;

            return init(input, expected, options);
        });

        it('first thing inside <html> is whitespace then comment', () => {
            const input = '<html> <!-- where is this comment in the DOM? --><p>Hi</p></html>';
            const expected = ' <!-- where is this comment in the DOM? --><p>Hi</p>';

            return init(input, expected, options);
        });

        it('<html> is not immediately followed by a comment', () => {
            const input = `
            <html>
                <p>Welcome to this example.</p>
            </html><!-- where is this comment in the DOM? -->`;

            return init(input, input, options);
        });

        it('<html> followed by whitespace then comment', () => {
            const input = '<html><p>Hi</p></html> <!-- comment -->';
            const expected = '<p>Hi</p> <!-- comment -->';

            return init(input, expected, options);
        });
    });

    context('omit optional <head>', () => {
        it('<head> has elements', () => {
            const input = '<head><title>Title</title>';
            const expected = '<title>Title</title>';

            return init(input, expected, options);
        });

        it('<head> first child is whitespace', () => {
            const input = '<head> <title>Title</title></head>';

            return init(input, input, options);
        });

        it('<head> surrouned by whitespaces', () => {
            const input = `
            <!DOCTYPE HTML>
            <html>
                <!-- prevent <html> being removed -->
                <head>
                    <title>Hello</title>
                </head>
            </html>`;
            const expected = `
            <!DOCTYPE HTML>
            
                <!-- prevent <html> being removed -->
                <head>
                    <title>Hello</title>
                </head>
            `;

            return init(input, expected, options);
        });

        it('empty <head>', () => {
            const input = `
            <!DOCTYPE HTML>
            <html>
                <!-- prevent <html> being removed -->
                <head>
    
                </head></html>`;

            const expected = `
            <!DOCTYPE HTML>
            
                <!-- prevent <html> being removed -->
                
    
                `;

            return init(input, expected, options);
        });

        it('the first node inside <head> element is text', () => {
            const input = `
            <!DOCTYPE HTML>
            <html><!-- prevent <html> being removed --><head>Example</head></html>`;

            return init(input, input, options);
        });

        it('<head> is followed by whitespaces', () => {
            const input = `
            <!DOCTYPE HTML>
            <html><!-- prevent <html> being removed --><head></head>
            </html>`;

            return init(input, input, options);
        });

        it('<head> is followed by comment', () => {
            const input = `
            <!DOCTYPE HTML>
            <html><!-- prevent <html> being removed --><head></head><!-- prevent <html> being removed -->
            </html>`;

            return init(input, input, options);
        });
    });

    context('omit optional <body>', () => {
        it('default', () => {
            const input = `
            <body>
                <p>htmlnano</p>
            </body>
            `;

            // There is whitespaces after <body> and before </body>, thus <body> can't be ommited
            return init(input, input, options);
        });

        it('no white spaces nearby', () => {
            const input = '<body><p>htmlnano</p></body>';
            const expected = '<p>htmlnano</p>';

            return init(input, expected, options);
        });

        it('empty <body>', () => {
            const input = '<body></body>';
            const expected = '';

            return init(input, expected, options);
        });

        it('first child meta keeps <body>', () => {
            const input = '<body><meta charset="utf-8"><p>htmlnano</p></body>';

            return init(input, input, options);
        });

        it('first child link keeps <body>', () => {
            const input = '<body><link rel="stylesheet"><p>htmlnano</p></body>';

            return init(input, input, options);
        });

        it('first child script keeps <body>', () => {
            const input = '<body><script></script><p>htmlnano</p></body>';

            return init(input, input, options);
        });

        it('first child template keeps <body>', () => {
            const input = '<body><template></template><p>htmlnano</p></body>';

            return init(input, input, options);
        });

        it('first child comment keeps <body>', () => {
            const input = '<body><!-- comment --><p>htmlnano</p></body>';

            return init(input, input, options);
        });

        it('<body> followed by comment keeps tag', () => {
            const input = '<body><p>htmlnano</p></body><!-- comment -->';

            return init(input, input, options);
        });

        it('<body> followed by whitespace can be omitted', () => {
            const input = '<body><p>htmlnano</p></body> \n';
            const expected = '<p>htmlnano</p> \n';

            return init(input, expected, options);
        });
    });

    it('html spec example 1', () => {
        const input = `
<!DOCTYPE HTML>
<html>
    <head>
        <title>Hello</title>
    </head>
    <body>
        <p>Welcome to this example.</p>
    </body>
</html>`;
        // </body> just can't be reomved simply because posthtml can't do this.
        // See https://github.com/maltsev/htmlnano/issues/99
        const expected = `
<!DOCTYPE HTML>

    <head>
        <title>Hello</title>
    </head>
    <body>
        <p>Welcome to this example.</p>
    </body>
`;

        return init(input, expected, options);
    });

    it('html spec example 2', () => {
        const input = '<!DOCTYPE HTML><html><head><title>Hello</title></head><body><p>Welcome to this example.</p></body></html>';
        const expected = '<!DOCTYPE HTML><title>Hello</title><p>Welcome to this example.</p>';

        return init(input, expected, options);
    });

    context('omit optional <colgroup>', () => {
        it('default', () => {
            const input = '<colgroup><col><col><col></colgroup>';
            const expected = '<col><col><col>';

            return init(input, expected, options);
        });

        it('empty <colgroup>', () => {
            const input = '<colgroup></colgroup>';

            return init(input, input, options);
        });

        it('first child node is not <col>', () => {
            const input = '<colgroup><div></div><col><col></colgroup>';

            return init(input, input, options);
        });

        it('first child is whitespace then <col>', () => {
            const input = '<colgroup> <col></colgroup>';

            return init(input, input, options);
        });

        it('<colgroup> followed by comment', () => {
            const input = '<colgroup><div></div><col><col></colgroup><!-- comment -->';

            return init(input, input, options);
        });

        it('<colgroup> with comment after keeps tag', () => {
            const input = '<colgroup><col></colgroup><!-- comment -->';

            return init(input, input, options);
        });

        it('<colgroup> followed by space', () => {
            const input = '<colgroup><div></div><col><col></colgroup> ';

            return init(input, input, options);
        });

        it('<colgroup> preceded by <colgroup>', () => {
            const input = '<colgroup><col></colgroup><colgroup><col></colgroup>';
            const expected = '<col><colgroup><col></colgroup>';

            return init(input, expected, options);
        });
    });

    context('omit optional <tbody>', () => {
        it('omit <tbody>', () => {
            const input = '<table><tbody><tr></tr></tbody></table>';
            const expected = '<table><tr></tr></table>';

            return init(input, expected, options);
        });

        it('<tbody> followed by another <tbody>', () => {
            const input = '<table><tbody><tr></tr></tbody><tbody><tr></tr></tbody></table>';

            return init(input, input, options);
        });

        it('<tbody> followed by <tfoot>', () => {
            const input = '<table><tbody><tr></tr></tbody><tfoot></tfoot></table>';

            return init(input, input, options);
        });

        it('empty <tbody>', () => {
            const input = '<tbody></tbody>';

            return init(input, input, options);
        });

        it('<tbody> preceded by <thead>', () => {
            const input = '<table><thead></thead><tbody><tr></tr></tbody></table>';

            return init(input, input, options);
        });

        it('first child is whitespace then <tr>', () => {
            const input = '<table><tbody> <tr></tr></tbody></table>';

            return init(input, input, options);
        });

        it('first child is comment keeps <tbody>', () => {
            const input = '<table><tbody><!-- comment --><tr></tr></tbody></table>';

            return init(input, input, options);
        });
    });

    it('html spec example 3', () => {
        const input = `
<table>
 <caption>37547 TEE Electric Powered Rail Car Train Functions (Abbreviated)</caption>
 <colgroup><col><col><col></colgroup>
 <thead>
  <tr>
   <th>Function</th>
   <th>Control Unit</th>
   <th>Central Station</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>Headlights</td>
   <td>✔</td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Interior Lights</td>
   <td>✔</td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Electric locomotive operating sounds</td>
   <td>✔</td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Engineer's cab lighting</td>
   <td></td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Station Announcements - Swiss</td>
   <td></td>
   <td>✔</td>
  </tr>
 </tbody>
</table>`;
        // </caption>, </thead>, </th>, </td> and </tr> just can't be reomved simply because posthtml can't do this.
        // See https://github.com/maltsev/htmlnano/issues/99
        const expected = `
<table>
 <caption>37547 TEE Electric Powered Rail Car Train Functions (Abbreviated)</caption>
 <colgroup><col><col><col></colgroup>
 <thead>
  <tr>
   <th>Function</th>
   <th>Control Unit</th>
   <th>Central Station</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>Headlights</td>
   <td>✔</td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Interior Lights</td>
   <td>✔</td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Electric locomotive operating sounds</td>
   <td>✔</td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Engineer's cab lighting</td>
   <td></td>
   <td>✔</td>
  </tr>
  <tr>
   <td>Station Announcements - Swiss</td>
   <td></td>
   <td>✔</td>
  </tr>
 </tbody>
</table>`;

        return init(input, expected, options);
    });
});
