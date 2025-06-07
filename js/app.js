const container = document.createElement('div');
container.classList.add('container');

let h1 = document.createElement('h1');
h1.innerHTML = 'Skills Assessment';
container.appendChild(h1);

const fieldsListUl = document.createElement('fields-list');
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
      const btn = document.createElement('button');
      btn.textContent = field.name;

      btn.addEventListener('click', () => {
        alert(`You clicked on ${field.name}`);
        generateSkillList(field);
      });
      listItem.appendChild(btn);
      fieldsListUl.appendChild(listItem);
    });
  });
}

document.addEventListener('DOMContentLoaded', generateFieldList);

document.body.appendChild(container);
