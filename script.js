import puppeteer from "puppeteer";
import xlsx from "xlsx";
import fs from "fs";

// const browser = await puppeteer.launch({headless: false,defaultViewport: null});
const browser = await puppeteer.launch({ headless: false, slowMo: 40 });
const page = await browser.newPage();
let companyDataObject = [];
let countryName = "dubai";

(async () => {
  await page.goto("https://linkedin.com", {
    args: ["--incognito"],
  });
  await page.setViewport({ width: 1366, height: 1024 });
  // user email id 
  await page.waitForSelector("#session_key");
  await page.type("#session_key", "materialstudy6969@gmail.com");
  //user password 
  await page.waitForSelector("#session_password");
  await page.type("#session_password", "Rahul@123");
  await page.keyboard.press("Enter");

  await page.waitForNavigation();
  // find the selector of input box
  await page.waitForSelector(".search-global-typeahead__input");
  await page.type(".search-global-typeahead__input", "education");
  await page.keyboard.press("Enter");

  await page.waitForNavigation();

  await page.waitForSelector("#search-reusables__filters-bar");
  let searchFiltersDiv = await page.$("#search-reusables__filters-bar");
  // list of all the buttons
  let companyButton = await searchFiltersDiv.$$("button");

  for (let i in companyButton) {
    let innerText = await page.evaluate(
      (val) => val.textContent,
      companyButton[i]
    );
    // select the company button
    if (innerText.trim() === "Companies") {
      await companyButton[i].click();
      break;
    }
  }

  await page.waitForNavigation();
  // to open the drop down of location id
  await page.waitForSelector("#searchFilter_companyHqGeo");
  let locationButtonId = await page.$("#searchFilter_companyHqGeo");
  await locationButtonId.click();

  // now it will filter the values of company according to the country name
  await filterValues("Add a location", `${countryName}`);
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  let filterButtons = await page.$$(
    'button[data-control-name="filter_show_results"]'
  );
  await filterButtons[0].click();

  await page.waitForNavigation();

  // to click the industry button
  await page.waitForSelector("#searchFilter_industryCompanyVertical");
  let industryBtnId = await page.$("#searchFilter_industryCompanyVertical");
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  await industryBtnId.click();

  // filter the industry according to the input value
  await filterValues("Add an industry", "education");
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  filterButtons = await page.$$(
    'button[data-control-name="filter_show_results"]'
  );
  await filterButtons[1].click();

  await page.waitForNavigation();

  // open the company size dropdown
  await page.waitForSelector("#searchFilter_companySize");
  let companySize = await page.$("#searchFilter_companySize");
  await companySize.click();

  // flter the values according to the company size
  await page.waitForSelector("#companySize-C");
  let companyEmployee = await page.$("#companySize-C");
  await companyEmployee.click();
  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  filterButtons = await page.$$(
    'button[data-control-name="filter_show_results"]'
  );
  await filterButtons[2].click();

  await page.waitForNavigation();

  // this function will open the new page and strat filtering the data (here 0 means the total filtered companies are 0)
  await openCompanyPages(0);

  // to convert the object into excel sheet
  var newWB = xlsx.utils.book_new();
  var newWS = xlsx.utils.json_to_sheet(companyDataObject);
  xlsx.utils.book_append_sheet(newWB, newWS, "name");
  xlsx.writeFile(newWB, `${countryName}.xlsx`);
  await browser.close();

  // storing the json data in file
  const jsonData = JSON.stringify(companyDataObject);
  fs.writeFile(`${countryName}.json`, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Data has been written to data.json');
  });
})();


// function to filter the values according to the location , industry
async function filterValues(labelName, labelValue) {
  let locationInput = await page.waitForSelector(
    `input[aria-label = '${labelName}']`
  );
  await locationInput.type(`${labelValue}`,{delay:400});

  // to find the id of drop down because the area-controls contains the dynamic id of drop-down
  let locationDiv = await page.evaluate(
    (val) => val.getAttribute("aria-controls"),
    locationInput
  );
  await page.waitForSelector(`#${locationDiv}`);
  let field = await page.$(`#${locationDiv}`);

  // span span contains the inner text of country name,education , employee size
  let locationSpan = await field.$$("span span");
  let flag = true;
  for (let i in locationSpan) {
    let innerText = await page.evaluate(
      (val) => val.innerText,
      locationSpan[i]
    );
    if (innerText.toLowerCase().trim() === labelValue) {
      await locationSpan[i].click();
      flag = false;
      break;
    }
  }
  if(flag){
    await locationSpan[0].click()
  }
}


// to navigate over the different companies
async function openCompanyPages(companyCount) {
  await page.waitForSelector(".reusable-search__result-container");
  // gives the list of all the companies on the page
  let companiesList = await page.$$(".reusable-search__result-container");
  // to fetch the next button
  await page.waitForSelector('button[aria-label="Next"]');
  let nextBtn = await page.$('button[aria-label="Next"]');
  let isNextBtnDisabled = await page.evaluate((val) => val.disabled, nextBtn);

  for (let i = 0; i < companiesList.length; i++) {
    let page1;
    try {
      // .scale-down has the anchor tag of the current company div
      let companyLinks = await companiesList[i].$(".scale-down");
      let obj = {};
      if (companyLinks != null) {
        // to get the company link
        let anchorLink = await page.evaluate(
          (val) => val.getAttribute("href"),
          companyLinks
        );
        // to navigate over the about section
        let aboutPageLink = anchorLink + "about";
        page1 = await browser.newPage();
        await page1.goto(`${aboutPageLink}`);
        await page1.waitForSelector("h1");
        let h1 = await page1.$("h1");
        let CompanyName = await page1.evaluate(
          (val) => val.innerText.trim(),
          h1
        );
        obj["CompanyName"] = CompanyName;
        await page1.waitForSelector(".artdeco-card");
        // the dt of dl contains the keys of the companies
        await page1.waitForSelector(".artdeco-card dl dt");
        let dataList = await page1.$$(".artdeco-card dl dt");
        for (let i in dataList) {
          // keys
          let dataListkey = await page1.evaluate(
            (val) => val.innerText.trim(),
            dataList[i]
          );
          // value
          let dataListValue = await page1.evaluate(
            (val) => val.nextElementSibling.innerText.trim().split("\n")[0],
            dataList[i]
          );
          obj[`${dataListkey}`] = dataListValue;
        }
      }
      if (page1 != undefined) {
        // push the value inside object
        companyDataObject.push(obj);
        companyCount++;
        await page1.close();
        console.log(companyCount);
      }
    } catch (error) {
      console.log(error);
    }
  }
  if (!isNextBtnDisabled && companyCount < 30) {
    await nextBtn.click();
    await page.waitForNavigation();
    await openCompanyPages(companyCount);
  }
}
