const createElement = (tag, className = '', textContent = '') => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
};

const createButton = (text, className = '', onClick = null) => {
  const btn = createElement('button', className, text);
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
};

class SkillsApp {
  constructor() {
    this.selectedLevels = new Map();
    this.fieldsData = null;
    this.levelsData = null;
    this.container = this.createContainer();
    this.init();
  }

  async fetchData(url, cache) {
    if (cache) return cache;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
      throw error;
    }
  }

  async getFieldsData() {
    this.fieldsData = await this.fetchData('data/fields.json', this.fieldsData);
    return this.fieldsData;
  }

  async getLevelsData() {
    this.levelsData = await this.fetchData('data/levels.json', this.levelsData);
    return this.levelsData;
  }

  saveToStorage() {
    localStorage.setItem('selectedLevels', JSON.stringify([...this.selectedLevels]));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('selectedLevels');
    if (saved) {
      this.selectedLevels = new Map(JSON.parse(saved));
    }
  }

  createContainer() {
    const container = createElement('div', 'container');
    
    const titleContainer = createElement('div', 'title-container');
    titleContainer.appendChild(createElement('h1', '', 'Skills Assessment'));
    container.appendChild(titleContainer);

    const fieldsList = createElement('ul', '', '');
    fieldsList.id = 'fields-list';
    container.appendChild(fieldsList);

    return container;
  }

  createLevelCheckboxes(skill, fieldName) {
    const container = createElement('div', 'level-checkboxes');
    const key = `${fieldName}-${skill}`;
    
    this.levelsData.levels.forEach(level => {
      const label = createElement('label');
      const radio = createElement('input');
      radio.type = 'radio';
      radio.name = key;
      radio.value = level;
      radio.checked = this.selectedLevels.get(key) === level;
      
      radio.addEventListener('change', () => {
        this.selectedLevels.set(key, level);
        this.saveToStorage();
      });

      label.appendChild(radio);
      label.appendChild(document.createTextNode(level));
      container.appendChild(label);
    });

    return container;
  }

  async createSkillItem(skill, fieldName) {
    const item = createElement('li', 'skill-item');
    const name = createElement('span', '', skill);
    const checkboxes = this.createLevelCheckboxes(skill, fieldName);
    
    item.appendChild(name);
    item.appendChild(checkboxes);
    return item;
  }

  async createFieldSection(field) {
    const listItem = createElement('li');
    const container = createElement('div', 'field-container');
    
    const skillsList = createElement('ul', 'skills-list');
    skillsList.style.display = 'none';

    for (const skill of field.skills) {
      const skillItem = await this.createSkillItem(skill, field.name);
      skillsList.appendChild(skillItem);
    }

    const btn = createButton(field.name, '', () => {
      const isVisible = skillsList.style.display === 'block';
      skillsList.style.display = isVisible ? 'none' : 'block';
    });

    container.appendChild(btn);
    container.appendChild(skillsList);
    listItem.appendChild(container);
    
    return listItem;
  }

  async generateFieldList() {
    try {
      const data = await this.getFieldsData();
      const fieldsList = this.container.querySelector('#fields-list');
      fieldsList.innerHTML = '';
      
      for (const field of data.fields) {
        const fieldSection = await this.createFieldSection(field);
        fieldsList.appendChild(fieldSection);
      }
    } catch (error) {
      console.error('Error generating field list:', error);
      this.container.querySelector('#fields-list').innerHTML = 
        '<li>Error loading fields. Please refresh the page.</li>';
    }
  }

  createSummaryData() {
    const levelMap = new Map();
    
    this.selectedLevels.forEach((level, key) => {
      const [fieldName, skillName] = key.split('-');
      const fullSkillName = `${skillName} (${fieldName})`;
      
      if (!levelMap.has(level)) levelMap.set(level, []);
      levelMap.get(level).push(fullSkillName);
    });

    const levelOrder = ['Expert', 'Advanced', 'Intermediate', 'Beginner', 'None'];
    return levelOrder
      .filter(level => levelMap.has(level))
      .map(level => ({
        level,
        skills: levelMap.get(level).sort()
      }));
  }

  displaySummary() {
    this.container.querySelector('.summary-container')?.remove();
    
    const summaryData = this.createSummaryData();
    const summaryContainer = createElement('div', 'summary-container');
    
    if (summaryData.length === 0) {
      const noDataMsg = createElement('p', 'no-data-message', 
        'No skills selected yet. Please select some skill levels first.');
      summaryContainer.appendChild(noDataMsg);
    } else {
      summaryData.forEach(({ level, skills }) => {
        const section = createElement('div', 'level-section');
        const title = createElement('h2', '', `${level} (${skills.length})`);
        const list = createElement('ul');
        
        skills.forEach(skill => {
          list.appendChild(createElement('li', '', skill));
        });
        
        section.appendChild(title);
        section.appendChild(list);
        summaryContainer.appendChild(section);
      });
    }
    
    this.container.appendChild(summaryContainer);
  }

  closeAllSkillLists() {
    this.container.querySelectorAll('.skills-list').forEach(list => {
      list.style.display = 'none';
    });
  }

  async clearSelection() {
    this.selectedLevels.clear();
    localStorage.removeItem('selectedLevels');
    this.container.querySelector('.summary-container')?.remove();
    await this.generateFieldList();
  }

  createControlButtons() {
    const summaryBtn = createButton('Show Summary', 'summary-btn', () => {
      this.closeAllSkillLists();
      this.displaySummary();
    });

    const clearBtn = createButton('Clear Selection', 'clear-btn', () => {
      this.clearSelection();
    });

    summaryBtn.id = 'summary-btn';
    clearBtn.id = 'clear-btn';

    this.container.appendChild(summaryBtn);
    this.container.appendChild(clearBtn);
  }

  async init() {
    try {
      await this.getLevelsData(); // Pre-load levels data
      this.loadFromStorage();
      await this.generateFieldList();
      this.createControlButtons();
    } catch (error) {
      console.error('Error initializing app:', error);
      this.container.innerHTML = `
        <div class="error-container">
          Error loading application. Please refresh the page.
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new SkillsApp();
    document.body.appendChild(app.container);
  } catch (error) {
    console.error('Error starting application:', error);
    document.body.innerHTML = `
      <div class="error-container">
        Error loading application. Please refresh the page.
      </div>
    `;
  }
});
