var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "rootroot",
  database: "employee_tracker_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

function start() {
  inquirer
    .prompt([
      {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "Add employee",
          "Add role",
          "Add department",
          "View employees",
          "View roles",
          "View departments",
          "Quit"
        ]
      }
    ])
    .then(function(answer) {
      if (answer.action === "Add employee") {
        addEmployee();
      } else if (answer.action === "Add role") {
        addRole();
      } else if (answer.action === "Add department") {
        addDepartment();
      } else if (answer.action === "View employees") {
        viewEmployees();
      } else if (answer.action === "View roles") {
        viewRoles();
      } else if (answer.action === "View departments") {
        viewDepartments();
      } else {
        connection.end();
        console.log("The Program has ended");
      }
    });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the department name?"
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO departments SET ?",
        {
          name: answer.name
        },
        function(err) {
          console.log("The department has been added successfully!");
          start();
        }
      );
    });
}

function addRole() {
  connection.query("SELECT * FROM departments", function(err, results) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the title?"
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        },
        {
          name: "department",
          type: "rawlist",
          message: "What is the department name?",
          choices: function() {
            var departmentList = [];
            for (var i = 0; i < results.length; i++) {
              departmentList.push({
                name: results[i].name,
                value: results[i].id
              });
            }
            return departmentList;
          }
        }
      ])
      .then(function(answer) {
        connection.query(
          "INSERT INTO roles SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.department
          },

          function(err) {
            console.log("The role has been added successfully!");
            start();
          }
        );
      });
  });
}

function addEmployee() {
  connection.query("SELECT * FROM roles", function(err, results) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is the first name?"
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the last name?"
        },
        {
          name: "role",
          type: "rawlist",
          message: "What is the role?",
          choices: function() {
            var roleList = [];
            for (var i = 0; i < results.length; i++) {
              roleList.push({
                name: results[i].title,
                value: results[i].id
              });
            }
            return roleList;
          }
        }
      ])
      .then(function(answer) {
        const newEmployee = {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.role
        };

        inquirer
          .prompt([
            {
              name: "confirm",
              type: "confirm",
              message: "Does this employee have a manager?"
            }
          ])
          .then(function(manager) {
            if (manager.confirm === true) {
              addManager(newEmployee);
            } else {
              connection.query(
                "INSERT INTO employees SET ?",
                newEmployee,
                function(err) {
                  console.log("The employee has been added successfully!");
                  start();
                }
              );
            }
          });
      });
  });
}

function addManager(employee) {
  connection.query("SELECT * FROM employees", function(err, results) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "manager",
          type: "rawlist",
          message: "Who is the manager?",
          choices: function() {
            var managerList = [];
            for (var i = 0; i < results.length; i++) {
              managerList.push({
                name: results[i].first_name + " " + results[i].last_name,
                value: results[i].id
              });
            }
            return managerList;
          }
        }
      ])
      .then(function(answer) {
        employee.manager_id = answer.manager;

        connection.query("INSERT INTO employees SET ?", employee, function(
          err
        ) {
          console.log("The employee manager has been updated successfully!");
          start();
        });
      });
  });
}

function viewEmployees() {
  connection.query(
    "SELECT * FROM employees",

    function(err, results) {
      console.table(results);

      start();
    }
  );
}

function viewRoles() {
  connection.query(
    "SELECT * FROM roles",

    function(err, results) {
      console.table(results);

      start();
    }
    );
}

function viewDepartments() {
  connection.query(
    "SELECT * FROM departments",

    function(err, results) {
      console.table(results);

      start();
    }
  );
}
