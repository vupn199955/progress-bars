const timeout = process.env.SLOWMO ? 30000 : 10000;
let apiResponse;

beforeAll(async () => {
    await page.goto(URL, {waitUntil: 'domcontentloaded'});
    const finalResponse = await page.waitForResponse(response => 
        response.url() === 'http://pb-api.herokuapp.com/bars'
        && (response.request().method() === 'PATCH' 
        || response.request().method() === 'GET'), 11);
    apiResponse = await finalResponse.json();
});

test('Title of the page', async () => {
    const title = await page.title();
    expect(title).toBe('Progress bars');
    
}, timeout);

test('Has select bar element', async () => {
    const result = await page.$('#select-bar') !== null;
    expect(result).toBe(true);
}, timeout);

describe('Test API response', () => {
    test('Expected response has property "bars"', () => {
        return expect(apiResponse).toHaveProperty("bars")
    });

    test('Expected response has property "buttons"', () => {
        return expect(apiResponse).toHaveProperty("buttons")
    });

    test('Expected response has property "limit"', () => {
        return expect(apiResponse).toHaveProperty("limit")
    });
});

describe('Test increase/decrease buttons', () => {
    test('Has btn container element', async () => {
        const result = await page.$('#btn-container') !== null;
        expect(result).toBe(true);
    }, timeout);

    test('The number of buttons has been rendered must be equal with API response', async () => {
        const buttons = await page.$$('button[class="btn btn-info m-1"]');
        expect(buttons.length === apiResponse.buttons.length).toBe(true);
    }, timeout);

    test('The buttons must be has text value match with API response', async () => {
        const buttons = await page.$$('button[class="btn btn-info m-1"]');
        for (let i = 0; i < buttons.length; i++) {
            const text = await (await buttons[i].getProperty('innerText')).jsonValue();
            const isMatched = apiResponse.buttons.indexOf(parseFloat(text)) > -1;
            expect(isMatched).toBe(true);
        }
    }, timeout);
});

describe('Test progress bars', () => {
    test('The number of progress bars has been rendered must be match with API response', async () => {
        const progressBars = await page.$$('div[class="progress my-3"]');
        expect(progressBars.length === apiResponse.bars.length).toBe(true);
    }, timeout);

    test('The max value of progress bars must be match with API response', async () => {
        const progressBars = await page.$$('div[class="progress-bar"]');
        for (let i = 0; i < progressBars.length; i++) {
            const value = await (await progressBars[i].getProperty('aria-valuemax')).jsonValue();
            const isMatched = apiResponse.limit == value;
            expect(isMatched).toBe(true);
        }
    }, timeout);

    test('The default value of progress bars must be match with API response', async () => {
        const progressBars = await page.$$('div[class="progress-bar"]');
        for (let i = 0; i < progressBars.length; i++) {
            const value = await (await progressBars[i].getProperty('aria-valuenow')).jsonValue();
            const isMatched = apiResponse.bars.indexOf(parseFloat(value)) > -1;
            expect(isMatched).toBe(true);
        }
    }, timeout);

    test('The progress bar must be change color to yellow when selected in dropdow', async () => {
        const progressIdFirst = 'progress-1';
        await page.select(`#select-bar`, progressIdFirst); // select option first

        const progressBar = await page.$(`div[id="${progressIdFirst}"]`);
        const className = await (await progressBar.getProperty('className')).jsonValue();
        expect(className.indexOf('bg-warning') > -1).toBe(true);
    }, timeout);

    test('The value of progress bar actived must be updated when click on button increase/decrease', async () => {
        const progressIdFirst = 'progress-1';

        const buttons = await page.$$('button[class="btn btn-info m-1"]');
        const text = await (await buttons[0].getProperty('innerText')).jsonValue();

        const currentValue = await page.evaluate(`document.querySelector("div[id='${progressIdFirst}']").getAttribute("aria-valuenow")`);
        const expectedValue = parseFloat(currentValue) + parseFloat(text);

        await page.click('button[class="btn btn-info m-1"]'); // click first button
        const newValue = await page.evaluate(`document.querySelector("div[id='${progressIdFirst}']").getAttribute("aria-valuenow")`);
        expect(newValue == expectedValue).toBe(true);
    }, timeout);
});

describe('Test limit label', () => {
    test('Has limit label element', async () => {
        const element = await page.$('#limit-value');
        const result = await page.evaluate(element => element.innerText, element) !== null;
        expect(result).toBe(true);
    }, timeout);
    
    test('Limit value must be match with API response', async () => {
        const element = await page.$('#limit-value');
        const result = await page.evaluate(element => element.innerText, element) == apiResponse.limit;
        expect(result).toBe(true);
    }, timeout);
});