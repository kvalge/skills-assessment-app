const container = document.createElement('div');
container.classList.add('container');

const titleContainer = document.createElement('div');
titleContainer.classList.add('title-container');

const h1 = document.createElement('h1');
h1.innerHTML = 'Skills Assessment';
titleContainer.appendChild(h1);
container.appendChild(titleContainer);

const fieldsListUl = document.createElement('ul');
fieldsListUl.id = 'fields-list';
container.appendChild(fieldsListUl);

async function getFieldsData() {
  const response = await fetch('/data/fields.json');
  return await response.json();
}

function generateFieldList() {
  getFieldsData().then((data) => {
    fieldsListUl.innerHTML = '';
    data.fields.forEach((field) => {
      const listItem = document.createElement('li');
      const fieldContainer = document.createElement('div');
      fieldContainer.classList.add('field-container');
      
      const btn = document.createElement('button');
      btn.textContent = field.name;
      
      const skillsListUl = document.createElement('ul');
      skillsListUl.classList.add('skills-list');
      skillsListUl.style.display = 'none';
      
      field.skills.forEach((skill) => {
        const skillItem = document.createElement('li');
        skillItem.textContent = skill;
        skillsListUl.appendChild(skillItem);
      });
      
      btn.addEventListener('click', () => {
        const isVisible = skillsListUl.style.display === 'block';
        skillsListUl.style.display = isVisible ? 'none' : 'block';
      });
      
      fieldContainer.appendChild(btn);
      fieldContainer.appendChild(skillsListUl);
      listItem.appendChild(fieldContainer);
      fieldsListUl.appendChild(listItem);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  generateFieldList();
  document.body.appendChild(container);
});
