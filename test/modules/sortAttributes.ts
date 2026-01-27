import { init } from '../htmlnano.ts';

describe('sortAttributes', () => {
    it('alphabetical', () => {
        return init(
            '<input type="text" class="form-control" name="testInput" autofocus="" autocomplete="off" id="testId">',
            '<input autocomplete="off" autofocus="" class="form-control" id="testId" name="testInput" type="text">',
            {
                sortAttributes: 'alphabetical'
            }
        );
    });

    it('frequency', () => {
        return init(
            '<input type="text" class="form-control" name="testInput" autofocus="" autocomplete="off" id="testId"><a id="testId" href="#" class="testClass"></a><img width="20" src="../images/image.png" height="40" alt="image" class="cls" id="id2">',
            '<input class="form-control" id="testId" autocomplete="off" autofocus="" name="testInput" type="text"><a class="testClass" id="testId" href="#"></a><img class="cls" id="id2" alt="image" height="40" src="../images/image.png" width="20">',
            {
                sortAttributes: 'frequency'
            }
        );
    });

    it('true (alphabetical)', () => {
        return init(
            '<input type="text" class="form-control" name="testInput" autofocus="" autocomplete="off" id="testId">',
            '<input autocomplete="off" autofocus="" class="form-control" id="testId" name="testInput" type="text">',
            {
                sortAttributes: true
            }
        );
    });

    it('false (disabled)', () => {
        const html = '<input type="text" name="testInput" class="form-control" id="testId">';

        return init(html, html, {
            sortAttributes: false
        });
    });

    it('invalid configuration', () => {
        const input = '<input type="text" class="form-control" name="testInput" autofocus="" autocomplete="off" id="testId">';

        return init(input, input, {
            // @ts-expect-error invalid configuration
            sortAttributes: 100
        });
    });

    it('frequency preserves attribute name case and tie order', () => {
        return init(
            '<svg viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet" data-foo="1"></svg><svg data-foo="2" preserveAspectRatio="xMidYMid meet" viewBox="0 0 10 10"></svg>',
            '<svg data-foo="1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 10 10"></svg><svg data-foo="2" preserveAspectRatio="xMidYMid meet" viewBox="0 0 10 10"></svg>',
            {
                sortAttributes: 'frequency'
            }
        );
    });

    // https://github.com/posthtml/htmlnano/issues/189
    it('issue #189', () => {
        return init(
            '<input id="name" name="name" autocomplete="name" type="text" required="">',
            '<input autocomplete="name" id="name" name="name" required="" type="text">',
            {
                sortAttributes: 'frequency'
            }
        );
    });
});
