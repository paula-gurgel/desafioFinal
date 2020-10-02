let countDevs;
let totalDevs;
let inputName;
let conditionalAnd;
let conditionalOr;
let allDevs;
let filteredDevs;
let javaCheckBox;
let javaScriptCheckBox;
let pythonCheckBox;
const languagesFilter = {
  java: true,
  javascript: true,
  python: true,
};
let isOr = true;
let searchName = "";

window.addEventListener("load", async () => {
  getElements();
  createEvents();
  await fetchDevs();
  renderDevList();
});

const getElements = () => {
  countDevs = document.querySelector("#countDevs");
  totalDevs = document.querySelector("#totalDevs");
  inputName = document.querySelector("#searchName");
  conditionalAnd = document.querySelector("#conditionalAnd");
  conditionalOr = document.querySelector("#conditionalOr");
  javaCheckBox = document.querySelector("#java");
  javaScriptCheckBox = document.querySelector("#javascript");
  pythonCheckBox = document.querySelector("#python");
};

const createEvents = () => {
  javaCheckBox.addEventListener("input", handleCheckButtons);
  javaScriptCheckBox.addEventListener("input", handleCheckButtons);
  pythonCheckBox.addEventListener("input", handleCheckButtons);
  conditionalAnd.addEventListener("click", handleAndOr);
  conditionalOr.addEventListener("click", handleAndOr);
  inputName.addEventListener("input", handleNames);
};

const fetchDevs = async () => {
  const resource = await fetch("http://localhost:3001/devs");
  const json = await resource.json();

  allDevs = json.map((item) => {
    const { name, picture, programmingLanguages } = item;

    return {
      name,
      picture,
      programmingLanguages,
      searchLanguages: getOnlyLanguagesFrom(programmingLanguages),
      searchName: removeAccentMarksFrom(name),
    };
  });

  filteredDevs = allDevs;
};

const renderDevList = () => {
  let devsHTML = "<div class='row'>";
  filteredDevs.forEach(({ name, picture, programmingLanguages }) => {
    const languages = programmingLanguages.map((language) => language.id);
    const devHTML = `
    <div class="card horizontal col s4">
      <div>
        <img class="picture" src="${picture}">
      </div>
      <div class="card-stacked">
        <div class="card-content">
          <p> ${name}</p>
          <div class="lang-content">
            ${renderLanguages(languages)}
          </div>
        </div>
      </div>
    </div>
    `;
    devsHTML += devHTML;
  });
  devsHTML += "</div>";
  totalDevs.innerHTML = devsHTML;
  countDevs.textContent = filteredDevs.length;
};

const renderLanguages = (languages) => {
  return languages.map((language) => {
    const id = language.toLowerCase();
    return `
     <img class="lang-img" src="${getImageForLanguage(id)}" alt="${language}">
    `;
  });
};

const getImageForLanguage = (language) => {
  return `img-linguagens/${language}.png`;
};

const getOnlyLanguagesFrom = (languages) =>
  languages.map(({ id }) => id.toLowerCase()).sort();

const removeAccentMarksFrom = (text) => {
  const WITH_ACCENT_MARKS = "áãâäàéèêëíìîïóôõöòúùûüñ".split("");
  const WITHOUT_ACCENT_MARKS = "aaaaaeeeeiiiiooooouuuun".split("");
  const newText = text
    .toLocaleLowerCase()
    .split("")
    .map((char) => {
      const index = WITH_ACCENT_MARKS.indexOf(char);

      /**
       * Caso o caractere acentuado tenha sido
       * encontrado, substituímos pelo equivalente
       * do array b
       */
      if (index > -1) {
        return WITHOUT_ACCENT_MARKS[index];
      }

      return char;
    })
    .join("");

  return newText;
};

const handleCheckButtons = (event) => {
  const {
    target: { id, checked: value },
  } = event;
  languagesFilter[id] = value;
  filterDevs();
};

const filterDevs = () => {
  const selectedLanguages = Object.keys(languagesFilter).filter(
    (key) => languagesFilter[key]
  );

  filteredDevs = allDevs.filter((dev) => {
    const compare = dev.searchLanguages.filter((lang) =>
      selectedLanguages.includes(lang)
    );

    const nameCondition = dev.searchName.includes(searchName);
    const booleanForAnd =
      compare.length === selectedLanguages.length &&
      compare.length === dev.searchLanguages.length;

    const booleanForOr = compare.length > 0;

    return isOr
      ? booleanForOr && nameCondition
      : booleanForAnd && nameCondition;
  });
  renderDevList();
};

const handleAndOr = ({ target: { id } }) => {
  isOr = id === "conditionalOr";
  filterDevs();
};

const handleNames = ({ target: { value } }) => {
  searchName = removeAccentMarksFrom(value);
  filterDevs();
};
