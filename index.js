const mysql = require('promise-mysql');
const _ = require('lodash');
const viz = require('viz.js');

var dotoutput = '';

const add_to_string = string =>
  dotoutput += `${string}\n`

add_to_string('digraph wfp {');

var connection;

mysql.createConnection({
  host: 'mysql',
  user: 'root',
  password: 'root',
  database: 'wfp'
})
  .then(con => connection = con)
  .tap(connection => connection.query(`ALTER TABLE wfp ADD id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY;`))
  .tap(connection => connection.query(`DELETE FROM wfp where id = 1;`))
  .catch(e => connection)
  .then(connection =>
    connection.query(`SELECT 
    a.id as id, a.Employee_Name, a.Job_Title, a.job_title, b.id as sid
    FROM wfp a
    LEFT JOIN wfp b ON (a.Supervisor_Name = b.Employee_Name AND a.Supervisor_Name != '')
    ORDER BY a.id`))
  .each(row => add_to_string(`  ${row.id} [label="${row.Employee_Name} (${row.Job_Title})"];`))
  .each(row => {
    if (row.sid !== null) {
      add_to_string(`  ${row.id} -> ${row.sid};`)
    }
  })
  .then(() => add_to_string('}'))
  // .then(() => console.log(dotoutput))
  .then(() => console.log(viz(dotoutput, {format: "svg", totalMemory: 33554432})))
  .then(() => process.exit())