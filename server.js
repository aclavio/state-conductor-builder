const { response } = require('express');
const express = require('express');
const machines = require('./data/machines.js');

const app = express();

app.use(express.json());

app.set('port', process.env.PORT || 4000);

app.get('/api/test', (req, res) => {
  const param = req.query.q;

  if (!param) {
    res.status(400);
    res.json({
      error: 'Missing required parameter `q`',
    });
    return;
  }

  res.json({
    test: true,
  });
});

// list state machines
app.get('/api/state-machines/', (req, res) => {
  res.json(machines);
  return;
});

// get state machine by name
app.get('/api/state-machines/:name', (req, res) => {
  const name = req.params.name;
  const machine = machines[name];

  if (!machine) {
    res.status(404);
    res.json({
      error: `cannot find state machine "${name}"`,
    });
    return;
  }

  res.json(machine);
  return;
});

app.post('/api/state-machines/:name', (req, res) => {
  const name = req.params.name;
  if (!name || name.length < 1) {
    res.status(400);
    return;
  }

  console.log(req.body);
  machines[name] = req.body;

  res.status(201);
  return;
});

// get state machine status by name
app.get('/api/state-machines/:name/status', (req, res) => {
  res.status(501);
  res.write('not yet implemented');
  return;
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
