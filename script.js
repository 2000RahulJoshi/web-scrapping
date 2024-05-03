import puppeteer from 'puppeteer';
// const browser = await puppeteer.launch({headless: false,defaultViewport: null});
const browser = await puppeteer.launch({headless: false,slowMo:50});

const page = await browser.newPage();
let companyDataObject = [];
 
(async () => {
 
  await page.goto('https://linkedin.com', {
    args: [
        '--incognito',
      ],
  });
  await page.setViewport({width: 1080, height: 1024});
  // const browser = await puppeteer.launch({defaultViewport: null});
  await page.waitForSelector('#session_key');
  await page.type('#session_key', 'materialstudy6969@gmail.com');
 
  await page.waitForSelector('#session_password');
  await page.type('#session_password', 'Rahul@123');
 
  await page.keyboard.press('Enter');

  await page.waitForNavigation();

  await page.waitForSelector(".search-global-typeahead__input");
  await page.type('.search-global-typeahead__input','education');
  await page.keyboard.press('Enter');

  await page.waitForNavigation();

  await page.waitForSelector('#search-reusables__filters-bar')
  let searchFiltersDiv = await page.$('#search-reusables__filters-bar')
  let companyButton = await searchFiltersDiv.$$('button')

  for(let i in companyButton){
    let innerText = await page.evaluate( (val)=> val.textContent,companyButton[i] )
    if(innerText.trim() === "Companies"){
      await companyButton[i].click()
      break;
    }
  }

  await page.waitForNavigation();

  await page.waitForSelector('#searchFilter_companyHqGeo');
  let locationButtonId = await page.$('#searchFilter_companyHqGeo');
  await locationButtonId.click()

  // let locationInput = await page.waitForSelector('input[aria-label = "Add a location"]')
  // await locationInput.type('india')

  // let locationDiv = await page.evaluate((val)=> val.getAttribute('aria-controls'),locationInput);
  // await page.waitForSelector(`#${locationDiv}`);
  // let field = await page.$(`#${locationDiv}`);

  // let locationSpan = await field.$('span span')
  // await locationSpan.click()

  // await page.waitForSelector('button[data-control-name="filter_show_results"]')
  // let filterButtons = await page.$$('button[data-control-name="filter_show_results"]')
  // await filterButtons[0].click()
  await filterValues("Add a location","india");
  await page.waitForSelector('button[data-control-name="filter_show_results"]')
  let filterButtons = await page.$$('button[data-control-name="filter_show_results"]')
  await filterButtons[0].click()

  await page.waitForNavigation();

  await page.waitForSelector('#searchFilter_industryCompanyVertical');
  let industryBtnId = await page.$('#searchFilter_industryCompanyVertical');
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  await industryBtnId.click();

  await filterValues("Add an industry","education");
  // await page.waitForSelector('button[data-control-name="filter_show_results"]');
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  filterButtons = await page.$$('button[data-control-name="filter_show_results"]');
  await filterButtons[1].click()

  await page.waitForNavigation();

  await page.waitForSelector('#searchFilter_companySize');
  let companySize = await page.$('#searchFilter_companySize');
  await companySize.click()

  await page.waitForSelector('#companySize-C');
  let companyEmployee = await page.$('#companySize-C')
  await companyEmployee.click()
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  filterButtons = await page.$$('button[data-control-name="filter_show_results"]');
  await filterButtons[2].click()
  
  await page.waitForNavigation();
  await openCompanyPages(0)
  console.log(companyDataObject)
})();



async function filterValues(labelName,labelValue){
  // let locationInput = await page.waitForSelector('input[aria-label = "Add a location"]')
  let locationInput = await page.waitForSelector(`input[aria-label = '${labelName}']`)
  await locationInput.type(`${labelValue}`)

  let locationDiv = await page.evaluate((val)=> val.getAttribute('aria-controls'),locationInput);
  await page.waitForSelector(`#${locationDiv}`);
  let field = await page.$(`#${locationDiv}`);

  let locationSpan = await field.$$('span span')
  for(let i in locationSpan){
    // console.log(i)
    let innerText = await page.evaluate( (val)=> val.innerText,locationSpan[i])
    if(innerText.toLowerCase().trim() === labelValue){
      await locationSpan[i].click()
      break;
    }
  }
}

async function openCompanyPages(companyCount){
  console.log('companycount--->',companyCount)
    await page.waitForSelector('.reusable-search__result-container');
    // console.log("in1")
    let companiesList = await page.$$('.reusable-search__result-container');
    // console.log("in2")
    await page.waitForSelector('button[aria-label="Next"]')
    // console.log("in3")
    let nextBtn = await page.$('button[aria-label="Next"]')
    // console.log("in4")
    let isNextBtnDisabled = await page.evaluate( (val)=> val.disabled,nextBtn)
    // console.log('companiesList--->',companiesList.length)
    
    for(let i=0;i<companiesList.length;i++){
      let page1;
      let companyLinks = await companiesList[i].$('.scale-down');
      let obj = {};
      if(companyLinks != null){
        // console.log("in")
        let anchorLink = await page.evaluate( (val)=> val.getAttribute('href'),companyLinks)
        let aboutPageLink = anchorLink + "about"
        // console.log(""aboutPageLink)
        page1 = await browser.newPage();
        await page1.goto(`${aboutPageLink}`);
        await page1.waitForSelector('h1');
        let h1 = await page1.$('h1');
        let CompanyName = await page1.evaluate( (val)=> val.innerText.trim(), h1 );
        obj["CompanyName"] = CompanyName;
        await page1.waitForSelector('.artdeco-card');
        await page1.waitForSelector('.artdeco-card dl dt');
        let dataList = await page1.$$('.artdeco-card dl dt');
        for(let i in dataList){
          let dataListkey = await page1.evaluate( (val)=> val.innerText.trim(),dataList[i])
          let dataListValue = await page1.evaluate ( (val)=> val.nextElementSibling.innerText.trim().split('\n')[0],dataList[i])
          obj[`${dataListkey}`] = dataListValue;
        }
      }
      if(page1 != undefined){
        companyDataObject.push(obj);
        companyCount++;
        await page1.close()
      }
  }
  if(!isNextBtnDisabled && companyCount < 20){
    await nextBtn.click();
    await page.waitForNavigation()
    await openCompanyPages(companyCount);
  }
  // console.log(companyCount);
}

