const express = require('express');
const mongoose = require('mongoose');
const { Project } = require('./model/model');
const fs = require('fs');

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.listen(3000);

/* Variables  */
let renderingProjects;
let renderingEmployees;
let renderingFiltered;
let companyNames = [];
let tasks = [];
let employee_users = [];
let employeeTry2 = [];

/* Functions */

let Passcode = (length) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const GetRequest = (getArray, fileName) => {
  try {
    getArray = JSON.parse(fs.readFileSync(fileName));
  } catch (err) {
    console.log(err);
  }
  return getArray;
}

/* Get Requests */

app.get('/', (req, res) => {
  companyNames = GetRequest(companyNames, './public/users.json');
  res.render('signup', {
    title: 'SignUp',
    companyNames,
  });
});

app.get('/signupemployee', (req, res) => {
  res.render('homepage_employee', {
    title: 'Login as Employee',
  });
});

app.get('/companylogin', (req, res) => {
  res.render('login_company', {
    title: 'Login as Company',
  });
});


app.get('/homepage/:id', (req, res) => {
  let id = req.params.id;
  const url = req.originalUrl;
  const lastPath = url.split('/').pop();
  /* We are reading the contents and then rendering all to the front end */
 
  renderingProjects = GetRequest(renderingProjects, './public/projects.json');
  renderingEmployees = GetRequest(renderingEmployees, './public/employees.json');
  employeeTry2 = GetRequest(employeeTry2, './public/usernames.json');
  companyNames = GetRequest(companyNames, './public/users.json');

  

  renderingFiltered = renderingEmployees.filter((element) => {
    return element.id === id;
  });

  let renderingFilteredProjects = renderingProjects.filter((element) => {
    return element.companyid === id;
  });

  renderingProjects.reverse();
  renderingEmployees.reverse();
  renderingFiltered.reverse();
  renderingFilteredProjects.reverse();

  res.render('index', {
    title: 'Homepage',
    renderingProjects,
    renderingEmployees,
    renderingEmployees,
    renderingFiltered,
    renderingFilteredProjects,
    companyNames,
  });
});



app.get('/employee/:id', (req, res) => {
  const url = req.originalUrl;
  const lastPath = url.split('/').pop();

  employee_users = GetRequest(employee_users, './public/usernames.json');
  companyNames = GetRequest(companyNames, './public/users.json');
  renderingProjects = GetRequest(renderingProjects, './public/projects.json');
  

  const renderingFilteredProjects = renderingProjects.filter((elem) => {
    return elem.path === lastPath;
  });

  renderingFilteredProjects.reverse();

  let found = [];
  found = employee_users.find((match) => {
    return match.id === lastPath;
  });

  res.render('homepage_e', {
    title: 'Homepage',
    employee_users,
    renderingProjects,
    renderingFilteredProjects,
    found,
  });
});

app.get('/employeelogin', (req, res) => {
  res.render('login_employee', {
    title: 'Login as Employee',
  });
});


app.get('/project/:id', (req, res) => {
  const url = req.originalUrl;
  const lastPath = url.split('/').pop();

  renderingProjects = GetRequest(renderingProjects,'./public/projects.json');
  tasks = GetRequest(tasks, './public/tasks.json');

  const foundProjects = renderingProjects.find(elem => elem.id === Number(lastPath));
  const foundTasks = tasks.filter(elem => elem.id === lastPath);
  console.log(foundTasks);

  res.render('projects', {
    renderingProjects,
    foundProjects,
    tasks,
    foundTasks,
    title: 'Project',
  });
});



/* Post Requests */

app.post('/company_validation', (req, res) => {
  const company_code = req.body.companyCodeConfirm;
  const company_username = req.body.companyInputName;

  companyNames = GetRequest(companyNames, './public/users.json');

  // validate the input data using the .find method
  const foundLoginID = companyNames.find((match) => {
    return match.id == company_code?.toString();
  });

  const foundLoginUser = companyNames.find((match) => {
    return match.companyName.toLowerCase() == company_username.toLowerCase();
  });

  if (foundLoginID && foundLoginUser) {
    res.redirect(`/homepage/${company_code}`);
    console.log('We found a match and redirected');
  } else {
    console.log('We found a match but we cannot redirect.');
  }
});

app.post('/homepage/:id', (req, res) => {
 
  companyNames = GetRequest(companyNames,'./public/users.json');

  const newCompany = {
    ...req.body,
    passcode: Passcode(6),
    id: req.params.id,
  };

  companyNames.push(newCompany);
  fs.writeFileSync(
    './public/users.json',
    JSON.stringify(companyNames),
    'utf-8'
  );
  res.redirect(`/homepage/${req.params.id}`);
});

app.post('/employee/:id', (req, res) => {

  employee_users = GetRequest(employee_users, './public/usernames.json');
  companyNames = GetRequest(companyNames, './public/users.json' );
  renderingProjects = GetRequest(renderingProjects,'./public/projects.json');


  const foundCompany = companyNames.find(
    (company) => company.id == req.body.company_code
  );

  if (foundCompany) {
    employee_users.push(req.body);
    fs.writeFileSync(
      './public/usernames.json',
      JSON.stringify(employee_users),
      'utf-8'
    );
    res.redirect(`/employee/${req.body.id}`);
  }
});

app.post('/employeeproject/:id', (req, res) => {

  employee_users = GetRequest(employee_users, './public/usernames.json');
  companyNames = GetRequest(companyNames, './public/users.json');
  renderingProjects = GetRequest(renderingProjects, './public/projects.json');

  const url = req.originalUrl;
  const lastPath = url.split('/').pop();
  console.log(lastPath);

  const foundEmployee = employee_users.find((elem) => elem.id === lastPath);
  console.log(foundEmployee);
  let newData = {
    ...req.body,
    companyid: foundEmployee.company_code,
    path: lastPath,
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US'),
  };

  console.log(newData);
  renderingProjects.push(newData);
  fs.writeFileSync(
    './public/projects.json',
    JSON.stringify(renderingProjects),
    'utf-8'
  );
});

app.post('/employee_validation', (req, res) => {
  const user_username = req.body.userName;
  const user_company_code = req.body.confirmUserPassword;


  employee_users = GetRequest(employee_users, './public/usernames.json')

  let foundLoginCode = [];
  foundLoginCode = employee_users.filter((match) => {
    return match.employee_password === user_company_code;
  });

  console.log(foundLoginCode);
  let foundLoginUser = [];
  foundLoginUser = employee_users.find((match) => {
    return match.employee_username === user_username;
  });

  console.log(foundLoginUser);

  let the_id;
  if (foundLoginCode || foundLoginUser) {
    the_id = foundLoginUser.id;
    console.log(the_id);
    res.redirect(`/employee/${the_id}`);
    console.log('We found a match and redirected');
  } else {
    console.log('We found a match but we cannot redirect.');
  }
});

app.post('/employee', (req, res) => {
 
  renderingEmployees = GetRequest(renderingEmployees, './public/employees.json')
  renderingEmployees.push(req.body);

  fs.writeFileSync(
    './public/employees.json',
    JSON.stringify(renderingEmployees),
    'utf-8'
  );
});

app.post('/project', (req, res) => {

  renderingProjects = GetRequest(renderingProjects, './public/projects.json');

  const newProject = {
    ...req.body,
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US'),
  };

  renderingProjects.push(newProject);
  fs.writeFileSync(
    './public/projects.json',
    JSON.stringify(renderingProjects),
    'utf-8'
  );
});

app.post('/tasks', (req, res) => {

  tasks = GetRequest(tasks, './public/tasks.json');

  let newTask = {
    ...req.body,
  }


  tasks.push(newTask);
  fs.writeFileSync(
    './public/tasks.json',
    JSON.stringify(tasks),
    'utf-8'
  );

})

